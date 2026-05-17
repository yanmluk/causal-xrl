import pandas as pd
import numpy as np
import networkx as nx

import dice_ml
from dice_ml import Dice

from cxrl.lib.experience import play
from cxrl.lib.causal.infer_network import infer_from_env
from cxrl.lib.utils import convert_and_expand

class DummySklearn:
    """ Class which makes a policy function look like a sklearn model. """

    def __init__(self, pi):
        """ Constructor for the DummySklearn class. """
        self.pi = pi

    def predict_proba(self, X):
        """ Predict probability of action 
        (i.e. 1 for the action taken and 0 o.w.)

        Args:
            X: States to "predict" action on.
        
        Returns:
            A vector for each state where which contains 1 
        for the action taken and 0 o.w.
        """
        X = convert_and_expand(X).astype(float)
        
        actions = [self.pi(state_v) for state_v in X]        
        return np.array([[1.-a, a] for a in actions])
        
    def predict(self, X):
        """ Returns the predicted action for each state. """        
        proba = self.predict_proba(X)
        return(np.nonzero(proba)[1])        
    
        

class XRL:
    """ Class for handling the various components related to xrl. """        
    
    def __init__(self, env, pi, repr_names=None, **kwargs):
        """ Constructor for the XRL class. 

        Args:
            env: OpenAI style environment.
            pi: Policy / function which takes in a 
                state vector and outputs an action.
            repr_names: List of interpretable representations.
        """
        if not callable(pi) and pi is not None:
            raise TypeError("pi is expected to be function.")
        
        self.env = env
        # self.pi = DummySklearn(pi)
        self.pi = pi
        
        # infer the causal network form the environment
        self.causalG, self.scm, self.replay_buffer = infer_from_env(self.env, pi=pi, repr_names=repr_names, **kwargs)


    def local_causal_network(self, query_state):
        """ Compute the local causal network for the query instance. 

        Args:
            query_state: State vector + action.

        Returns:
            A causal graph.
        """
        if query_state.shape[0] != 1:
            raise ValueError("query_state must be a single instance.")
            
        nstates = query_state.shape[1]
        columns = query_state.columns

        localG = nx.DiGraph()
        
        causes = []
        for i in range(nstates):
            if i not in self.scm:
                continue
            
            local_causes = self.scm[i].local_treatments(query_state)
            for treat in np.nonzero(local_causes[0])[0]:
                localG.add_edge(columns[treat], columns[i])

        return localG
    
        
    def __simplify_counterfactuals(self, cf_df, query_instance, desired_action):
        """ Simplifies the dice counterfactual intstances. 

        Args:
            cf_df: Dice counterfactual dataframe.
            query_instance: State + action.
            desired_action: Counterfactual action.

        Returns:
            Simplified counterfactual dataframe.
        """
        for s in self.state_features:
            smp_cf_df = cf_df.copy()

            # test if changing the state s to query instance changes
            # the expected outcome
            smp_cf_df[s] = query_instance[s].values[0]
            pred = self.pi.predict(smp_cf_df.drop(['action'], axis=1))

            # save the changes where the prediction was the same
            cf_df.loc[pred==desired_action, s] = query_instance[s].values[0]

        return cf_df

    def __dominating_counterfactuals(self, cf_df, query_instance):
        """ Identifies counterfactuals which dominate others w.r.t. proximity. 

        Args:
            cf_df: Counterfactual dataframe.
            query_instance: Actual state.

        Returns:
            Dataframe of dominating counterfactuals.
        """
        # For each cf, identifies which states are different
        diff_cf = cf_df.drop(['action'], axis=1) == query_instance.values[0]
        
        dom = set([])
        # Group cf's by altered states
        for k, v in diff_cf.groupby(diff_cf.columns.tolist()):
            # column indices which have different states
            diff_index = np.nonzero(np.array(k)==False)[0]  
    
            # columns with different states
            cols = diff_cf.columns[diff_index]            
            cf_vals = cf_df.loc[v.index, cols]

            # center around the query instance state values
            cf_difference = cf_vals[cols] - query_instance[cols].values[0]
            cf_difference = cf_difference.drop_duplicates()

            # Group by those less than / greater than query instance
            for k1, v1 in (cf_difference < 0).groupby(cols.tolist()):
                if not isinstance(k1, list):
                    k1 = [k1]

                # cf states less than query
                lesser_cols = cf_difference.columns[k1]  

                # cf states greater than query
                greater_cols = [c for c in cf_difference.columns if c not in lesser_cols] 
            
                # get the dominated rows
                cf_lesser = cf_difference[lesser_cols]
                cf_greater = cf_difference[greater_cols]
                
                index = cf_difference.index

                # cfs closest to query instance from below
                dom_bel = index[(cf_lesser.values[:, None] <= cf_lesser.values) \
                                .all(axis=2).sum(axis=1) == 1]

                # cfs closest to query instance from above
                dom_abv = index[(cf_greater.values[:, None] >= cf_greater.values) \
                                .all(axis=2).sum(axis=1) == 1]
        
                dom = dom | set(dom_bel) | set(dom_abv)

        return cf_df.loc[dom]

    
    def counterfactual(self, query_instance, desired_action, return_score=True):
        """ Generates a list of counterfactuals for the state / action. 

        Args:
            query_instance: State vector.
            desired_action: Counterfactual action.
            return_score: Returns a local feature importance score.
            
        Returns:
            List of counterfactuals.
        """
        if 'action' in query_instance.columns:
            # desired action should not equal the observed action
            assert (desired_action != query_instance['action']).all(), \
                "desired_action must be counterfactual"
            query_instance = query_instance.drop(['action'], axis=1)

            assert query_instance.shape[0] == 1, "Expected a single instance"
            
        e1 = self.exp.generate_counterfactuals(query_instance, total_CFs=40, desired_range=None,
                                  desired_class=desired_action, posthoc_sparsity_param=None,
                                  permitted_range=None, features_to_vary="all")
        cf_df = e1.cf_examples_list[0].final_cfs_df.copy()

        cf_df = self.__simplify_counterfactuals(cf_df, query_instance, desired_action)
        cf_df = self.__dominating_counterfactuals(cf_df, query_instance)

        if return_score:
            # Get the percentage of counterfactuals for each state
            diff_sum = (cf_df.drop(['action'], axis=1) != query_instance.values[0]).sum(axis=0)
            score = (diff_sum / diff_sum.sum()).to_dict()
            return cf_df, score
            
        return cf_df
    

    def render_network(self, G):
        """ Renders a graph using networkx tools """        
        pos = nx.spring_layout(G)
        
        y_off = 0.05
        nx.draw(G, pos)
        
        pos_higher = {}
        
        for k, v in pos.items():
            pos_higher[k] = (v[0], v[1]+y_off)
            
        nx.draw_networkx_labels(G, pos_higher, {k: k for k in pos})

        
    def render_causal_network(self):
        """ Renders the causal network using networkx tools. """
        self.render_network(self.causalG)


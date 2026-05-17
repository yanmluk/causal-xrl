import networkx as nx
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn import preprocessing

from cxrl.lib.experience import play
from cxrl.lib.utils import convert_and_expand
from cxrl.lib.models import BARTRegressor

def infer_causes_ate(replay, target, verbose=False):
    """ Infers causes of the target columns from the replay data. 
    
    Args:
        replay: Replay data containing states at time t.
        target: Vector corresponding to the target state at time t+1.

    Returns:
        List of causes and model.
    """
    verbose_print = print if verbose else lambda *a, **k: None
    
    M = replay.shape[1]        
    bart = BARTRegressor()    

    # perform sample splitting for training and inference
    X_train, X_est, y_train, y_est = train_test_split(replay, target, test_size=0.5)
    
    num_cols = [c for c in range(M) if len(np.unique(replay[:, c])) > 2]
    
    
    # standardize X
    X_train[:, num_cols] = (X_train[:, num_cols] - X_train[:, num_cols].mean()) \
                          / X_train[:, num_cols].std()
    
    X_est[:, num_cols] = (X_est[:, num_cols] - X_est[:, num_cols].mean()) \
                        / X_est[:, num_cols].std()

    bart.fit(X_train, y_train)  # fit the model

    def is_significant(ate, lci, uci):
        """ Returns true if the ate is signficant """
        return lci > 0 or uci < 0

    # get significant causes for target
    #causes = [c for c in range(M) if is_significant(*bart.ATE(X_est, c))]
    causes = []
    for c in range(M):
        ate, lci, uci = bart.ATE(X_est, c, additive=(c in num_cols))

        if lci > 0 or uci < 0:
            verbose_print(c, " is a cause with ", ate, ', (', lci, ', ', uci, ')')
            causes.append(c)            
        else:
            verbose_print(c, " is a not a cause with ", ate, ', (', lci, ', ', uci, ')')

            
    return causes, bart


def infer_causes_hte(replay, target, verbose=False):
    """ Infers (possibly heterogeneous) causes of the target 
    columns from the replay data. 
    
    Args:
        replay: Replay data containing states at time t.
        target: Vector corresponding to the target state at time t+1.

    Returns:
        List of causes and model.
    """
    verbose_print = print if verbose else lambda *a, **k: None
    
    M = replay.shape[1]  
    bart = BARTRegressor()    

    # perform sample splitting for training and inference
    X_train, X_est, y_train, y_est = train_test_split(replay, target, test_size=0.3)
    
    num_cols = [c for c in range(M) if len(np.unique(replay[:, c])) > 2]

    # standardize X
    
    scaler = preprocessing.StandardScaler().fit(X_train)
    X_train_scaled = scaler.transform(X_train)
    X_train[:, num_cols] = X_train_scaled[:,num_cols]

    X_est_scaled = scaler.transform(X_est)
    X_est[:, num_cols] = X_est_scaled[:,num_cols]



    bart.fit(X_train, y_train)  # fit the model

    #causes = [c for c in range(M) if bart.is_causal_HTE(X_est, c, additive=(c in num_cols))]
    causes = []
    for c in range(M):
        if bart.is_causal_HTE(X_est, c, additive=(c in num_cols)):
            causes.append(c)
        
    return causes, bart


def infer_causes(replay, target, verbose=False):
    """ Infers causes of the target columns from the replay data. 
    
    Args:
        replay: Replay data containing states at time t.
        target: Vector corresponding to the target state at time t+1.

    Returns:
        List of causes and model.
    """
    M = replay.shape[1]    
    bart = BARTRegressor()
    # perform sample splitting for training and inference
    X_train, X_test, y_train, y_test = train_test_split(replay, target, test_size=0.5)
    
    # causes = [c for c in range(M) if bart.CITestFast(X_train, y_train, X_test, y_test, c)]
    causes = []
    single_elapsed = 0.0
    for c in range(M):
        isCause, elapsedTime = bart.CITestFast(X_train, y_train, X_test, y_test, c)
        if isCause:
            causes.append(c)
        single_elapsed += elapsedTime

    return causes, None, single_elapsed


def infer_causes_ate_barl(replay, target, nstates):
    """ Infers causes of the target columns from the replay data. 
    
    Args:
        replay: Replay data containing states at time t.
        target: Vector corresponding to the target state at time t+1.
        action_col: Index of the action column (last col by default).
    Returns:
        List of causes and model.
    """
    from ai_analyzer.lib.bayesian.barl import BARLRegressor
    M = replay.shape[1]
    
    # perform sample splitting for training and inference
    X_train, X_test, y_train, y_test = train_test_split(replay, target, test_size=0.5)
    
    barl = BARLRegressor(m=100, niter=1000, nburn=250, n_jobs=-1)
    barl.fit(X_train, y_train)

    causes = []
    for c in range(M):
        X_1 = X_test.copy()
        X_0 = X_test.copy()

        if c >= nstates:
            X_1[:, c] = 1
            X_0[:, c] = 0
        else:
            X_1[:, c] = X_1[:, c] + X_1[:, c].std()
            # X_0[:, c] = X_0[:, c].mean()
            
        ate, lci, uci = barl.effect_estimate(X_1, X_0)
        if lci > 0 or uci < 0:
            print(c, " is a cause with ", ate, ', (', lci, ', ', uci, ')')
            causes.append(c)            
        else:
            print(c, " is a not a cause with ", ate, ', (', lci, ', ', uci, ')')
        
    return causes, None


def infer_DBN(replay_buffer, repr_names=None,
              method='ate', one_hot_actions=False, repr_integration=False, verbose=False):
    """ Infers a dynamic bayesian network from the replay data. 
    
    Args:
        replay_buffer: experiences including states, actions, rewards, state_new
        states: Matrix of states at time t.
        actions: Vector of actions taken at time t.
        rewards: Vector of rewards received at time t.
        state_new: Matrix of states at time t+1.

    Returns:
        A networkx graph representing a dbn from t to t+1.
    """
    if method not in ['ate', 'expectation']:
        raise ValueError("Valid methods are 'ate' and 'expectation'")

    verbose_print = print if verbose else lambda *a, **k: None

    # ensure consistency
    states, actions, rewards, states_new = replay_buffer
    states = convert_and_expand(states).astype(float)
    actions = convert_and_expand(actions).astype(float)
    rewards= convert_and_expand(rewards).astype(float)
    states_new = convert_and_expand(states_new).astype(float)

    n_states = states.shape[1]

    if len(np.unique(actions)) > 2 and one_hot_actions:  # one hot encode actions
        actions = pd.get_dummies(actions.squeeze()).values
              
    replay_t = np.concatenate((states, actions), axis=1)[:-1,:]
    replay_tp1 = np.concatenate((states, actions), axis=1)[1:,:]
    

    n_repr = replay_t.shape[1]
   
    if repr_names is None:
        repr_names = list(range(n_repr))
    else:
        assert n_repr == len(repr_names), "Number of feature names(states and actions) must match the number of columns in the replay data " + f"n_feature_names: {len(repr_names)} != n_replay_columns: {n_repr}"


    G = nx.DiGraph()
    scm = {}  # dictionary of the structural causal models
    total_elapsed = 0.0
    for i_repr in range(n_repr):
        if repr_integration:
            target = replay_tp1[:, i_repr] - replay_t[:, i_repr]
        else:
            target = replay_tp1[:, i_repr]
            
        if method == 'ate':
            causes, model = infer_causes_hte(replay_t, target, verbose)
        else:
            causes, model, single_elapsed = infer_causes(replay_t, target, verbose)
            total_elapsed += single_elapsed
        causes_name = [repr_names[c] for c in causes]

        # verbose_print("target:", repr_names[i_repr], " causes:", causes_name)
        verbose_print(" causes:", causes_name, "->", repr_names[i_repr])
        scm[i_repr] = model
        for c in causes:
            repr_t = c
            repr_tp1 = i_repr
            if repr_names is None:
                G.add_edge(f"feature_{repr_t}_t", f"feature_{repr_tp1}_t+1")
            else:
                repr_t = repr_names[c]
                repr_tp1 = repr_names[i_repr]
                prefix_t = 'state'
                prefix_tp1 = 'state'
                if c >= n_states:
                    prefix_t = 'action'
                if i_repr >= n_states:
                    prefix_tp1 = 'action'
                G.add_edge(f"{prefix_t}_{repr_t}_t", f"{prefix_tp1}_{repr_tp1}_t+1")

           
    print(f"BART SLA elapsed time: {total_elapsed} seconds")    
    return G, scm


def DBN_to_causal(dbn):
    """ Converts a DBN to a (possibly cyclic) causal graph. 

    Args:
        dbn: Networkx graph representing a dbn.

    Returns:
        Networkx graph representing a causal network.
    """
    graph = nx.DiGraph()
    nodes = [n for n in dbn.nodes() if 't+1' not in n]
    for n in nodes:
        edges = [e[1][:-2] for e in dbn.edges(n) if e[1] != f"state_{n}_t+1"]
        for e in edges:
            graph.add_edge(n, e)

    return graph


def infer_from_env(env, pi=None, nepisodes=200, repr_names=None,
                   method='ate', repr_integration=False, 
                   decode=False, naction_apply=1, render=True,
                   one_hot_actions=False, verbose=False):
    """ Infers a causal network from an openai gym environement. 

    Args:
        env: OpenAI gym environment.
        nepisodes: Number of episodes to run.
        repr_names: Names of the interpretable representations(states and actions).
        method: Method for causal inference (ate or expectation).
        repr_integration: If true, applies integration to representations.
        decode: If true, decodes the state using the env.decode method.
        naction_apply: Number of consecutive steps to apply an action.
        render: If true, renders the last 10 episodes.
        one_hot_actions: If true, one hot encodes the actions.
    """
    verbose_print = print if verbose else lambda *a, **k: None

    states, actions, rewards, states_new = play(env, pi=pi, nepisodes=nepisodes, decode=decode,
                                                naction_apply=naction_apply,
                                                render=render)
    replay_buffer = (states, actions, rewards, states_new)
    verbose_print("experience size=", len(states))
    dbn, scm = infer_DBN(replay_buffer,repr_names, method, one_hot_actions=one_hot_actions, repr_integration=repr_integration, verbose=verbose)
    return DBN_to_causal(dbn), scm, replay_buffer

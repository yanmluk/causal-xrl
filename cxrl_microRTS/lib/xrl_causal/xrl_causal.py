from stratvis.lib.models.bart_regressor import BARTRegressor
from stratvis.lib.utils.utils import convert_and_expand

import networkx as nx
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn import preprocessing
import pandas as pd

def infer_causes_hte(states, target):
    """ Infers (possibly heterogeneous) causes of the target 
    columns from the replay data. 
    
    Args:
        states: Replay data containing states at time t.
        target: Vector corresponding to the target state at time t+1.

    Returns:
        List of causes and model.
    """
    
    M = states.shape[1]        
    bart = BARTRegressor()    

    # perform sample splitting for training and inference
    X_train, X_test, y_train, y_test = train_test_split(states, target, test_size=0.5, random_state=99)
    
    num_cols = [c for c in range(M) if len(np.unique(states[:, c])) > 2]

    # # standardize X
    # X_train[:, num_cols] = (X_train[:, num_cols] - X_train[:, num_cols].mean(axis=0)) \
    #                       / X_train[:, num_cols].std(axis=0)
    
    # X_test[:, num_cols] = (X_test[:, num_cols] - X_test[:, num_cols].mean(axis=0)) \
    #                     / X_test[:, num_cols].std(axis=0)

    scaler_train = preprocessing.StandardScaler().fit(X_train[:,num_cols])
    X_train_scaled = np.copy(X_train)
    X_train_scaled[:,num_cols] = scaler_train.transform(X_train[:,num_cols])

    scaler_test = preprocessing.StandardScaler().fit(X_test[:,num_cols])
    X_test_scaled = np.copy(X_test)
    X_test_scaled[:,num_cols] = scaler_test.transform(X_test[:,num_cols])


    # std_params = [scaler_train.mean_, scaler_train.scale_]
    

    bart.fit(X_train_scaled, y_train)  # fit the model

    causes = []
    for c in range(M):
        if bart.is_causal_HTE(X_test_scaled, c, additive=(c in num_cols)):
            causes.append(c)
        
    return causes, bart, scaler_train


def infer_causes_cit(states, target):
    """ Infers causes of the target columns from the replay data. 
    
    Args:
         states: Replay data containing states at time t.
        target: Vector corresponding to the target state at time t+1.

    Returns:
        List of causes and model.
    """
    M = states.shape[1]    
    bart = BARTRegressor()

    if len(np.unique(target))<2: # if target is a constant
        return [], None
    else:
        states = states + np.random.normal(0, 0.01, size=states.shape)
        target =  target + np.random.normal(0, 0.01, size=target.shape[0])

        X_train, X_test, y_train, y_test = train_test_split(states, target, test_size=0.5, random_state=99)

        bart.fit(X_train, y_train)
        causes = [c for c in range(M) if bart.CITestFast(X_train, y_train, X_test, y_test, c)]
        # causes = [c for c in range(M) if bart.CITestNew(X_train, y_train, X_test, y_test, c)]

        return causes, bart
    


def infer_causes_ate(states, target):
    """ Infers causes of the target 
    columns from the replay data. 
    
    Args:
        states: Replay data containing states at time t.
        target: Vector corresponding to the target state at time t+1.

    Returns:
        List of causes and model.
    """
    
    M = states.shape[1]        
    bart = BARTRegressor()    

    # perform sample splitting for training and inference
    X_train, X_test, y_train, y_test = train_test_split(states, target, test_size=0.5, random_state=99)
    
    # a non-constant column needs to be standardized
    num_cols = [c for c in range(M) if len(np.unique(states[:, c])) > 2]

    # standardize X
    scaler_train = preprocessing.StandardScaler().fit(X_train[:,num_cols])
    X_train_scaled = np.copy(X_train)
    X_train_scaled[:,num_cols] = scaler_train.transform(X_train[:,num_cols])

    scaler_test = preprocessing.StandardScaler().fit(X_test[:,num_cols])
    X_test_scaled = np.copy(X_test)
    X_test_scaled[:,num_cols] = scaler_test.transform(X_test[:,num_cols])

    

    bart.fit(X_train_scaled, y_train)  # fit the model

    # add noise to avoid integer error in R
    X_train_cit = X_train_scaled + np.random.normal(0, 0.001, size=X_train_scaled.shape)
    X_test_cit = X_test_scaled + np.random.normal(0, 0.001, size=X_test_scaled.shape)
    y_train_cit = y_train + np.random.normal(0, 0.01, size=y_train.shape)
    y_test_cit = y_test + np.random.normal(0, 0.01, size=y_test.shape)

    causes = []
    for c in range(M):
        if bart.CITestFast(X_train_cit, y_train_cit, X_test_cit, y_test_cit, c):
            causes.append(c)
        
        # if bart.is_causal_ITE(X_test_scaled, c, additive=(c in num_cols)):
        #     causes.append(c)
        
    return causes, bart, scaler_train



def infer_DBN(states, states_new, state_features=None, method='ate', state_integration=True):
    """ Infers a dynamic bayesian network from the replay data. 
    
    Args:
        states: Matrix of states at time t.
        state_new: Matrix of states at time t+1.
        state_features: Names of the states.
        method: Method for causal inference (ate, cit, or hte).
        state_integration: If true, applies integration to states.

    Returns:
        A networkx graph representing a dbn from t to t+1.
    """
    if method not in ['ate', 'cit', 'hte']:
        raise ValueError("Valid methods are 'ate', 'cit', or 'hte'")

    # ensure consistency
    states = convert_and_expand(states).astype(float)
    states_new = convert_and_expand(states_new).astype(float)

    nstate_cols = states_new.shape[1]
    assert nstate_cols == states.shape[1]  # sanity check
    if state_features is None:
        state_features = list(range(nstate_cols))

    M = states.shape[1]

    G = nx.DiGraph()
    scm = {}  # dictionary of the structural causal models
    G_scaler = {}

    for state_col in range(nstate_cols):
        print("target state = ", state_features[state_col])
        if state_integration:
            target = (states_new[:, state_col] - states[:, state_col] )
        else:
             target = states_new[:, state_col]
        
        if len(np.unique(target))<2: # if target is a constant
            causes = []
            model = None
        else:
            if method == 'ate':
                causes, model, scaler = infer_causes_ate(states, target)
            elif method == 'hte':

                causes, model, scaler = infer_causes_hte(states, target)
            else:
                causes, model = infer_causes_cit(states, target)
            
        causes_name = [state_features[c] if c < nstate_cols else f"action_{c-nstate_cols}" for c in causes]

        print("state ", state_features[state_col], " causes=", causes_name)
        scm[state_col] = model
        if scaler is not None:
            G_scaler[state_col] = scaler

        for c in causes:
            state_t = c
            state_tp1 = state_col
            if state_features is not None:
                state_t = state_features[c] if c < nstate_cols else f"action_{c-nstate_cols}"
                state_tp1 = state_features[state_col]
            G.add_edge(f"state_{state_t}_t", f"state_{state_tp1}_t+1")
    return G, scm, G_scaler


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



def local_causal_network_hte(query_state, scm, G_scaler, ignore_idxs=[], num_cols=[]):
    """ Compute the local causal network for the query instance. 

    Args:
        query_state: State vector + action.
        scm: dictionary of bartRegressor
        ignore_idxs: list of column indices that don't want to be included in the causal graph

    Returns:
        A causal graph.
    """
    if query_state.shape[0] != 1:
        raise ValueError("query_state must be a single instance.")
        
    nstates_cols = query_state.shape[1]
    columns = query_state.columns

    localG = nx.DiGraph()
    edges = []
    
    causes = []
    for i in range(nstates_cols):
        if (scm[i] is None) or (i in ignore_idxs):
            continue
        
        # standardize input
        scaler = G_scaler[i]
        X_scaled = np.copy(query_state.to_numpy())
        X_scaled[:,num_cols] = scaler.transform(X_scaled[:,num_cols])
        query_state_scaled = pd.DataFrame(X_scaled, columns=columns)
        
        local_causes = scm[i].local_treatments(query_state_scaled)
        for treat in np.nonzero(local_causes[0])[0]:
            if treat not in ignore_idxs:
                localG.add_edge(columns[treat], columns[i])
                edges.append([int(treat),int(i)])
            else:
                continue
    return localG, edges


def local_causal_network(query_state, scm, G_scaler, ignore_idxs=[], num_cols=[]):
    """ Compute the local causal network for the query instance. 

    Args:
        query_state: State vector + action.
        scm: dictionary of bartRegressor
        ignore_idxs: list of column indices that don't want to be included in the causal graph

    Returns:
        A causal graph.
    """
    if query_state.shape[0] != 1:
        raise ValueError("query_state must be a single instance.")

    nstates_cols = query_state.shape[1]
    columns = query_state.columns

    localG = nx.DiGraph()
    edges = []
    
    causes = []
    for i in range(nstates_cols):
        if (scm[i] is None) or (i in ignore_idxs):
            continue
        
        if scm[i] is not None:
            local_causes = []
            scaler = G_scaler[i]
            X_scaled = np.copy(query_state.to_numpy())
            X_scaled[:,num_cols] = scaler.transform(X_scaled[:,num_cols])
            query_state_scaled = pd.DataFrame(X_scaled, columns=columns)
            for j in range(nstates_cols):
                if scm[i].is_causal_ITE(query_state_scaled, j, additive=(j in num_cols)):
                    local_causes.append(j)
                else:
                    continue
            
            for treat in local_causes:
                if treat not in ignore_idxs:
                    localG.add_edge(columns[treat], columns[i])
                    edges.append([int(treat),int(i)])
                else:
                    continue
    return localG, edges
import networkx as nx
import numpy as np
from numpy import inf
from collections import Counter

def adjmat_to_edges(X_conn, var_cols):
    '''
    Adjacency Matrix to directed edges (from p1,p2 states at time t to p1 states only at time t+1)
    '''
    directed_edges = []
    n ,n_ = X_conn.shape
    for i in range(n):
        for j in range(n_):
            if(X_conn[i,j] == 1):
                if(var_cols[j]<6):
                    # var_cols[j]<6 make sure it's p1 states
                    directed_edges.append([var_cols[i], var_cols[j]])
                else:
                    continue
            else:
                continue
    return directed_edges


def causal_topological_layout(node_names, edges):
    '''
    Layout causal graph based on topological order
    node_names: List of strings, name of the nodes
    edges: List of tuples, local causal network edges data(edge id pair)
    '''
    # construct undirected graph without self loops
    diEdges = []
    for edge in edges:
        if(edge[0] != edge[1]):
            diEdges.append(edge)
        else:
            continue
    nx_udgraph = nx.Graph()
    nx_udgraph.add_nodes_from([i for i in range(len(node_names))])
    nx_udgraph.add_edges_from(diEdges)

    ## layout algorithm to get positions of nodes

    # construct shortest path matrix of the graph
    sp_mat = nx.floyd_warshall_numpy(nx_udgraph)
    # for nodes with 0 degree
    inf_x, inf_y = np.where(sp_mat == inf)
    sp_mat[sp_mat == inf] = -1
    # compute the position of each node where x:[0,1], y:[0,1]
    lyr_nums = np.amax(sp_mat, axis=0) + 1
    # compute x coordinates of nodes
    nodes_x =  1 - (sp_mat + 1/2) * ( 1 / lyr_nums ) 
    # set specific x position for 0 degree nodes
    nodes_x[inf_x, inf_y] = 1
    # count the num of nodes on each layer
    vertical_obj_num = []
    for i in range(len(node_names)):
        vertical_obj_num.append(dict(Counter((sp_mat.astype(int))[:,i])))

    nodes_y = np.zeros(sp_mat.shape)
    for col in range(sp_mat.shape[1]):
        current_counter = np.zeros(len(vertical_obj_num[col]))
        for i,it in enumerate(sp_mat[:,col].astype(int)):
            nodes_y[i][col] = (1 / vertical_obj_num[col][it]) * (current_counter[it] + 1/2)
            current_counter[it] += 1 

    # set specific y position for 0 degree nodes
    nodes_y[inf_x, inf_y] = 0.05   

    # nodes shown in the local graph
    active_nodes = []
    for edge in edges:
        for i in range(2):
            if edge[i] not in active_nodes:
                active_nodes.append(edge[i])
            else:
                continue
    
    
    sp_mat_active = sp_mat[:,active_nodes]
    _, col_idx = np.unravel_index(sp_mat_active.argmax(), sp_mat_active.shape)
    # index of root node
    rootIdx = active_nodes[col_idx]

    #rearrange nodes without interconnection
    iso_nd_ids = []
    for nd_id in active_nodes:
        if nodes_x[nd_id,rootIdx] == 1:
            iso_nd_ids.append(nd_id)
    for i,nd_id in enumerate(iso_nd_ids):
        if i<5:
            nodes_x[nd_id,rootIdx] = 0.1 + i*0.2
        else:
            nodes_x[nd_id,rootIdx] = 0.1 + (i-5)*0.2
            nodes_y[nd_id,rootIdx] = 0.15

    # construct nodes and edges data(with self loop edges)
    local_nodes = []     
    for nd_id in active_nodes:
        local_nodes.append({"id":int(nd_id), "name":node_names[nd_id], "x":nodes_x[nd_id,rootIdx], "y":nodes_y[nd_id,rootIdx]})
    
    local_edges = [list(edge) for edge in edges]


    return local_nodes, local_edges
    
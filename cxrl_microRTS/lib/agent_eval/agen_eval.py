import numpy as np
from scipy.spatial.distance import directed_hausdorff

utt_map = {'none': 0, 'resource':1, 'base':2, 'barrack':3, 'worker':4, 'light':5, 'heavy':6, 'ranged':7}

def get_unit_trace(step0, step1, unique_rawobs_log, unit_type, constraint):
    unit_trace = []
    for step in range(step0,step1+1):
        board_state = unique_rawobs_log[step,:]
        uot = np.array(board_state[2, :], dtype=np.int8)
        utt = np.array(board_state[3, :], dtype=np.int8)
        unit_pos = np.where(np.logical_and((utt==utt_map[unit_type]), uot==1))
        unit_coords = (np.array(unit_pos).T)
        for i in range(unit_coords.shape[0]):
            if eval(constraint):
                unit_trace.append(list(unit_coords[i,:]))
    return unit_trace


def trace_remove_standing(org_trace):
    simple_trace = []
    for i in range(1,len(org_trace)):
        if len(simple_trace) == 0:
            simple_trace.append(org_trace[0])
        else:
            if simple_trace[-1] == org_trace[i]:
                continue
            else:
                simple_trace.append(org_trace[i])

    simple_trace = np.array(simple_trace)
    return simple_trace


def get_hausdorff_dists(simple_trace, eval_unitpos_log):
    hausdorff_dist = {}
    for eval_time in eval_unitpos_log:
        intent_trace = np.array(eval_unitpos_log[eval_time])
        hausdorff_dist[eval_time] = max(directed_hausdorff(simple_trace, intent_trace)[0], directed_hausdorff(intent_trace, simple_trace)[0])
    return hausdorff_dist


def avg_min_dist(simple_trace, intent_path):
    each_ep_min = []
    for i in range(simple_trace.shape[0]):
        euclid_dist_intent = []
        for j in range(intent_path.shape[0]):
            euclid_dist = np.linalg.norm(simple_trace[i,:] - intent_path[j, :])
            euclid_dist_intent.append(euclid_dist)
        each_ep_min.append(min(euclid_dist_intent))
    return np.mean(each_ep_min)


def get_amds(simple_trace, eval_unitpos_log):
    amds = {}
    for eval_time in eval_unitpos_log:
        amd = avg_min_dist(simple_trace, np.array(eval_unitpos_log[eval_time]))
        amds[eval_time] = amd
    return amds


def count_redundant_steps(path):
    # Stack to keep track of the current path without closed loops
    stack = []
    # Dictionary to map a visited coordinate to its index in the stack
    pos = {}
    redundant_steps = 0

    for i, p in enumerate(path):
        if p in pos:
            # Loop detected
            loop_start = pos[p]
            # The length of the loop is the difference in indices on the path
            # i is the current index (second occurrence of p)
            # loop_start is the first occurrence of p
            loop_length = i - loop_start
            redundant_steps += loop_length

            # Remove all elements after loop_start from the stack
            # Keep popping until we return to the initial occurrence of p
            while len(stack) > loop_start + 1:
                popped = stack.pop()
                del pos[popped]

            # 'p' remains in stack at position loop_start
            # No need to re-add it, since we're effectively just cutting out the loop
        else:
            # If p not visited, add it to stack and pos
            stack.append(p)
            pos[p] = len(stack) - 1

    return redundant_steps
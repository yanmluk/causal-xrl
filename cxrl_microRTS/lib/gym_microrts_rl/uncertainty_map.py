import numpy as np
import torch
from collections import Counter

from stratvis.lib.gym_microrts_rl.obs_gen_xml import obs_to_xml
from stratvis.lib.gym_microrts_rl.gym_microrts_rl import RLAgent
import pathlib

PATH_FILE = open(str(pathlib.Path(__file__).parent.parent.parent.resolve()) + "/map_path.txt", 'r')
MAP_PATH = PATH_FILE.readline().strip()


def draw_counterfactual_uncertainty_map(cell_obs, board_init_config, player_urt_mat, run_times=10):
    '''
    draw action counterfactuals map by placing one unit at different positions
    cell_obs(1x5 list): observation of a single cell each dimesion represents a feature(e.g. hit points)
    '''
    uht = np.array(board_init_config[0], dtype=np.int8)
    urt = np.array(board_init_config[1], dtype=np.int8)
    uot = np.array(board_init_config[2], dtype=np.int8)
    utt = np.array(board_init_config[3], dtype=np.int8)
    uat = np.array(board_init_config[4], dtype=np.int8)
    player_urt_mat = np.array(player_urt_mat, dtype=np.int8)

    players_rsc = [0,0]
    p1_base_rows = np.where(np.multiply((utt==2).astype(int), uot)==1)[0]
    p1_base_cols = np.where(np.multiply((utt==2).astype(int), uot)==1)[1]
    if p1_base_rows>0:
        p1_base_row = p1_base_rows[0]
        p1_base_col = p1_base_cols[0]
        players_rsc[0] = player_urt_mat[p1_base_row][p1_base_col]
    p2_base_rows = np.where(np.multiply((utt==2).astype(int), uot)==2)[0]
    p2_base_cols = np.where(np.multiply((utt==2).astype(int), uot)==2)[1]
    if p2_base_rows>0:
        p2_base_row = p2_base_rows[0]
        p2_base_col = p2_base_cols[0]
        players_rsc[1] = player_urt_mat[p2_base_row][p2_base_col]
    

    invalid_coords = (np.array(utt.nonzero()).T).tolist()

    board_actions_stats = np.zeros((16,16,6))
    board_actions_log = np.zeros((16,16,run_times))
    board_gini = np.zeros((16,16))
    board_entropy = np.zeros((16,16))
    board_purity = np.zeros((16,16))

    for row in range(16):
        for col in range(16):
            if [row,col] in invalid_coords:
                board_actions_stats[row,col,:] = -1
                board_actions_log[row,col,:] = -1
                board_gini[row,col] = -1
                board_entropy[row,col] = -1
                board_purity[row,col] = -1
            else:
                # append the unit to raw observation
                uht[row,col] = cell_obs[0]
                urt[row,col] = cell_obs[1]
                uot[row,col] = cell_obs[2]
                utt[row,col] = cell_obs[3]
                uat[row,col] = cell_obs[4]

                my_obs = np.zeros((1,16,16,27))
                #utt integer to one hot encoding
                my_obs[0,:,:,13:21] = np.eye(8)[utt]
                #uot integer to one hot encoding
                my_obs[0,:,:,10:13] = np.eye(3)[uot]
                # hit points
                uh1t_obs = np.logical_or(np.logical_or(utt == 1, utt == 4), utt==7).astype(int)
                uh4t_obs = np.logical_and(utt!=0,uh1t_obs!=1).astype(int) * 4
                uht_obs = uh1t_obs + uh4t_obs
                my_obs[0,:,:,:5] = np.eye(5)[uht_obs]
                # urt(resource) integer to one hot encoding
                # clip urt into range [0,4] for observation
                urt_obs = np.clip(urt, 0, 4)
                my_obs[0,:,:,5:10] = np.eye(5)[urt_obs]
                # uat(current action) integer to one hot encoding
                my_obs[0,:,:,21:] = np.eye(6)[uat]

                # assume all hitpoints all full
                uh1t = np.logical_or(np.logical_or(utt == 1, utt == 4), utt==7).astype(int) * 1
                uh4t = np.logical_or(np.logical_or(utt == 3, utt == 5), utt==6).astype(int) * 4
                uh10t = (utt == 2).astype(int) *10
                uht = uh1t + uh4t + uh10t

                raw_obs = np.array([uht,urt,uot,utt,uat])
                
                obs_to_xml(raw_obs, players_rsc, MAP_PATH + "/counterfactual.xml")
                
                rl_agent = RLAgent(obs_=torch.Tensor(my_obs), rawobs_=raw_obs, mappath_="maps/16x16/counterfactual.xml")
                unit_action_log = np.zeros((run_times,8), dtype=np.int8)
                for i_run in range(run_times):   
                    valid_actions = rl_agent.manual_get_valid_action()
                    if valid_actions.shape[0] <1:
                        unit_action_vec = np.array([(row * 16 + col), 0, 0, 0, 0, 0, 0, 0])
                    else:
                        if valid_actions.ndim ==1:
                            unit_action_vec = valid_actions
                        else:
                            unit_action_vec = valid_actions[valid_actions[:,0] == (row * 16 + col)][0]
                    unit_action_log[i_run,:] = unit_action_vec

                # unit_action_mode = max([p[0] for p in statistics._counts(unit_action_log[:,1])])
                board_actions_stats[row,col,:] = np.array([(unit_action_log[:,1].tolist()).count(i) for i in range(6)])
                board_actions_log[row,col,:] = unit_action_log[:,1]

                board_gini[row,col] = compute_uncertainty_gini(unit_action_log[:,1])
                board_entropy[row,col] = compute_uncertainty_entropy(unit_action_log[:,1])
                board_purity[row,col] = compute_purity(unit_action_log[:,1])

    return  board_actions_stats, board_gini, board_entropy, board_purity


def compute_uncertainty_gini(action_log):
    counter = dict(Counter(action_log))
    n = len(action_log)
    p2 = 0
    for ci in counter:
        p2 += ((counter[ci])/n)**2
    return 1 - p2


def compute_uncertainty_entropy(action_log):
    counter = dict(Counter(action_log))
    k = len(counter)
    n = len(action_log)
    H = 0
    for ci in counter:
        H += -((counter[ci])/n) * (np.log((counter[ci])/n)/np.log(6))
    if k>1:
        return H / (np.log(k) / np.log(6))
    else:
        return 0


def compute_purity(action_log):
    counter = dict(Counter(action_log))
    n = len(action_log)
    max_count = max(counter.values())
    return max_count / n
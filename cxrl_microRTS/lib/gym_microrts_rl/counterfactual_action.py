from matplotlib import pyplot as plt
import matplotlib
import seaborn as sns
import numpy as np
import torch
from matplotlib.colors import ListedColormap

from stratvis.lib.gym_microrts_rl.obs_gen_xml import obs_to_xml
from stratvis.lib.gym_microrts_rl.gym_microrts_rl import RLAgent
import statistics

import pathlib

PATH_FILE = open(str(pathlib.Path(__file__).parent.parent.parent.resolve()) + "/map_path.txt", 'r')
MAP_PATH = PATH_FILE.readline().strip()


def draw_counterfactual_action_map_file(cell_obs, board_init_config, player_urt_mat, run_times=5, savefig=True, path_to_img='counterfactual_actions_map.png'):
    '''
    draw action counterfactuals map by placing one unit at different positions
    cell_obs(1x5 list): observation of a single cell each dimesion represents a feature(e.g. hit points)
    '''
    matplotlib.use('agg')
    action_dict = {0:'N', 1:'M', 2:'H', 3:'R', 4:'P', 5:'A'}
    ut_dct = {0:'Rs', 1:'Bs', 2:'Bk', 3:'Wk', 4:'Lt', 5:'Hv', 6:'Rg'}
    action_drct_dct = {0:'N', 1:'E', 2:'S', 3:'W'}

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

    board_actions_param = []
    board_actions = np.zeros((16,16))
    board_action_drct = -1 * np.ones((16,16), dtype=np.int8)
    for row in range(16):
        actions_param_row = []
        for col in range(16):
            if [row,col] in invalid_coords:
                board_actions[row,col] = -1
                actions_param_row.append('')
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
                        unit_action = unit_action_vec[1]
                    else:
                        if valid_actions.ndim ==1:
                            unit_action_vec = valid_actions
                            unit_action = unit_action_vec[1]
                        else:
                            unit_action_vec = valid_actions[valid_actions[:,0] == (row * 16 + col)][0]
                            unit_action = unit_action_vec[1]
                    unit_action_log[i_run,:] = unit_action_vec

                unit_action = max([p[0] for p in statistics._counts(unit_action_log[:,1])])
                board_actions[row,col] = unit_action
                action_idx = np.where(unit_action_log[:,1]==unit_action)[0][0]
                unit_action_vec = unit_action_log[action_idx,:]
                if unit_action == 0:
                    # if noop
                    actions_param_row.append('')
                elif unit_action == 1:
                     # if move
                     board_action_drct[row,col] = unit_action_vec[2]
                     actions_param_row.append('')
                elif unit_action == 2:
                     # if harvest
                     board_action_drct[row,col] = unit_action_vec[3]
                     actions_param_row.append('')
                elif unit_action == 3:
                     # if return
                     board_action_drct[row,col] = unit_action_vec[4]
                     actions_param_row.append('')
                elif unit_action == 4:
                     # if produce
                     board_action_drct[row,col] = unit_action_vec[5]
                     actions_param_row.append(ut_dct.get(unit_action_vec[6]))
                elif unit_action == 5:
                    # if attack
                    atk_row = int(np.floor((unit_action_vec[7])/7) -3 + row)
                    atk_col = int((unit_action_vec[7])%7 -3 +col)
                    attack_loc =  '(' + str(atk_row) +',' + str(atk_col) + ')'
                    actions_param_row.append(attack_loc)
                else:
                    actions_param_row.append('')
        board_actions_param.append(actions_param_row)

    sns.set(rc = {'figure.figsize':(12,10)})
    # can set cmap as my_cmap
    my_cmap = ListedColormap(sns.color_palette("tab10", 7))
    ax = sns.heatmap(data = board_actions, annot=board_actions_param, fmt="", linewidths=.5, linecolor='black')
    for i in range(16):
        for j in range(16):
            if board_action_drct[j,i] == 0:
                # up / north
                ax.annotate("", xy=(i+0.5,j+0.25), xytext=(i+0.5,j+0.75), arrowprops=dict(arrowstyle="->"))
            elif board_action_drct[j,i] == 1:
                # right / east
                ax.annotate("", xy=(i+0.75,j+0.5), xytext=(i+0.25,j+0.5)    , arrowprops=dict(arrowstyle="->"))
                
            elif board_action_drct[j,i] == 2:
                # down / south
                ax.annotate("", xy=(i+0.5,j+0.75), xytext=(i+0.5,j+0.25), arrowprops=dict(arrowstyle="->"))
            elif board_action_drct[j,i] == 3:
                # left/ west
                ax.annotate("", xy=(i+0.25,j+0.5), xytext=(i+0.75,j+0.5), arrowprops=dict(arrowstyle="->"))
            else:
                continue
                    
    c_bar = ax.collections[0].colorbar
    c_bar.set_ticks([-1, 0, 1, 2, 3, 4, 5])
    c_bar.set_ticklabels(['Taken', 'NOOP', 'move', 'harvest', 'return', 'produce', 'attack'])
    plt.title('Counterfactual actions', fontsize =20)
    if savefig:
        plt.savefig(path_to_img)
    return path_to_img



def draw_counterfactual_action_map(cell_obs, board_init_config, player_urt_mat, run_times=5):
    '''
    draw action counterfactuals map by placing one unit at different positions
    cell_obs(1x5 list): observation of a single cell each dimesion represents a feature(e.g. hit points)
    '''

    action_dict = {0:'N', 1:'M', 2:'H', 3:'R', 4:'P', 5:'A'}
    ut_dct = {0:'Rs', 1:'Bs', 2:'Bk', 3:'Wk', 4:'Lt', 5:'Hv', 6:'Rg'}
    action_drct_dct = {0:'N', 1:'E', 2:'S', 3:'W'}

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

    board_actions = np.zeros((16,16))
    board_action_drct = -1 * np.ones((16,16), dtype=np.int8)
    # new
    board_action_prdc_obj = -1 * np.ones((16,16), dtype=np.int8)
    board_action_atk_row = -1 * np.ones((16,16), dtype=np.int8)
    board_action_atk_col = -1 * np.ones((16,16), dtype=np.int8)

    for row in range(16):
        actions_param_row = []
        for col in range(16):
            if [row,col] in invalid_coords:
                # if cell has unit already
                # new
                # board_actions_log[row,col,:] = -1
                board_actions[row,col] = -1
                actions_param_row.append('')
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
                        unit_action = unit_action_vec[1]
                    else:
                        if valid_actions.ndim ==1:
                            unit_action_vec = valid_actions
                            unit_action = unit_action_vec[1]
                        else:
                            unit_action_vec = valid_actions[valid_actions[:,0] == (row * 16 + col)][0]
                            unit_action = unit_action_vec[1]
                    unit_action_log[i_run,:] = unit_action_vec

                unit_action = max([p[0] for p in statistics._counts(unit_action_log[:,1])])
                board_actions[row,col] = unit_action
                action_idx = np.where(unit_action_log[:,1]==unit_action)[0][0]
                unit_action_vec = unit_action_log[action_idx,:]
                if unit_action == 0:
                    # if noop
                    pass
                elif unit_action == 1:
                     # if move
                     board_action_drct[row,col] = unit_action_vec[2]
                elif unit_action == 2:
                     # if harvest
                     board_action_drct[row,col] = unit_action_vec[3]
                elif unit_action == 3:
                     # if return
                     board_action_drct[row,col] = unit_action_vec[4]
                elif unit_action == 4:
                     # if produce
                     board_action_drct[row,col] = unit_action_vec[5]
                    #  board_action_prdc_obj[row,col] = ut_dct.get(unit_action_vec[6])
                     board_action_prdc_obj[row,col] = unit_action_vec[6]
                elif unit_action == 5:
                    # if attack
                    atk_row = int(np.floor((unit_action_vec[7])/7) -3 + row)
                    atk_col = int((unit_action_vec[7])%7 -3 +col)
                    board_action_atk_row[row,col] = atk_row
                    board_action_atk_col[row,col] = atk_col
                else:
                    pass


    # sns.set(rc = {'figure.figsize':(12,10)})
    # # can set cmap as my_cmap
    # my_cmap = ListedColormap(sns.color_palette("tab10", 7))
    # ax = sns.heatmap(data = board_actions, annot=board_actions_param, fmt="", linewidths=.5, linecolor='black')
    # for i in range(16):
    #     for j in range(16):
    #         if board_action_drct[j,i] == 0:
    #             # up / north
    #             ax.annotate("", xy=(i+0.5,j+0.25), xytext=(i+0.5,j+0.75), arrowprops=dict(arrowstyle="->"))
    #         elif board_action_drct[j,i] == 1:
    #             # right / east
    #             ax.annotate("", xy=(i+0.75,j+0.5), xytext=(i+0.25,j+0.5)    , arrowprops=dict(arrowstyle="->"))
                
    #         elif board_action_drct[j,i] == 2:
    #             # down / south
    #             ax.annotate("", xy=(i+0.5,j+0.75), xytext=(i+0.5,j+0.25), arrowprops=dict(arrowstyle="->"))
    #         elif board_action_drct[j,i] == 3:
    #             # left/ west
    #             ax.annotate("", xy=(i+0.25,j+0.5), xytext=(i+0.75,j+0.5), arrowprops=dict(arrowstyle="->"))
    #         else:
    #             continue
                    
    # c_bar = ax.collections[0].colorbar
    # c_bar.set_ticks([-1, 0, 1, 2, 3, 4, 5])
    # c_bar.set_ticklabels(['Taken', 'NOOP', 'move', 'harvest', 'return', 'produce', 'attack'])
    # plt.title('Counterfactual actions', fontsize =20)
                
    # serialize data
    cam_data = [board_actions, board_action_drct, board_action_prdc_obj, board_action_atk_row, board_action_atk_col]
    return  cam_data

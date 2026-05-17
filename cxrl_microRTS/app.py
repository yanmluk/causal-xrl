from flask import Flask, render_template, request, jsonify
from stratvis.lib.gym_microrts_rl.gym_microrts_rl import RLAgent
from stratvis.lib.gym_microrts_rl.obs_gen_xml import obs_to_xml
from stratvis.lib.gym_microrts_rl.xml_to_obs import xml_to_obs
from stratvis.lib.gym_microrts_rl.counterfactual_action import draw_counterfactual_action_map, draw_counterfactual_action_map_file
from stratvis.lib.gym_microrts_rl.uncertainty_map import draw_counterfactual_uncertainty_map
from stratvis.lib.gym_microrts_rl.utils import *
from stratvis.lib.gym_microrts_rl.gym_microrts_rl import unit_ctf_steps, unit_intention_analysis
from stratvis.lib.causal_layout.causal_layout import causal_topological_layout
from stratvis.lib.xrl_causal.xrl_causal import local_causal_network, local_causal_network_hte
import rpy2.robjects.numpy2ri
import pickle


import numpy as np
import torch
import pandas as pd
import pathlib

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

PATH_FILE = open(str(pathlib.Path(__file__).parent.resolve()) + "/map_path.txt", 'r')
MAP_PATH = PATH_FILE.readline().strip()

@app.route('/get_board_state', methods=['GET'])
def get_board_state():
    rl_agent = RLAgent()
    utt = rl_agent.get_utt_raw()
    uot = rl_agent.get_uot_raw()
    urt = rl_agent.get_urt_raw()
    uht = rl_agent.get_uht_raw()
    uat = rl_agent.get_uat_raw()
    utt_dict = {}
    for i in range(1,8):
        xs,ys = (utt == i).nonzero()
        utt_dict[i] = np.stack((xs, ys), axis=-1).tolist()
    # utt = utt.tolist()
    uot = uot.tolist()
    urt = urt.tolist()
    uht = uht.tolist()
    uat = uat.tolist()
    board_state = {"utt":utt_dict, "uot":uot, "urt":urt, "uht":uht, "uat":uat}

    return jsonify(board_state)


@app.route('/read_xml_map', methods=['POST'])
def read_xml_map():
    post_data = request.get_json(force=True)
    xml_content = post_data['content']
    raw_obs, player_urt_mat = xml_to_obs(xml_content)

    return jsonify({"raw_obs":raw_obs.tolist(), "player_urt_mat":player_urt_mat.tolist()})


@app.route('/download_map', methods=['POST'])
def download_map():
    post_data = request.get_json(force=True)
    board_state = post_data['board_state']
    player_urt_mat = post_data['player_urt_mat']
    map_name = post_data['map_name']
    
    raw_obs = np.array(board_state)

    urt = np.array(board_state[1])
    uot = np.array(board_state[2])
    utt = np.array(board_state[3])
    uat = np.array(board_state[4])
    players_rsc = get_players_rsc(player_urt_mat, utt, uot)

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

    xml_map_path = "./maps/" +map_name+".xml"
    obs_to_xml(raw_obs, players_rsc, xml_map_path)

    return jsonify({})


@app.route('/runenv_steps', methods=['POST'])
def runenv_steps():
    post_data = request.get_json(force=True)
    num_steps = post_data['num_steps']
    board_state = post_data['board_state']
    player_urt_mat = post_data['player_urt_mat']
    raw_obs = np.array(board_state)

    urt = np.array(board_state[1])
    uot = np.array(board_state[2])
    utt = np.array(board_state[3])
    uat = np.array(board_state[4])
    players_rsc = get_players_rsc(player_urt_mat, utt, uot)

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

    xml_map_path = MAP_PATH + "/custom.xml"
    obs_to_xml(raw_obs, players_rsc, xml_map_path)
    
    rl_agent = RLAgent(obs_=torch.Tensor(my_obs), rawobs_=raw_obs, mappath_="maps/16x16/custom.xml")
    unique_rawobs_log, _ , player_urt_log = rl_agent.run_num_steps(num_steps, player_urt_mat, False)
    return jsonify({"rawobs_log":unique_rawobs_log.tolist(), "player_urt_log":player_urt_log.tolist()})


@app.route('/run_env_episode', methods=['POST'])
def run_env_episode():
    post_data = request.get_json(force=True)
    board_state = post_data['board_state']
    player_urt_mat = post_data['player_urt_mat']
    raw_obs = np.array(board_state)
    # np.savez('./data/init_board_state.npz', raw_obs=raw_obs, player_urt_mat=player_urt_mat)

    # urt = np.array(board_state[1])
    # uot = np.array(board_state[2])
    # utt = np.array(board_state[3])
    # uat = np.array(board_state[4])
    # players_rsc = get_players_rsc(player_urt_mat, utt, uot)

    # my_obs = np.zeros((1,16,16,27))
    # #utt integer to one hot encoding
    # my_obs[0,:,:,13:21] = np.eye(8)[utt]
    # #uot integer to one hot encoding
    # my_obs[0,:,:,10:13] = np.eye(3)[uot]
    # # hit points
    # uh1t_obs = np.logical_or(np.logical_or(utt == 1, utt == 4), utt==7).astype(int)
    # uh4t_obs = np.logical_and(utt!=0,uh1t_obs!=1).astype(int) * 4
    # uht_obs = uh1t_obs + uh4t_obs
    # my_obs[0,:,:,:5] = np.eye(5)[uht_obs]
    # # urt(resource) integer to one hot encoding
    # # clip urt into range [0,4] for observation
    # urt_obs = np.clip(urt, 0, 4)
    # my_obs[0,:,:,5:10] = np.eye(5)[urt_obs]
    # # uat(current action) integer to one hot encoding
    # my_obs[0,:,:,21:] = np.eye(6)[uat]

    # xml_map_path = MAP_PATH + "/custom.xml"
    # obs_to_xml(raw_obs, players_rsc, xml_map_path)
    
    # rl_agent = RLAgent(obs_=torch.Tensor(my_obs), rawobs_=raw_obs, mappath_="maps/16x16/custom.xml", capVideo_=False)
    # unique_rawobs_log, unique_gamesteps, player_urt_log = rl_agent.run_an_episode(player_urt_mat, capture_frame=False)

    # np.savez('data/ep_play_front_data.npz', unique_rawobs_log=unique_rawobs_log, unique_gamesteps=unique_gamesteps, player_urt_log=player_urt_log)
    npzfile = np.load('data/ep_play_front_data.npz')
    unique_rawobs_log = npzfile['unique_rawobs_log']
    unique_gamesteps = npzfile['unique_gamesteps']
    player_urt_log = npzfile['player_urt_log']


    return jsonify({"rawobs_log":unique_rawobs_log.tolist(), "unique_gamesteps":unique_gamesteps.tolist(),"player_urt_log":player_urt_log.tolist()})


@app.route('/run_ctf_steps', methods=['POST'])
def run_ctf_steps():
    post_data = request.get_json(force=True)
    num_steps = post_data['num_steps']
    board_state = post_data['board_state']
    player_urt_mat = post_data['player_urt_mat']
    raw_obs = np.array(board_state)

    urt = np.array(board_state[1])
    uot = np.array(board_state[2])
    utt = np.array(board_state[3])
    uat = np.array(board_state[4])
    players_rsc = get_players_rsc(player_urt_mat, utt, uot)

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

    xml_map_path = MAP_PATH + "/custom.xml"
    obs_to_xml(raw_obs, players_rsc, xml_map_path)
    
    rl_agent = RLAgent(obs_=torch.Tensor(my_obs), rawobs_=raw_obs, mappath_="maps/16x16/custom.xml")
    unique_rawobs_log = rl_agent.run_ctf_steps(num_steps, False)
    return jsonify({"rawobs_log":unique_rawobs_log.tolist()})


@app.route('/unit_run_ctf_steps', methods=['POST'])
def unit_run_ctf_steps():
    post_data = request.get_json(force=True)
    num_steps = post_data['num_steps']
    board_state = post_data['board_state']
    player_urt_mat = post_data['player_urt_mat']
    unit_pos = post_data['unit_pos']

    rawobs_log, player_urt_log, unitpos_log, gamestep, current_action = unit_ctf_steps(board_state, unit_pos, player_urt_mat, num_steps)
    for i in range(len(rawobs_log)):
        print("gamestep", (i), (unitpos_log[i]))
    unit_ctf_data = {"rawobs_log":rawobs_log.tolist(), "player_urt_log":player_urt_log.tolist(), "unitpos_log":unitpos_log, "gamestep":gamestep, "current_action":current_action.tolist()}

    return jsonify(unit_ctf_data)


@app.route('/unit_intention_eval', methods=['POST'])
def unit_intention_eval():
    post_data = request.get_json(force=True)
    board_state = post_data['board_state']
    player_urt_mat = post_data['player_urt_mat']
    unit_pos = post_data['unit_pos']

    eval_unitpos_log, eval_rawobs_log, eval_playerurt_log, eval_action_log, eval_steps_taken = unit_intention_analysis(board_state, unit_pos, player_urt_mat, 20, 10)
    # with open('./data/eval_analysis.pickle', 'wb') as f:
    #     pickle.dump([eval_unitpos_log, eval_rawobs_log, eval_playerurt_log, eval_action_log, eval_steps_taken], f, protocol=pickle.HIGHEST_PROTOCOL)
    perturb_unitpos_log = {}

    f = lambda x: max([len(y) for y in x])
    max_step = f(eval_unitpos_log.values())

    for key in eval_unitpos_log.keys():
        if key<6:
            np.random.seed(99)
            path = np.array(eval_unitpos_log[key])
            noise = np.random.normal(scale=0.03, size=(6, path.shape[0]-1, 2))
            perturb_path = np.zeros((2*path.shape[0]-1, 2))
            for i in range(path.shape[0]):
                perturb_path[2*i,:] = path[i,:]
                if i<path.shape[0]-1:
                    perturb_path[2*i+1,:] = (path[i,:] + path[i+1,:])/2 + noise[key, i,:]

            
            
            # perturb_path = np.zeros(path.shape)
            # perturb_path[0,:] = path[0,:]
            # perturb_path[-1,:] = path[-1,:]
            # perturb_path[1:-1] =  path[1:-1,:] + noise

            perturb_unitpos_log[key] = (perturb_path).tolist()
        else:
            continue

    # eval_data = {"eval_rawobs_log":eval_rawobs_log, "eval_playerurt_log":eval_playerurt_log, "eval_unitpos_log":eval_unitpos_log, "eval_action_log":eval_action_log}

    return jsonify({"eval_unitpos_log":perturb_unitpos_log, "max_step": max_step})



@app.route('/utt_to_uht', methods=['POST'])
def utt_to_uht():
    post_data = request.get_json(force=True)
    utt = post_data['utt']
    utt = np.array(utt).astype(int)
    uh1t = np.logical_or(np.logical_or(utt == 1, utt == 4), utt==7).astype(int) * 1
    uh4t = np.logical_or(np.logical_or(utt == 3, utt == 5), utt==6).astype(int) * 4
    uh10t = (utt == 2).astype(int) *10
    uht = uh1t + uh4t + uh10t
    uht = uht.tolist()

    return jsonify({"uht":uht})


@app.route('/query_counterfactual_map', methods=['POST'])
def query_counterfactual_map():
    post_data = request.get_json(force=True)
    cell_obs = post_data['cell_obs']
    board_state = post_data['board_state']
    player_urt_mat = post_data['player_urt_mat']
    cntrf_map_path = draw_counterfactual_action_map_file(cell_obs=cell_obs, board_init_config=board_state, player_urt_mat=player_urt_mat)

    return jsonify({"cntrf_map_path":cntrf_map_path})


@app.route('/get_counterfactual_map', methods=['POST'])
def get_counterfactual_map():
    post_data = request.get_json(force=True)
    cell_obs = post_data['cell_obs']
    board_state = post_data['board_state']
    player_urt_mat = post_data['player_urt_mat']
    cam_data = draw_counterfactual_action_map(cell_obs=cell_obs, board_init_config=board_state, player_urt_mat=player_urt_mat)
    board_actions = cam_data[0].tolist()
    board_action_drct = cam_data[1].tolist()
    board_action_prdc_obj = cam_data[2].tolist()
    board_action_atk_row = cam_data[3].tolist()
    board_action_atk_col = cam_data[4].tolist()
    return jsonify({"board_actions":board_actions, "board_action_drct":board_action_drct, "board_action_prdc_obj":board_action_prdc_obj, "board_action_atk_row":board_action_atk_row, "board_action_atk_col":board_action_atk_col})


@app.route('/get_uncertainty_map', methods=['POST'])
def get_uncertainty_map():
    post_data = request.get_json(force=True)
    cell_obs = post_data['cell_obs']
    board_state = post_data['board_state']
    player_urt_mat = post_data['player_urt_mat']
    board_actions_stats, board_gini, board_entropy, board_purity = draw_counterfactual_uncertainty_map(cell_obs=cell_obs, board_init_config=board_state, player_urt_mat=player_urt_mat)
    board_actions_stats, board_gini, board_entropy, board_purity = board_actions_stats.tolist(), board_gini.tolist(), board_entropy.tolist(), board_purity.tolist()
    return jsonify({"board_actions_stats":board_actions_stats, "board_gini":board_gini, "board_entropy":board_entropy, "board_purity":board_purity})



@app.route('/get_p1unit_pos', methods=['POST'])
def get_p1unit_pos():
    post_data = request.get_json(force=True)
    board_states = post_data['board_states']
    board_state0 = board_states[0]
    board_state1 = board_states[1]

    uot0 = np.array(board_state0[2])
    utt0 = np.array(board_state0[3])
    uot1 = np.array(board_state1[2])
    utt1 = np.array(board_state1[3])

    units_coords0 = np.where(np.logical_and((utt0>=4), uot0==1))
    units_coords1 = np.where(np.logical_and((utt1>=4), uot1==1))
    unit_row0 = 0
    unit_col0 = 0
    unit_row1 = 0
    unit_col1 = 0
    if units_coords0[0]>0:
        unit_row0 = units_coords0[0][0]
        unit_col0 = units_coords0[1][0]
    if units_coords1[0]>0:
        unit_row1 = units_coords1[0][0]
        unit_col1 = units_coords1[1][0]
    unit_coords = np.array([[unit_row0, unit_col0],[unit_row1, unit_col1]])
    unit_coords = unit_coords.tolist()

    return jsonify({"unit_coords":unit_coords})


@app.route('/find_p1_action', methods=['POST'])
def find_p1_action():
    post_data = request.get_json(force=True)
    board_state = post_data['board_state']
    valid_actions = post_data['valid_actions']
    valid_actions = np.array(valid_actions)
    action_srcs = valid_actions[:,0]
    print("action_srcs", action_srcs)

    uot = np.array(board_state[2])
    utt = np.array(board_state[3])
    unit_coords = np.where(np.logical_and((utt>=4), uot==1))
    print("unit_coords", unit_coords)
    valid_action_idx = -1
    if unit_coords[0]>0:
        for i in range(len(unit_coords[0])):
            unit_row = unit_coords[0][i]
            unit_col = unit_coords[1][i]
            print("unitrowcol",unit_row,unit_col)
            unit_src = unit_row * 16 + unit_col
            if unit_src in action_srcs:
                valid_action_idx = np.where(action_srcs==unit_src)[0][0]
            else:
                continue
        print("valid_action_idx",valid_action_idx)
    if valid_action_idx == -1:
        return jsonify({"p1_action":[]})
    else:
        p1_action = valid_actions[valid_action_idx,:].tolist()
        return jsonify({"p1_action":p1_action})



@app.route('/compute_global_causal', methods=['GET'])
def compute_global_causal():
    #load episode strategy states
    global strategy_states
    npzfile = np.load('data/strategy_state_epwt.npz')
    strategy_states = npzfile['strategy_states'].astype(np.float64)
    #load learned bart models
    rpy2.robjects.numpy2ri.activate()
    global scm_hte
    global G_scaler_hte
    with open('./data/scm500_hte.pickle', "rb") as input_file:
        scm_hte = pickle.load(input_file)
    with open('./data/scaler500_hte.pickle', "rb") as input_file2:
        G_scaler_hte = pickle.load(input_file2)
    
    return jsonify({"error_code":"0"}) if isinstance(scm_hte, dict) else jsonify({"error_code":"1"})


@app.route('/get_local_causal', methods=['POST'])
def get_local_causal():
    post_data = request.get_json(force=True)
    step_id = post_data['step_id']

    num_cols_hte = [0, 1, 2, 3, 4, 5, 8, 10, 11, 12]
    # num_cols_hte = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12]
    state_features = ["base1", "barrack1", "worker1", "light1", "heavy1", "ranged1", "base2", "barrack2", "worker2", "light2", "heavy2", "ranged2", "timestep"]
    state_features_wot = state_features[:-1]

    X_query = strategy_states[step_id:step_id+1].astype(float)
    query_state = pd.DataFrame(X_query, columns=state_features)
    localG, edges_data = local_causal_network_hte(query_state, scm_hte, G_scaler_hte, [12], num_cols_hte)

    effect_data = []

    for i,edge in enumerate(edges_data):
        cs_idx = int(edge[0])
        otc_idx = int(edge[1])

        scaler = G_scaler_hte[otc_idx]
        X_scaled = np.copy(query_state.to_numpy())
        X_scaled[:,num_cols_hte] = scaler.transform(X_scaled[:,num_cols_hte])
        query_state_scaled = pd.DataFrame(X_scaled, columns=query_state.columns)

        effect = scm_hte[otc_idx].ATE(query_state_scaled,cs_idx, additive=(cs_idx in num_cols_hte))[0]
        effect_data.append(effect)

    assert len(effect_data) == len(edges_data)

    local_nodes, local_edges = causal_topological_layout(state_features_wot, edges_data)

    
    # ntwrk_data = {"nodes":local_nodes, "edges":nonzero_local_edges, "effect":nonzero_effect_data}
    ntwrk_data = {"nodes":local_nodes, "edges":local_edges, "effect":effect_data}

    return jsonify(ntwrk_data)



@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)

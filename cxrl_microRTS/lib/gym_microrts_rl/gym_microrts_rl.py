'''
Import packages
'''
import torch
import torch.nn as nn

import numpy as np
import gym
import gym_microrts
from gym_microrts.envs.vec_env import MicroRTSGridModeVecEnv, MicroRTSVecEnv
from gym_microrts import microrts_ai
from gym.spaces import MultiDiscrete
import pickle
import random
from stable_baselines3.common.vec_env import VecEnvWrapper
from  stratvis.lib.gym_microrts_rl.env_tools import VecMonitor, MicroRTSStatsRecorder, MicroRTSRawObsRecorder, CategoricalMasked, layer_init, save_frame, VecVideoRecorder


from stratvis.lib.gym_microrts_rl.utils import players_rsc_to_urtmat, get_players_rsc, rawobs_to_state
from jpype.imports import registerDomain

'''
Define some args to setup the env
'''

# algorithm_bot name
exp_name = 'ppo_coacai_gridnet'
# using device(cuda or cpu)
use_device = 'cuda' if torch.cuda.is_available() else 'cpu'
# whether use gpu
cuda = True
# whether record video
capture_video = False
# whether save each frame
capture_frame = False

# the number of steps per game environment
num_steps = 256
# the number of bot game environment
num_eval_runs = 1
# path to model file
agent_model_path = 'lib/gym_microrts_rl/trained_models/ppo_gridnet_coacai/agent-3.pt'
# the maximum number of game steps in microrts
max_steps = 4000
# seed number
seed = 5
# # experiment name
# experiment_name = f"{exp_name}__{seed}__{int(time.time())}"

# define the device
device = torch.device(use_device)
# seeding
random.seed(seed)
np.random.seed(seed)
torch.manual_seed(seed)
# for reproducible experiment 
torch.backends.cudnn.deterministic = True
# coacAI is the 1st place in 2020's micro-rts bots competition
all_ais = {
    "coacAI": microrts_ai.coacAI
}
ai_names, ais = list(all_ais.keys()) ,list(all_ais.values())
ai_match_stats = dict(zip(ai_names, np.zeros((len(ais), 3))))
num_envs = len(ais)
ai_envs = []

'''
Define the agent
'''
class Agent(nn.Module):
    def __init__(self, mapsize=16*16, nvec_sum=78):
        super(Agent, self).__init__()
        self.mapsize = mapsize
        self.nvec_sum = nvec_sum
        self.network = nn.Sequential(
            layer_init(nn.Conv2d(27, 16, kernel_size=3, stride=2)),
            nn.ReLU(),
            layer_init(nn.Conv2d(16, 32, kernel_size=2)),
            nn.ReLU(),
            nn.Flatten(),
            layer_init(nn.Linear(32*6*6, 256)),
            nn.ReLU(),)
        self.actor = layer_init(nn.Linear(256, self.mapsize*nvec_sum), std=0.01)
        self.critic = layer_init(nn.Linear(256, 1), std=1)

    def forward(self, x):
        return self.network(x.permute((0, 3, 1, 2))) # "bhwc" -> "bchw"

    def get_action(self, x, action=None, invalid_action_masks=None, envs=None):
        logits = self.actor(self.forward(x))
        grid_logits = logits.view(-1, envs.action_space.nvec[1:].sum())
        split_logits = torch.split(grid_logits, envs.action_space.nvec[1:].tolist(), dim=1)
        
        if action is None:
            invalid_action_masks = torch.tensor(np.array(envs.vec_client.getMasks(0))).to(device)
            invalid_action_masks = invalid_action_masks.view(-1,invalid_action_masks.shape[-1])
            split_invalid_action_masks = torch.split(invalid_action_masks[:,1:], envs.action_space.nvec[1:].tolist(), dim=1)
            multi_categoricals = [CategoricalMasked(logits=logits, masks=iam) for (logits, iam) in zip(split_logits, split_invalid_action_masks)]
            print("multi_categoricals", multi_categoricals)
            action = torch.stack([categorical.sample() for categorical in multi_categoricals])
        else:
            invalid_action_masks = invalid_action_masks.view(-1,invalid_action_masks.shape[-1])
            action = action.view(-1,action.shape[-1]).T
            split_invalid_action_masks = torch.split(invalid_action_masks[:,1:], envs.action_space.nvec[1:].tolist(), dim=1)
            multi_categoricals = [CategoricalMasked(logits=logits, masks=iam) for (logits, iam) in zip(split_logits, split_invalid_action_masks)]
        logprob = torch.stack([categorical.log_prob(a) for a, categorical in zip(action, multi_categoricals)])
        entropy = torch.stack([categorical.entropy() for categorical in multi_categoricals])
        num_predicted_parameters = len(envs.action_space.nvec) - 1
        logprob = logprob.T.view(-1, 256, num_predicted_parameters)
        entropy = entropy.T.view(-1, 256, num_predicted_parameters)
        action = action.T.view(-1, 256, num_predicted_parameters)
        invalid_action_masks = invalid_action_masks.view(-1, 256, envs.action_space.nvec[1:].sum()+1)
        return action, logprob.sum(1).sum(1), entropy.sum(1).sum(1), invalid_action_masks

    def get_value(self, x):
        return self.critic(self.forward(x))

'''
Load the trained agent
'''
agent1 = Agent().to(device)
agent1.load_state_dict(torch.load(agent_model_path, map_location=device))
agent1.eval()

'''
geneate mask based on observation
'''
def mask_generator(obs):
    invalid_action_mask = np.array([[[0] * 79] * 256])
    for i in range(16):
        for j in range(16):
            # whether the unit belongs to player1(1 if true else 0)
            p1_flag = obs[0][i][j][11]
            # unit type(integer)
            unit = np.argmax(obs[0][i][j][13:21])
            if (unit>1) and (p1_flag==1):
                invalid_action_mask[0][16 * i + j][0] = 1
            else:
                continue
    return torch.Tensor(invalid_action_mask)


class RLAgent():

    '''Trained reinforcement learning agent where one can query for the action'''
    def __init__(self, obs_, rawobs_, mappath_, agent_=agent1, mapsize_ = 16*16, capVideo_=False, videoName_=""):
        self.obs = obs_
        self.rawobs = rawobs_
        self.mappath = mappath_
        self.agent = agent_
        self.mapsize = mapsize_
        self.capVideo = capVideo_
        self.videoName = videoName_

        '''
        Define the game environment
        '''
        envs = MicroRTSGridModeVecEnv(
            num_bot_envs=1,
            num_selfplay_envs=0,
            max_steps=max_steps,
            render_theme=2,
            ai2s=[ais[0]],
            map_path= self.mappath,
            reward_weight=np.array([10.0, 1.0, 1.0, 0.2, 1.0, 4.0])
        )
        envs = MicroRTSRawObsRecorder(envs)
        envs = MicroRTSStatsRecorder(envs)
        envs = VecMonitor(envs)
        if (self.capVideo):
            # envs = VecVideoRecorder(envs, f'videos',
            #                     record_video_trigger=lambda x: x % 4000 == 0, video_length=2000)
            envs = VecVideoRecorder(envs, f'videos',
                    record_video_trigger=lambda x: x % 40000 == 0, video_length=20000, video_name=self.videoName)

        self.envs = envs


    def get_valid_action(self):
        ''''
        get valid actions by query the agent with input observation 
        '''
        with torch.no_grad():
            action, _, _, _ = (self.agent).get_action(self.obs, envs=self.envs)

            real_action = torch.cat([torch.stack([torch.arange(0, self.mapsize, device=device) for i in range(self.envs.num_envs)]).unsqueeze(2), action], 2)
            real_action = real_action.cpu().numpy()
            invalid_action_mask = mask_generator(self.obs)
            valid_actions = real_action[invalid_action_mask[:,:,0].bool().cpu().numpy()]
        return valid_actions


    def manual_get_valid_action(self):

        next_obs, raw_obs = self.envs.reset()
        raw_obs = np.squeeze(raw_obs)
        next_obs = torch.Tensor(next_obs).to(device)
        #sync observation with xml map
        self.rawobs = raw_obs
        self.obs = next_obs


        ''''
        get valid actions by query the agent with input observation 
        '''
        with torch.no_grad():
            action, _, _, invalid_action_mask = (self.agent).get_action(self.obs, envs=self.envs)

            real_action = torch.cat([torch.stack([torch.arange(0, self.mapsize, device=device) for i in range(self.envs.num_envs)]).unsqueeze(2), action], 2)
            real_action = real_action.cpu().numpy()
            # invalid_action_mask = mask_generator(self.obs)
            valid_player_actions = real_action[invalid_action_mask[:,:,0].bool().cpu().numpy()]
            # valid_actions = [] 
            # for i in range(valid_player_actions.shape[0]):
            #     if(is_valid_action(self.obs,valid_player_actions[i,:])):
            #         valid_actions.append(valid_player_actions[i,:])
            #     else:
            #         continue
        return valid_player_actions
    
    def run_num_steps(self, total_unqgm_steps, player_urt_mat, capture_frame):
        next_obs, raw_obs = self.envs.reset()
        raw_obs = np.squeeze(raw_obs)
        utt_state = raw_obs[3,:,:]
        next_obs = torch.Tensor(next_obs).to(device)
        next_done = torch.zeros(1).to(device)
        state_step_count = 1
        unique_gamesteps = [0]
        gamestep = 0
        unique_rawobs_log = []
        unique_rawobs_log.append(raw_obs)
        player_urt_log = []
        player_urt_log.append(player_urt_mat)

        from jpype.types import JArray, JInt
        while True:
            if capture_frame:
                frame = self.envs.render(mode="rgb_array")
                save_frame(frame, './static/frames', gamestep)
            else:
                self.envs.render()
            with torch.no_grad():
                action, logproba, _, invalid_action_mask = (self.agent).get_action(next_obs, envs=self.envs)

            real_action = torch.cat([torch.stack([torch.arange(0, self.mapsize, device=device) for i in range(self.envs.num_envs)]).unsqueeze(2), action], 2)
            real_action = real_action.cpu().numpy()
            valid_actions = real_action[invalid_action_mask[:,:,0].bool().cpu().numpy()]
            valid_actions_counts = invalid_action_mask[:,:,0].sum(1).long().cpu().numpy()
            java_valid_actions = []
            valid_action_idx = 0
            for env_idx, valid_action_count in enumerate(valid_actions_counts):
                java_valid_action = []
                for c in range(valid_action_count):
                    java_valid_action += [JArray(JInt)(valid_actions[valid_action_idx])]
                    valid_action_idx += 1
                java_valid_actions += [JArray(JArray(JInt))(java_valid_action)]
            java_valid_actions = JArray(JArray(JArray(JInt)))(java_valid_actions)

            try:
                gamestep += 1

                next_obs, rs, ds, infos, raw_obs = self.envs.step(java_valid_actions)
                next_obs = torch.Tensor(next_obs).to(device)
                raw_obs = np.squeeze(raw_obs)

                if not np.array_equal(utt_state, raw_obs[3,:,:]):
                    utt_state =  raw_obs[3,:,:]
                    unique_gamesteps.append(gamestep)
                    unique_rawobs_log.append(raw_obs)
                    player_urt_log.append(player_urt_mat)
                    state_step_count += 1
                    if state_step_count>=total_unqgm_steps:
                        # self.envs.close()
                        break
            except Exception as e:
                e.printStackTrace()
                raise
            if ds[0] >= True:
                # self.envs.close()
                break
        return np.array(unique_rawobs_log), np.array(unique_gamesteps), np.array(player_urt_log)
    


    def run_an_episode(self, init_player_urt, capture_frame):
        ''''
        run a full episode, record video for the how session but just store changing frames,states
        '''
        next_obs, raw_obs = self.envs.reset()
        raw_obs = np.squeeze(raw_obs)
        uot_state = raw_obs[2,:,:]
        utt_state = raw_obs[3,:,:]
        next_obs = torch.Tensor(next_obs).to(device)
        next_done = torch.zeros(1).to(device)
        unique_gamesteps = [0]
        gamestep = 0

        return_resource_counts = {}
        build_base_counts = {}
        build_barrack_counts = {}

        build_worker_counts1 = {}
        build_worker_counts2 = {}
        barrack_build_counts1 = {}
        barrack_build_counts2 = {}

        build_light_counts = {}
        build_heavy_counts = {}
        build_ranged_counts = {}

        unique_rawobs_log = []
        unique_rawobs_log.append(raw_obs)
        player_urt_log = []
        player_urt_mat = init_player_urt
        players_rsc = get_players_rsc(init_player_urt, utt_state, uot_state)
        # print("players_rsc",players_rsc)
        # print("player_urt_mat",player_urt_mat)
        player_urt_log.append(player_urt_mat)

        from jpype.types import JArray, JInt
        while True:
            if capture_frame:
                frame = self.envs.render(mode="rgb_array")
                # reorder color channel
                frame_new = frame[:,:,::-1]
                save_frame(frame_new, './static/frames', gamestep)
            else:
                self.envs.render()
            with torch.no_grad():
                action, logproba, _, invalid_action_mask = (self.agent).get_action(next_obs, envs=self.envs)

            real_action = torch.cat([torch.stack([torch.arange(0, self.mapsize, device=device) for i in range(self.envs.num_envs)]).unsqueeze(2), action], 2)
            real_action = real_action.cpu().numpy()
            valid_actions = real_action[invalid_action_mask[:,:,0].bool().cpu().numpy()]
            valid_actions_counts = invalid_action_mask[:,:,0].sum(1).long().cpu().numpy()
            java_valid_actions = []
            valid_action_idx = 0

            uht_t = raw_obs[0,:,:]
            urt_t = raw_obs[1,:,:]
            uot_t = raw_obs[2,:,:]
            utt_t = raw_obs[3,:,:]
            uat_t = raw_obs[4,:,:]

           
            for env_idx, valid_action_count in enumerate(valid_actions_counts):
                java_valid_action = []
                for c in range(valid_action_count):
                    java_valid_action += [JArray(JInt)(valid_actions[valid_action_idx])]
                    valid_action_idx += 1
                        # print("valid_act produce", prd_tp, "\n",player_urt_mat)
                java_valid_actions += [JArray(JArray(JInt))(java_valid_action)]
            java_valid_actions = JArray(JArray(JArray(JInt)))(java_valid_actions)


            try:
                gamestep += 1
                next_obs, rs, ds, infos, raw_obs = self.envs.step(java_valid_actions)
                next_obs = torch.Tensor(next_obs).to(device)

                raw_obs = np.squeeze(raw_obs)

                uht_tp1 = raw_obs[0,:,:]
                urt_tp1 = raw_obs[1,:,:]
                uot_tp1 = raw_obs[2,:,:]
                utt_tp1 = raw_obs[3,:,:]
                uat_tp1 = raw_obs[4,:,:]

                
                unique_rawobs_log.append(raw_obs)


                ### player resource decrease: locate all bases, barracks, and workers
                #!build_worker_counts1 = get_build_progress(raw_obs_t, raw_obs_tp1, build_worker_counts1, owner=1, utype=2)
                
                base1_pos = np.where(np.logical_and((utt_tp1==2), uot_tp1==1))
                if base1_pos[0]>0:
                    base1_coords = (np.array(base1_pos).T)
                    #50 units of time to build worker
                    for base1_coord in base1_coords:
                        coord_key_base1 = "_".join([str(i) for i in base1_coord])
                         # producing worker
                        if(uat_tp1[tuple(base1_coord)] == 4):
                            if(uat_t[tuple(base1_coord)] == 4):
                                #building in a consecutive action
                                build_worker_counts1[coord_key_base1] += 1
                            else:
                                #start building
                                build_worker_counts1[coord_key_base1] = 1
                        else:
                            # taking other action
                            continue
                        

                base2_pos = np.where(np.logical_and((utt_tp1==2), uot_tp1==2))
                if base2_pos[0]>0:
                    base2_coords = (np.array(base2_pos).T)
                     #50 units of time to build worker
                    for base2_coord in base2_coords:
                        coord_key_base2 = "_".join([str(i) for i in base2_coord])
                         # producing worker
                        if(uat_tp1[tuple(base2_coord)] == 4):
                            if(uat_t[tuple(base2_coord)] == 4):
                                #building in a consecutive action
                                build_worker_counts2[coord_key_base2] += 1
                            else:
                                #start building
                                build_worker_counts2[coord_key_base2] = 1
                        else:
                            # taking other action
                            continue

                barrack1_pos = np.where(np.logical_and((utt_tp1==3), uot_tp1==1))
                if barrack1_pos[0]>0:
                    barrack1_coords = (np.array(barrack1_pos).T)
                     #100 units of time to build ranged, 80 to build a light, 120 to build a heavy
                    for barrack1_coord in barrack1_coords:
                        coord_key_brk1 = "_".join([str(i) for i in barrack1_coord])
                         # producing attacking units
                        if(uat_tp1[tuple(barrack1_coord)] == 4):
                            if(uat_t[tuple(barrack1_coord)] == 4):
                                #building in a consecutive action
                                barrack_build_counts1[coord_key_brk1] += 1
                            else:
                                #start building
                                barrack_build_counts1[coord_key_brk1] = 1
                        else:
                            # taking other action
                            continue
                
                barrack2_pos = np.where(np.logical_and((utt_tp1==3), uot_tp1==2))
                if barrack2_pos[0]>0:
                    barrack2_coords = (np.array(barrack2_pos).T)
                    for barrack2_coord in barrack2_coords:
                        coord_key_brk2 = "_".join([str(i) for i in barrack2_coord])
                         # producing attacking units
                        if(uat_tp1[tuple(barrack2_coord)] == 4):
                            if(uat_t[tuple(barrack2_coord)] == 4):
                                #building in a consecutive action
                                barrack_build_counts2[coord_key_brk2] += 1
                            else:
                                #start building
                                barrack_build_counts2[coord_key_brk2] = 1
                        else:
                            # taking other action
                            continue





                player_urt_log.append(player_urt_mat)

                if not np.array_equal(utt_state, raw_obs[3,:,:]):
                    utt_state =  raw_obs[3,:,:]

                    unique_gamesteps.append(gamestep)
                    # unique_rawobs_log.append(raw_obs)
                    # player_urt_log.append(player_urt_mat)


            except Exception as e:
                e.printStackTrace()
                raise
            if ds[0] >= True:
                # self.envs.close()
                break
        unique_rawobs_log_ = np.array(unique_rawobs_log)
        player_urt_log_ = np.array(player_urt_log)

        return unique_rawobs_log_[unique_gamesteps], np.array(unique_gamesteps), player_urt_log_[unique_gamesteps]
    
    def run_episodes(self, nepisodes):
        ''''
        run a full episode, record video for the how session but just store changing frames,states
        '''
        episode = 0
        # eps_rawobs_t_log = np.empty((0,5,16,16), float)
        eps_states_ws_t = np.empty((0,13), int)
        eps_states_ws_tp1 = np.empty((0,13), int)
        ep_gamesteps_log = []


        while episode<nepisodes:
            episode += 1
            print("episode:",episode)

            # reset environment
            next_obs, raw_obs_ext_t = self.envs.reset()
            raw_obs_t = np.squeeze(raw_obs_ext_t)
            strategy_state_t = rawobs_to_state(raw_obs_t)
            next_obs = torch.Tensor(next_obs).to(device)
            torch.zeros(1).to(device)

            # initialize logs
            gamestep = 0

            states_ws_t_log = []
            states_ws_tp1_log = []
            state_ws_t = np.concatenate((strategy_state_t,np.array([gamestep])))
            gamestep_log = [gamestep]

            
            from jpype.types import JArray, JInt

            while True:
                self.envs.render()
                with torch.no_grad():
                    action, logproba, _, invalid_action_mask = (self.agent).get_action(next_obs, envs=self.envs)

                real_action = torch.cat([torch.stack([torch.arange(0, self.mapsize, device=device) for i in range(self.envs.num_envs)]).unsqueeze(2), action], 2)
                real_action = real_action.cpu().numpy()
                valid_actions = real_action[invalid_action_mask[:,:,0].bool().cpu().numpy()]
                valid_actions_counts = invalid_action_mask[:,:,0].sum(1).long().cpu().numpy()
                java_valid_actions = []
                valid_action_idx = 0

                for env_idx, valid_action_count in enumerate(valid_actions_counts):
                    java_valid_action = []
                    for c in range(valid_action_count):
                        java_valid_action += [JArray(JInt)(valid_actions[valid_action_idx])]
                        valid_action_idx += 1
                    java_valid_actions += [JArray(JArray(JInt))(java_valid_action)]
                java_valid_actions = JArray(JArray(JArray(JInt)))(java_valid_actions)

                try:
                    gamestep += 1

                    next_obs, rs, ds, infos, raw_obs_ext_tp1 = self.envs.step(java_valid_actions)
                    next_obs = torch.Tensor(next_obs).to(device)

                    raw_obs_tp1 = np.squeeze(raw_obs_ext_tp1)
                    strategy_state_tp1 = rawobs_to_state(raw_obs_tp1)


                    if not np.array_equal(strategy_state_t, strategy_state_tp1):

                        gamestep_log.append(gamestep)

                        states_ws_t_log.append(state_ws_t)

                        gamestep_tp1 = gamestep
                        state_ws_tp1 = np.concatenate((strategy_state_tp1,np.array([gamestep_tp1])))
                        states_ws_tp1_log.append(state_ws_tp1)
                        
                        gamestep_t = gamestep_tp1
                        strategy_state_t = strategy_state_tp1
                        state_ws_t = np.concatenate((strategy_state_t,np.array([gamestep_t])))

                        

                    else:
                        continue


                except Exception as e:
                    e.printStackTrace()
                    raise
                if ds[0] >= True:
                    # self.envs.close()
                    break
            
            eps_states_ws_t = np.vstack((eps_states_ws_t, np.array(states_ws_t_log)))
            eps_states_ws_tp1 = np.vstack((eps_states_ws_tp1, np.array(states_ws_tp1_log)))
            ep_gamesteps_log.append(gamestep_log)
            
            # if episode%30==0:
            #     print("saving at episode ",episode, ".....")
            #     np.savez('data/eps_rawobs_t_log.npz', eps_rawobs_t_log=eps_rawobs_t_log)
            #     np.savez('data/eps_rawobs_tp1_log.npz', eps_rawobs_tp1_log=eps_rawobs_tp1_log)
            #     with open('./data/unique_gamesteps_log.pickle', 'wb') as f:
            #         pickle.dump(unique_gamesteps_log, f, protocol=pickle.HIGHEST_PROTOCOL)

        # return eps_strategy_states_t, eps_strategy_states_tp1 
        return  eps_states_ws_t, eps_states_ws_tp1, ep_gamesteps_log
    

    def run_ctf_steps(self, total_unqgm_steps):
        next_obs, raw_obs = self.envs.reset()
        raw_obs = np.squeeze(raw_obs)
        utt_state = raw_obs[3,:,:]
        next_obs = torch.Tensor(next_obs).to(device)
        #sync observation with xml map
        self.rawobs = raw_obs
        self.obs = next_obs
        state_step_count = 1
        gamestep = 0
        unique_rawobs_log = []
        unique_rawobs_log.append(raw_obs)

        with torch.no_grad():
            action, _, _, invalid_action_mask = (self.agent).get_action(self.obs, envs=self.envs)

            real_action = torch.cat([torch.stack([torch.arange(0, self.mapsize, device=device) for i in range(self.envs.num_envs)]).unsqueeze(2), action], 2)
            real_action = real_action.cpu().numpy()
            # invalid_action_mask = mask_generator(self.obs)
            valid_actions = real_action[invalid_action_mask[:,:,0].bool().cpu().numpy()]
        while  state_step_count<total_unqgm_steps:
            if valid_actions.ndim <=1:
                # when there is no valid action
                pass
            elif 1 not in valid_actions[:,1]:
                # focus on actions that moves
                pass
            else:
                # extract action for a worker
                uht = raw_obs[0,:,:]
                urt = raw_obs[1,:,:]
                uot = raw_obs[2,:,:]
                utt = raw_obs[3,:,:]
                uat = raw_obs[4,:,:]

                wrkrs_coords = np.where(np.logical_and((utt==4), uot==1))
                if wrkrs_coords[0]>0:
                    wrkr_row = wrkrs_coords[0][0]
                    wrkr_col = wrkrs_coords[1][0]
                
                
        # if not np.array_equal(utt_state, raw_obs[3,:,:]):
        #     utt_state =  raw_obs[3,:,:]
        #     unique_rawobs_log.append(raw_obs)
        #     state_step_count += 1
        #     if state_step_count>=total_unqgm_steps:
        return np.array(unique_rawobs_log)



    def get_utt(self):
        '''
        get unit type table
        '''
        return np.argmax(self.obs[0,:,:,13:21], axis=-1).numpy()
    
    def get_utt_raw(self):
        '''
        get unit type table from raw observation
        '''
        return self.rawobs[3,:,:]


    def get_uot(self):
        '''
        get unit owner table
        '''
        return np.argmax(self.obs[0,:,:,10:13], axis=-1).numpy()

    def get_uot_raw(self):
        '''
        get unit owner table from raw observation
        '''
        return self.rawobs[2,:,:]


    def get_urt(self):
        '''
        get unit resource table
        '''
        return np.argmax(self.obs[0,:,:,5:10], axis=-1).numpy()
    
    def get_urt_raw(self):
        '''
        get unit resource table from raw observation
        '''
        return self.rawobs[1,:,:]
    
    
    def get_uht_raw(self):
        '''
        get unit hitpoints table from raw observation
        '''
        return self.rawobs[0,:,:]


    def get_uat_raw(self):
        '''
        get unit current action table from raw observation
        '''
        return self.rawobs[4,:,:]



import pathlib
from stratvis.lib.gym_microrts_rl.obs_gen_xml import obs_to_xml

PATH_FILE = open(str(pathlib.Path(__file__).parent.parent.parent.resolve()) + "/map_path.txt", 'r')
MAP_PATH = PATH_FILE.readline().strip()


def query_action(board_state, player_urt_mat):

    uht = np.array(board_state[0], dtype=np.int8)
    urt = np.array(board_state[1], dtype=np.int8)
    uot = np.array(board_state[2], dtype=np.int8)
    utt = np.array(board_state[3], dtype=np.int8)
    uat = np.array(board_state[4], dtype=np.int8)

    players_rsc = get_players_rsc(player_urt_mat, utt, uot)

    front_1h_obs = np.zeros((1,16,16,27))
    #utt integer to one hot encoding
    front_1h_obs[0,:,:,13:21] = np.eye(8)[utt]
    #uot integer to one hot encoding
    front_1h_obs[0,:,:,10:13] = np.eye(3)[uot]
    # hit points
    uh1t_obs = np.logical_or(np.logical_or(utt == 1, utt == 4), utt==7).astype(int)
    uh4t_obs = np.logical_and(utt!=0,uh1t_obs!=1).astype(int) * 4
    uht_obs = uh1t_obs + uh4t_obs
    front_1h_obs[0,:,:,:5] = np.eye(5)[uht_obs]
    # urt(resource) integer to one hot encoding
    # clip urt into range [0,4] for observation
    urt_obs = np.clip(urt, 0, 4)
    front_1h_obs[0,:,:,5:10] = np.eye(5)[urt_obs]
    # uat(current action) integer to one hot encoding
    front_1h_obs[0,:,:,21:] = np.eye(6)[uat]

    front_raw_obs = np.array([uht,urt,uot,utt,uat])
    xml_map_path = MAP_PATH + "/custom.xml"
    obs_to_xml(front_raw_obs, players_rsc, xml_map_path)

    rl_agent = RLAgent(obs_=torch.Tensor(front_1h_obs), rawobs_=front_raw_obs, mappath_="maps/16x16/custom.xml")
    # valid_actions = (rl_agent.get_valid_action()).tolist()
    valid_actions = rl_agent.manual_get_valid_action()
    return valid_actions


def unit_ctf_steps(board_state, unit_pos, init_player_urt, num_steps):

    board_state_array = np.array(board_state)
    uht = np.array(board_state[0], dtype=np.int8)
    urt = np.array(board_state[1], dtype=np.int8)
    uot = np.array(board_state[2], dtype=np.int8)
    utt = np.array(board_state[3], dtype=np.int8)
    uat = np.array(board_state[4], dtype=np.int8)

    unit_row, unit_col  = unit_pos
    dy = [-1, 0, 1, 0]
    dx = [0, 1, 0, -1]
    gamestep = 0
    rawobs_log = []
    rawobs_log.append(board_state_array)
    player_urt_log = []
    player_urt_log.append(init_player_urt)
    unitpos_log = []
    unitpos_log.append(unit_pos)

    player_urt_mat = init_player_urt

    while True:
        board_state = board_state_array.tolist()
        valid_actions = query_action(board_state, player_urt_mat)
        
        if valid_actions.ndim <=1:
            # when there is no valid action
            continue
        else:
            for i_act in range(len(valid_actions)):
                if valid_actions[i_act,0] == unit_row * 16 + unit_col:
                    # focus on the specified unit
                    if valid_actions[i_act, 1] == 0:
                        # if no operation to the unit
                        break
                    elif valid_actions[i_act, 1] == 1:
                        # if assign move to the unit

                        mv_param = valid_actions[i_act,2]
                        next_unit_row, next_unit_col = unit_row + dy[mv_param], unit_col + dx[mv_param]
                        uht[next_unit_row][next_unit_col] = uht[unit_row][unit_col]
                        urt[next_unit_row][next_unit_col] = urt[unit_row][unit_col]
                        uot[next_unit_row][next_unit_col] = uot[unit_row][unit_col]
                        utt[next_unit_row][next_unit_col] = utt[unit_row][unit_col]
                        uat[next_unit_row][next_unit_col] = uat[unit_row][unit_col]

                        uht[unit_row][unit_col] = 0
                        urt[unit_row][unit_col] = 0
                        uot[unit_row][unit_col] = 0
                        utt[unit_row][unit_col] = 0
                        uat[unit_row][unit_col] = 0

                        unit_row += dy[mv_param]
                        unit_col += dx[mv_param]

                        board_state_array = np.array([uht, urt, uot, utt, uat])

                        gamestep += 1
                        rawobs_log.append(board_state_array)
                        unitpos_log.append([unit_row, unit_col])
                        # unit move doesn't change players' urt
                        player_urt_log.append(player_urt_mat)
                        print("gamestep", (gamestep),"\n", (rawobs_log[0][3,:,:]))
                        if gamestep >= num_steps:
                            return np.array(rawobs_log), np.array(player_urt_log), unitpos_log, gamestep, valid_actions[i_act,:]
                    else:
                        # If the unit doesn't want to move, exit early with the action
                        return np.array(rawobs_log), np.array(player_urt_log), unitpos_log, gamestep, valid_actions[i_act,:]
                else:
                    # if not valid action for the specified unit
                    continue   


def unit_intention_eval(board_state, unit_pos, init_player_urt, num_steps):
    board_state_array = np.array(board_state)
    uht = np.array(board_state[0], dtype=np.int8)
    urt = np.array(board_state[1], dtype=np.int8)
    uot = np.array(board_state[2], dtype=np.int8)
    utt = np.array(board_state[3], dtype=np.int8)
    uat = np.array(board_state[4], dtype=np.int8)

    unit_row, unit_col  = unit_pos
    dy = [-1, 0, 1, 0]
    dx = [0, 1, 0, -1]
    steps_taken = 0
    rawobs_log = []
    rawobs_log.append(board_state_array)
    player_urt_log = []
    player_urt_log.append(init_player_urt)
    unitpos_log = []
    unitpos_log.append(unit_pos)

    player_urt_mat = init_player_urt

    while True:
        board_state = board_state_array.tolist()
        valid_actions = query_action(board_state, player_urt_mat)
        
        if valid_actions.ndim <=1:
            # when there is no valid action
            continue
        else:
            for i_act in range(len(valid_actions)):
                if valid_actions[i_act,0] == unit_row * 16 + unit_col:
                    # focus on the specified unit
                    if valid_actions[i_act, 1] == 0:
                        # if no operation to the unit
                        break
                    elif valid_actions[i_act, 1] == 1:
                        # if assign move to the unit

                        mv_param = valid_actions[i_act,2]
                        next_unit_row, next_unit_col = unit_row + dy[mv_param], unit_col + dx[mv_param]
                        uht[next_unit_row][next_unit_col] = uht[unit_row][unit_col]
                        urt[next_unit_row][next_unit_col] = urt[unit_row][unit_col]
                        uot[next_unit_row][next_unit_col] = uot[unit_row][unit_col]
                        utt[next_unit_row][next_unit_col] = utt[unit_row][unit_col]
                        uat[next_unit_row][next_unit_col] = uat[unit_row][unit_col]

                        uht[unit_row][unit_col] = 0
                        urt[unit_row][unit_col] = 0
                        uot[unit_row][unit_col] = 0
                        utt[unit_row][unit_col] = 0
                        uat[unit_row][unit_col] = 0

                        unit_row += dy[mv_param]
                        unit_col += dx[mv_param]

                        board_state_array = np.array([uht, urt, uot, utt, uat])

                        steps_taken += 1
                        rawobs_log.append(board_state_array)
                        unitpos_log.append([unit_row, unit_col])
                        # unit move doesn't change players' urt
                        player_urt_log.append(player_urt_mat)
                        if steps_taken >= num_steps:
                            return np.array(rawobs_log), np.array(player_urt_log), unitpos_log, steps_taken, valid_actions[i_act,:]
                    else:
                        # If the unit doesn't want to move, exit early with the action
                        return np.array(rawobs_log), np.array(player_urt_log), unitpos_log, steps_taken, valid_actions[i_act,:]
                else:
                    # if not valid action for the specified unit
                    continue 



def unit_intention_analysis(init_board_state, unit_pos, init_player_urt, num_steps, eval_times):

    eval_unitpos_log = {}
    eval_action_log = {}
    eval_rawobs_log = {}
    eval_playerurt_log = {}
    eval_steps_taken = {} 

    eval_time = 0
    while eval_time<eval_times:
        print("eval_time:",eval_time)
        eval_time += 1
        rawobs_log, player_urt_log, unitpos_log, steps_taken, last_action  = unit_intention_eval(init_board_state, unit_pos, init_player_urt, num_steps)

        eval_rawobs_log[eval_time] = rawobs_log
        eval_playerurt_log[eval_time] = player_urt_log
        eval_unitpos_log[eval_time] = unitpos_log
        eval_action_log[eval_time] = last_action
        eval_steps_taken[eval_time] = steps_taken
    return eval_unitpos_log, eval_rawobs_log, eval_playerurt_log, eval_action_log, eval_steps_taken
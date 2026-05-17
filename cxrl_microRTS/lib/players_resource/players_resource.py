import numpy as np

def get_build_progress(raw_obs_t, raw_obs_tp1, build_counts, owner=1, utype=2):
    '''
    update build progress
    '''

    uot_t = raw_obs_t[2,:,:]
    utt_t = raw_obs_t[3,:,:]
    uat_t = raw_obs_t[4,:,:]

    uot_tp1 = raw_obs_tp1[2,:,:]
    utt_tp1 = raw_obs_tp1[3,:,:]
    uat_tp1 = raw_obs_tp1[4,:,:]

    build_pos = np.where(np.logical_and((utt_tp1==utype), uot_tp1==owner))
    check_flag = {}
    if build_pos[0]>0:
        build_coords = (np.array(build_pos).T)
        #50 units of time to build worker
        for idx,build_coord in enumerate(build_coords):
            coord_key = "_".join([str(i) for i in build_coord])
                # producing worker
            if(uat_tp1[tuple(build_coord)] == 4):
                if(uat_t[tuple(build_coord)] == 4):
                    #building in a consecutive action
                    build_counts[coord_key] += 1
                else:
                    #start building
                    build_counts[coord_key] = 1
            else:
                # taking other action at t+1
                if(uat_t[tuple(build_coord)] == 4):
                    check_flag[coord_key] = 1
                else:
                    continue
                

    return build_counts, check_flag


def detetct_update_player_resource(build_counts, check_flag, target_timestep, cost_rsrc, owner):
    if any(check_flag):
        for coordKey,coordVal in build_counts.items():
            if coordVal==target_timestep:
                # clear counts
                build_counts[coordKey] = 0
                # subtract the resource to build a worker
                if(owner==1):
                    players_rsc = [players_rsc[0]-cost_rsrc, players_rsc[1]]
                else:
                    players_rsc = [players_rsc[0], players_rsc[1]- cost_rsrc]
            else:
                continue
    else:
        pass

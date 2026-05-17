import numpy as np


def get_players_rsc(player_urt_mat, utt, uot):
    # format player_urt_mat
    player_urt_mat = np.array(player_urt_mat, dtype=np.int8)

    players_rsc = [0,0]
    p1_base_rows = np.where(np.multiply((utt==2).astype(int), uot)==1)[0]
    p1_base_cols = np.where(np.multiply((utt==2).astype(int), uot)==1)[1]
    if len(p1_base_rows)>0:
        # there is at least one base of p1
        p1_base_row = p1_base_rows[0]
        p1_base_col = p1_base_cols[0]
        players_rsc[0] = player_urt_mat[p1_base_row][p1_base_col]
    p2_base_rows = np.where(np.multiply((utt==2).astype(int), uot)==2)[0]
    p2_base_cols = np.where(np.multiply((utt==2).astype(int), uot)==2)[1]
    if len(p2_base_rows)>0:
        # there is at least one base of p2
        p2_base_row = p2_base_rows[0]
        p2_base_col = p2_base_cols[0]
        players_rsc[1] = player_urt_mat[p2_base_row][p2_base_col]
    return players_rsc


def players_rsc_to_urtmat(players_rsc, utt, uot):
    player_urt_mat = np.zeros((16,16), dtype=np.int8)

    p1_base_rows = np.where(np.multiply((utt==2).astype(int), uot)==1)[0]
    p1_base_cols = np.where(np.multiply((utt==2).astype(int), uot)==1)[1]
    if len(p1_base_rows)>0:
        # there is at least one base of p1
        p1_base_row = p1_base_rows[0]
        p1_base_col = p1_base_cols[0]
        player_urt_mat[p1_base_row][p1_base_col] = players_rsc[0]

    p2_base_rows = np.where(np.multiply((utt==2).astype(int), uot)==2)[0]
    p2_base_cols = np.where(np.multiply((utt==2).astype(int), uot)==2)[1]
    if len(p2_base_rows)>0:
        # there is at least one base of p2
        p2_base_row = p2_base_rows[0]
        p2_base_col = p2_base_cols[0]
        player_urt_mat[p2_base_row][p2_base_col] = players_rsc[1]
    return player_urt_mat



def rawobs_to_state(raw_obs):
    '''
    raw_obs is a (5,16,16) np.array
    '''
    #num base player1
    num_base1 = np.multiply(raw_obs[3,:,:]==2,raw_obs[2,:,:]==1).astype(int).sum()
    #num barrack player1
    num_barrack1 = np.multiply(raw_obs[3,:,:]==3,raw_obs[2,:,:]==1).astype(int).sum()
    #num worker player1
    num_worker1 = np.multiply(raw_obs[3,:,:]==4,raw_obs[2,:,:]==1).astype(int).sum()
    #num light player1
    num_light1 = np.multiply(raw_obs[3,:,:]==5,raw_obs[2,:,:]==1).astype(int).sum()
    #num heavy player1
    num_heavy1 = np.multiply(raw_obs[3,:,:]==6,raw_obs[2,:,:]==1).astype(int).sum()
    #num ranged player1
    num_ranged1 = np.multiply(raw_obs[3,:,:]==7,raw_obs[2,:,:]==1).astype(int).sum()


    #num base player2
    num_base2 = np.multiply(raw_obs[3,:,:]==2,raw_obs[2,:,:]==2).astype(int).sum()
    #num barrack player2
    num_barrack2 = np.multiply(raw_obs[3,:,:]==3,raw_obs[2,:,:]==2).astype(int).sum()
    #num worker player2
    num_worker2 = np.multiply(raw_obs[3,:,:]==4,raw_obs[2,:,:]==2).astype(int).sum()
    #num light player2
    num_light2 = np.multiply(raw_obs[3,:,:]==5,raw_obs[2,:,:]==2).astype(int).sum()
    #num heavy player2
    num_heavy2 = np.multiply(raw_obs[3,:,:]==6,raw_obs[2,:,:]==2).astype(int).sum()
    #num ranged player2
    num_ranged2 = np.multiply(raw_obs[3,:,:]==7,raw_obs[2,:,:]==2).astype(int).sum()

    
    strategy_state = np.array([num_base1, num_barrack1, num_worker1, num_light1, num_heavy1, num_ranged1, num_base2, num_barrack2, num_worker2, num_light2, num_heavy2, num_ranged2])
    return strategy_state


def get_strategy_states(raw_obs_mat):
    totoal_steps = raw_obs_mat.shape[0]
    strategy_states = []
    for step in range(totoal_steps):
        strategy_state  = rawobs_to_state(raw_obs_mat[step,:,:,:])
        strategy_states.append(strategy_state)
    strategy_states = np.array(strategy_states)
    
    return strategy_states



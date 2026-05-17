
def play(env, pi=None, nepisodes=200, decode=False,
         naction_apply=1, render=True, **kwargs):
    """ Playes the environment with the selected (possibly random) policy. 

    Args:
        env: OpenAI gym environment.
        nepisodes: Number of episodes to run.
        pi: Policy for selecting actions (random if None).
        decode: If true, decodes the state using the env.decode method.
        naction_apply: Number of consecutive steps to apply the action.
        render: If true, renders the last 10 episodes.

    Returns:
        states, actions, rewards, and new states
    """
    states, actions, rewards, states_new = [], [], [], []
    for episode in range(nepisodes):
        state_t = env.reset()
        if decode:
            state_t = list(env.decode(state_t))
            
        done = False
        while not done:
            action = env.action_space.sample() if pi is None else pi(state_t)
            
            # apply the action multiple times
            for i in range(naction_apply):            
                state_tp1, reward, done, _ = env.step(action)
                if decode:
                    state_tp1 = list(env.decode(state_tp1))
                    
                if render and episode > nepisodes-10:
                    # show the last 10 episodes
                    # env.render()
                    pass

                if done:
                    break
                
            if not done:
                states.append(state_t)
                actions.append(action)
                rewards.append(reward)
                states_new.append(state_tp1)

            state_t = state_tp1

    env.close()
    return states, actions, rewards, states_new
            

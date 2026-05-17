import unittest
import gym

import numpy as np
import pandas as pd

from cxrl.lib.xrl import XRL

######## Policy for Cartpole agent ########
def approx(weights, state, action):
    return np.dot(state, weights)[action]

def policy(state):
    # weights trained for the cartpole example
    weights = np.array([[-1.05795513, -2.3199987 ],
                        [-2.20354105, 18.8123173 ],
                        [-9.86532788,  9.63531744],
                        [-2.77878638, 37.72467309]])

    actions = [0, 1]    
    qs = []
    for action in actions:
        qs.append(approx(weights, state, action))
        
    return np.argmax(qs)
############################################


class TestXRL(unittest.TestCase):
    """ Test XRL class. """

    def test_counterfactaul(self):
        """ Test counterfactual generation. """
        env = gym.make('CartPole-v0')
        
        state_features = ['cart_position', 'cart_velocity', 'pole_angle', 'pole_velocity']
        xrl = XRL(env, policy, state_features, render=False)
        query = xrl.replay[6:7]
        expected_action = 1 - query['action'].values[0]
        print(type(expected_action))
        cf_df, score = xrl.counterfactual(query, int(expected_action))

        self.assertFalse((cf_df['action'] == query['action'].values[0]).any())

        cf_df = cf_df.drop(['action'], axis=1)
        query = query.drop(['action'], axis=1)
        
        # It must be different somehow
        self.assertFalse((cf_df == query.values[0]).all().all())
        

if __name__ == '__main__':
    unittest.main()

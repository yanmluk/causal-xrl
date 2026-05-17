import unittest

import numpy as np
import pandas as pd

from cxrl.lib.causal.infer_network import infer_causes, infer_DBN

class TestInferNetwork(unittest.TestCase):
    """ Test network inference functions. """

    def test_infer_causes(self):
        """ Test initialization. """
        nsamples = 1000
        X = np.random.normal(size=(nsamples, 5))
        y = X[:, 0] + X[:, 1] + np.random.normal(size=nsamples)
        
        causes, bart = infer_causes(X, y)
        self.assertListEqual(causes, [0, 1])

    def test_infer_DBN(self):
        """ Test infer the dbn. """
        nsamples = 1000
        Xt = np.random.normal(size=(nsamples, 5))
        Xtp1 = Xt + np.random.normal(size=(nsamples, 5))
        actions = np.array([0] * 500 + [1] * 500)
        rewards = np.array([1] * nsamples)

        Xtp1[:, 0] = Xtp1[:, 0] + actions
        G, scm = infer_DBN(Xt, actions, rewards, Xtp1)

        expected_edge_list = [
            ("state_0_t", "state_0_t+1"),
            ("action", "state_0_t+1"),
            ("state_1_t", "state_1_t+1"),
            ("state_2_t", "state_2_t+1"),
            ("state_3_t", "state_3_t+1"),
            ("state_4_t", "state_4_t+1"),
        ]
        
        self.assertListEqual(list(G.edges), expected_edge_list)
        
if __name__ == '__main__':
    unittest.main()

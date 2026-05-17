import unittest

import numpy as np
import pandas as pd

from cxrl.lib.models import BARTRegressor
from sklearn.model_selection import train_test_split


class TestBARTRegressor(unittest.TestCase):
    """ Test BART Regresso functions. """

    def test_init(self):
        """ Test initialization. """
        nsamples = 1000
        C = np.random.normal(size=nsamples)
        Z = np.random.normal(size=nsamples)
        
        X = np.array([C, Z]).T
        y = C + Z + np.random.normal(size=nsamples)
        
        bart = BARTRegressor()
        bart.fit(X, y)

        # Test that nothing crashed
        self.assertEqual(len(bart.predict(X)), nsamples)

    
    def test_ate(self):
        """ Test initialization. """
        nsamples = 1000
        C = np.random.normal(size=nsamples)
        Z = np.random.normal(size=nsamples)
        
        X = np.array([C, Z]).T
        y = -0.8*C + Z + np.random.normal(size=nsamples)
        
        bart = BARTRegressor()
        bart.fit(X, y)

        ate, lci, uci = bart.ATE(X, 0)
        
        self.assertTrue(lci <= ate <= uci)  # sanity check
        self.assertLess(uci, 0)

        # True effect is -0.8
        self.assertTrue(lci <= -0.8 <= uci)
        print(lci, ',', uci)
        
    def test_ite(self):
        """ Test ite. """
        nsamples = 1000
        C = np.random.normal(size=nsamples)
        Z = np.random.normal(size=nsamples)
        R = np.random.normal(size=nsamples)
        X = np.array([C, Z, R]).T
        
        y = -0.8*C + Z + np.random.normal(size=nsamples)
        
        bart = BARTRegressor()
        bart.fit(X, y)

        ite = bart.ITE(X, 0)

        ite_est = np.mean(ite, axis=0)  # get estimated ite per point
        self.assertEqual(ite_est.shape[0], nsamples)
        
        ate_est = np.mean(ite, axis=1)
        self.assertEqual(ite.shape[1], nsamples)
        
        # should be reasonably close to actual effect
        self.assertLess(ite.mean(), -0.2)
        
        self.assertTrue(bart.is_causal_HTE(X, 0))
        self.assertTrue(bart.is_causal_HTE(X, 1))
        self.assertFalse(bart.is_causal_HTE(X, 2))

            
    def test_hte(self):
        """ Test hte. """
        nsamples = 1000
        C = np.random.normal(size=nsamples)
        Z = np.random.normal(size=nsamples)
        R = np.random.normal(size=nsamples)
        R2 = np.random.normal(size=nsamples) 
        X = np.array([C, Z, R, R2]).T

        # Create heterogeneity based on R
        y = -0.8*C + ((R>0)*2-1)*Z + np.random.normal(size=nsamples)
        
        bart = BARTRegressor()
        bart.fit(X, y)

        ite = bart.ITE(X, 0)

        ite_est = np.mean(ite, axis=0)  # get estimated ite per point
        self.assertEqual(ite_est.shape[0], nsamples)
        
        ate_est = np.mean(ite, axis=1)
        self.assertEqual(ite.shape[1], nsamples)
        
        # should be reasonably close to actual effect
        self.assertLess(ite.mean(), -0.2)

        self.assertTrue(bart.is_causal_HTE(X, 0))
        self.assertTrue(bart.is_causal_HTE(X, 1))
        self.assertTrue(bart.is_causal_HTE(X, 2))
        self.assertFalse(bart.is_causal_HTE(X, 3))

        print(bart.local_treatments(X[:1, :]))
        # print(bart.is_state_causal(X[:10, :], 3))
        
        
    def test_ci_test(self):
        """ Test ci_test. """
        nsamples = 1000
        X = np.random.normal(size=(nsamples, 10))        
        y = X[:, 0] - X[:, 1] + np.random.normal(size=nsamples)
            
        bart = BARTRegressor()
        
        self.assertTrue(bart.CITest(X, y, 0))
        self.assertTrue(bart.CITest(X, y, 1))
        self.assertFalse(bart.CITest(X, y, 2))

    def test_ci_test_fast(self):
        """ Test ci_test. """
        nsamples = 1000
        X = np.random.normal(size=(nsamples, 10))        
        y = X[:, 0] - X[:, 1] + np.random.normal(size=nsamples)
            
        bart = BARTRegressor()
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.5)
        
        self.assertTrue(bart.CITestFast(X_train, y_train, X_test, y_test, 0))
        self.assertTrue(bart.CITestFast(X_train, y_train, X_test, y_test, 1))
        self.assertFalse(bart.CITestFast(X_train, y_train, X_test, y_test, 2))
        

        
if __name__ == '__main__':
    unittest.main()

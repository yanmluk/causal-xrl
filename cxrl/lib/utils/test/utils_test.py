import unittest

import numpy as np
import pandas as pd

import cxrl.lib.utils as util

class TestUtil(unittest.TestCase):
    """ Test utility functions. """

    def test_convert_to_numpy(self):
        """ Test converting to numpy array from various data types. """
        nsamples = 1000
        X = np.random.normal(size=nsamples)
        Z = np.random.normal(size=nsamples)
        y = X + Z + np.random.normal(size=nsamples)

        X[0] = np.nan  # add nan
        data = np.array([X, Z, y]).T

        # test expected
        cdata1 = util.convert_to_numpy(data)
        self.assertTrue(isinstance(cdata1, np.ndarray))

        dataframe = pd.DataFrame(data)
        self.assertFalse(isinstance(dataframe, np.ndarray))

        cdata2 = util.convert_to_numpy(dataframe)
        self.assertTrue(isinstance(cdata2, np.ndarray))

        cX = util.convert_to_numpy(X)
        self.assertTrue(isinstance(X, np.ndarray))

        cZ = util.convert_to_numpy(Z.tolist())
        self.assertTrue(isinstance(cZ, np.ndarray))

        cZ_series = util.convert_to_numpy(pd.Series(Z))
        self.assertTrue(isinstance(cZ_series, np.ndarray))
        
        # test unexpected
        self.assertRaises(TypeError, util.convert_to_numpy, "asdf")
        self.assertRaises(TypeError, util.convert_to_numpy, 1)
        
        
    def test_convert_and_expand(self):
        """ Test convert_and_expand under different circumstances. """
        nsamples = 1000
        X = np.random.normal(size=nsamples)
        Z = np.random.normal(size=nsamples)
        y = X + Z + np.random.normal(size=nsamples)

        data = np.array([X, Z, y]).T

        # test expected values
        cdata1 = util.convert_and_expand(data)
        self.assertTrue(isinstance(cdata1, np.ndarray))
        self.assertEqual(cdata1.ndim, 2)
        
        dataframe = pd.DataFrame(data)
        self.assertFalse(isinstance(dataframe, np.ndarray))

        cdata2 = util.convert_and_expand(dataframe)
        self.assertTrue(isinstance(cdata2, np.ndarray))
        self.assertEqual(cdata2.ndim, 2)

        cX = util.convert_and_expand(X)
        self.assertTrue(X.ndim, 1)  # inital condition
        self.assertEqual(cX.ndim, 2)

        cZ = util.convert_and_expand(Z.tolist())
        self.assertTrue(isinstance(cZ, np.ndarray))
        self.assertEqual(cZ.ndim, 2)        

        cZ_series = util.convert_and_expand(pd.Series(Z))
        self.assertTrue(isinstance(cZ_series, np.ndarray))
        self.assertEqual(cZ_series.ndim, 2)

        # test unexpected
        self.assertRaises(TypeError, util.convert_and_expand, "asdf")
        self.assertRaises(TypeError, util.convert_and_expand, 1)
        
        
if __name__ == '__main__':
    unittest.main()

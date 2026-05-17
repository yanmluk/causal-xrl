import rpy2.robjects as robjects
import rpy2.robjects.numpy2ri
from sklearn.model_selection import train_test_split
from scipy.stats import mannwhitneyu, wilcoxon, ttest_ind, ttest_1samp
import numpy as np
import sklearn.tree

from cxrl.lib.r_to_py.r_to_py import setup_R
from cxrl.lib.utils import convert_to_numpy, convert_and_expand
import time

def decision_tree_cluster(X, y, **kwargs):
    """ Clusters points based on a decision tree. 

    Args:
        X: Co-variates.
        y: Target.

    Returns:
        Unique id per point indicating its cluster and the decision tree.
    """    
    clf = sklearn.tree.DecisionTreeRegressor(**kwargs)
    clf.fit(X, y)
    clusters = clf.tree_.apply(np.asfortranarray(X.astype(sklearn.tree._tree.DTYPE)))
    return clusters, clf

class HTE:
    """ Class for managing heterogeneous treatment effects. """
    
    def cluster(self, X):
        """ Uses the HTE decision tree to cluster X. """
        return self.hte_tree.tree_.apply(np.asfortranarray(X.astype(sklearn.tree._tree.DTYPE)))
        
    def __init__(self, X, ite_per_model, min_samples_frac=0.1, max_depth=4):
        """ Constructor for HTE class. """

        ite = np.mean(ite_per_model, axis=0)  # average over model per point

        min_samples = int(X.shape[0] * min_samples_frac)
        self.hte_tree = sklearn.tree.DecisionTreeRegressor(min_samples_leaf=min_samples,
                                                           max_depth=max_depth)
        self.hte_tree.fit(X, ite)
        
        clusters = self.cluster(X)
        cids = np.unique(clusters)
        
        def is_significant(cid):
            """ Determines if any cluster has a significant ate. """
            hte = ite_per_model[:, clusters==cid]

            assert hte.shape[0] == 500  # tmp: sanity check
            lci, uci = np.quantile(hte, q=[0.025, 0.975])            
            
            assert lci <= uci  # sanity check            
            return lci > 0 or uci < 0
            
        self.is_cls_causal = {cid: is_significant(cid) for cid in cids}        

    def is_causal(self, X):
        """ Determines if each row of X is causal. """
        cids = self.cluster(X)
        return [self.is_cls_causal[c] for c in cids]
    
    
class BARTRegressor:
    """ Python wrapper for the R bartMachine package (regression). """

    def __init__(self):
        """ Minimal Constructor for bartMachine.  """
        # specify BART fit, predict and ate functions.
        
        robjects.r('''              
        library("dbarts")       

        bart_sample <- function(X, y, Xtest) {
          X <- data.frame(X)                 
          y <- sapply(y, as.numeric)         
          
         bart_machine <- bart(X, y, Xtest, nskip=200, ndpost=125, nchain=4, nthread=4, 
                              seed=99, verbose=F)
         bart_machine$yhat.test
        }

        bart_train <- function(X, y) {        
          X <- data.frame(X)                 
          y <- sapply(y, as.numeric)         
                   
          bart_machine <- bart(X, y, nskip=200, ndpost=125, nchain=4, nthread=4, 
                               keeptrees=T, verbose=F)
          bart_machine
        }
       
        bart_predict <- function(bart_machine, X) {       
          X <- data.frame(X)         
                  
          colMeans(predict(bart_machine, X))
        }
       
        individual_treatment_effects <- function(bart_machine, X1, X0) {
          X1 <- data.frame(X1)
          X0 <- data.frame(X0)
          y1 = predict(bart_machine, X1, type='bart')
          y0 = predict(bart_machine, X0, type='bart')
            
          # vector of posterior ite means per draw
          # pmean = colMeans(y1 - y0)
          # c(pmean)                    
          y1-y0
        }
        
        ate <- function(bart_machine, X1, X0) {
          X1 <- data.frame(X1)
          X0 <- data.frame(X0)
          y1 = predict(bart_machine, X1, type='bart')
          y0 = predict(bart_machine, X0, type='bart')
                  
          ite = y1 - y0
                  
          # vector of posterior ite means per draw
          pmean = rowMeans(ite)
         
          # ate
          ate_hat = mean(pmean)
          
          # 95% CI
          res = quantile(pmean, probs=c(0.025, 0.975))         
          c(ate_hat, res)
        }
        ''')
        
        self._r_train = robjects.globalenv['bart_train']
        self._r_predict = robjects.globalenv['bart_predict']
        self._r_ate = robjects.globalenv['ate']
        self._r_ite = robjects.globalenv['individual_treatment_effects']

        # directly gets the posterior samples for the test set
        self._r_sample = robjects.globalenv['bart_sample']

        self.mse = None  # cache the full model results for CITest

        # HTE for each treatment col.
        self.hte_per_treat = {}
        
        # enable R to read numpy objects
        rpy2.robjects.numpy2ri.activate()

        
    def fit(self, X, y):
        """ Fit a BART model. 

        Args:
            X: Covariates to fit.
            y: target to predict.
        """
        # convert to numpy arrays
        X = convert_and_expand(X)
        try:
            y = y.astype(float)
        except:
            raise TypeError("y must be a continuous array.")
        
        y = convert_to_numpy(y)
        self._bart_machine = self._r_train(X, y)

        
    def predict(self, X):
        """ Compute prediction by averageing from the mcmc samples. 
        
        Args:
            X: Matrix of predictors.
        
        Returns:
            Predicted values.
        """
        assert hasattr(self, "_bart_machine"), "No model has been fit."
        X = convert_and_expand(X)
        return self._r_predict(self._bart_machine, X)
    

    def ITE(self, X, trt_col, trt=1., ctrl=0., additive=False):
        """ Computes the individual treatment effect vector. 

        Args:
            X: Covariate data matrix.
            trt_col: Column index that represents the treatment attribute.
            trt: Treatment value.
            ctrl: Control value.

        Returns:
            Average treatment effect and 95% CI.
        """
        if not isinstance(trt_col, int):
            raise TypeError("trt_col must be an integer column index.")
        
        # convert to numpy arrays
        X = convert_and_expand(X)

        if trt_col >= X.shape[1]:
            raise ValueError("trt_col is not a valid index.")

        # setup treatement and control counterfactuals
        X1 = X.copy()
        X0 = X.copy()

        if additive:
            X1[:, trt_col] += trt
            X0[:, trt_col] += ctrl
        else:
            X1[:, trt_col] = trt
            X0[:, trt_col] = ctrl

        return self._r_ite(self._bart_machine, X1, X0)

    
    def is_state_causal(self, X, trt_col):
        """ Returns True if X is causal. False o.w. """
        return self.hte_per_treat[trt_col].is_causal(X)


    def local_treatments(self, X):
        """ Finds the columns of X that constitute significant treatment effects. """
        return np.array([self.is_state_causal(X, i) for i in range(X.shape[1])]).T
    

    def is_causal_HTE(self, X, trt_col, trt=1., ctrl=0., additive=False):
        """ Determines if there is a (possibly heterogeneous) causal effect. 

        Args:
            X: Covariate data matrix.
            trt_col: Column index that represents the treatment attribute.
            trt: Treatment value.
            ctrl: Control value.

        Returns:
            True if there exists a significant causal effect, False o.w.
        """
        ite_per_model = self.ITE(X, trt_col, trt, ctrl, additive)
        hte = HTE(X, ite_per_model)

        self.hte_per_treat[trt_col] = hte
        return any(v for v in hte.is_cls_causal.values())
    
    
    def ATE(self, X, trt_col, trt=1., ctrl=0., additive=False):
        """ Computes the average treatment effect for a single column. 

        Args:
            X: Covariate data matrix.
            trt_col: Column index that represents the treatment attribute.
            trt: Treatment value.
            ctrl: Control value.

        Returns:
            Average treatment effect and 95% CI.
        """
        if not isinstance(trt_col, int):
            raise TypeError("trt_col must be an integer column index.")
        
        # convert to numpy arrays
        X = convert_and_expand(X)

        if trt_col >= X.shape[1]:
            raise ValueError("trt_col is not a valid index.")

        # setup treatement and control counterfactuals
        X1 = X.copy()
        X0 = X.copy()

        if additive:
            X1[:, trt_col] += trt
            X0[:, trt_col] += ctrl
        else:
            X1[:, trt_col] = trt
            X0[:, trt_col] = ctrl

        return self._r_ate(self._bart_machine, X1, X0)
        
        
    def CITest(self, X, y, trt_col):
        """ Performs a CI test to determine if trt_col is significant. 

        Args:
            X: Covariate data matrix.
            y: target to predict.
            trt_col: Column index that represents the treatment attribute.

        Returns:
            True if trt_col is significant, False o.w.
        """
        X_train, X_est, y_train, y_est = train_test_split(X, y, test_size=0.5)

        y_hat = self._r_sample(X_train, y_train, X_est)

        # drop the trt_col
        X_train_cf = np.delete(X_train, trt_col, axis=1)
        X_est_cf = np.delete(X_est, trt_col, axis=1)

        y_hat_cf = self._r_sample(X_train_cf, y_train, X_est_cf)

        sse = (y_est - y_hat)**2
        sse_cf = (y_est - y_hat_cf)**2
    
        lci, uci = np.quantile((sse.mean(axis=1) - sse_cf.mean(axis=1)), [0.025, 0.975])
        return lci > 0 or uci < 0
        

    def CITestFast(self, X_train, y_train, X_test, y_test, trt_col):
        """ Performs a CI test to determine if trt_col is significant. 

        Args:
            X: Covariate data matrix.
            y: target to predict.
            trt_col: Column index that represents the treatment attribute.

        Returns:
            True if trt_col is significant, False o.w.
        """
        Ntr = y_train.shape[0]
        elapsed_time1 = 0.0
        elapsed_time2 = 0.0
        if self.mse is None:
            y_hat = self._r_sample(X_train, y_train, X_test)
            start_time1 = time.time()
            sse = (y_test - y_hat)**2
            self.mse = sse.mean(axis=1)
            end_time1 = time.time()
            elapsed_time1 = end_time1 - start_time1
            
        # drop the trt_col
        X_train_cf = np.delete(X_train, trt_col, axis=1)
        X_test_cf = np.delete(X_test, trt_col, axis=1)

        y_hat_cf = self._r_sample(X_train_cf, y_train, X_test_cf)
        start_time2 = time.time()
        sse_cf = (y_test - y_hat_cf)**2
        mse_cf = sse_cf.mean(axis=1)
        
        
        #lci = np.quantile((mse_cf - self.mse), 0.05)
        lci, uci = np.quantile(mse_cf, [0.05, 0.95])
        uci_f = np.quantile(self.mse, 0.95)
        end_time2 = time.time()
        elapsed_time2 = end_time2 - start_time2
        return uci_f < mse_cf.mean(), (elapsed_time1 + elapsed_time2)
        

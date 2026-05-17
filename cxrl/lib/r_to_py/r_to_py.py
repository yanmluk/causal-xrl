""" Module containing the functions to setup required R packages. """
from rpy2.robjects.packages import importr
import rpy2.robjects.packages as rpackages
from rpy2.robjects.vectors import StrVector

def setup_R():
    """ Sets up the R environment with required packages. """
    # import R's "base" package
    base = importr('base')

    # import R's "utils" package
    utils = importr('utils')

    # select a mirror for R packages
    utils.chooseCRANmirror(ind=1) # select the first mirror in the list    

    # R package names
    packnames = ('hexbin', 'dbarts', 'rJava')


    # Selectively install what needs to be install.
    # We are fancy, just because we can.
    names_to_install = [x for x in packnames if not rpackages.isinstalled(x)]
    print(names_to_install)
    if len(names_to_install) > 0:
        utils.install_packages(StrVector(names_to_install))

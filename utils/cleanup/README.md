# Cleanup Scripts


##cleanup.sh

Deletes a stack all left over resources in a given region.

    Usage : 
        REGION=<regionname> PREFIX=<PREFIX> STACK_NAME=<STACK_NAME> MASTER=<true or false> ./cleanup.sh
    Example: 
        region=eu-west-1 PREFIX=presentation STACK_NAME=presentation MASTER=false ./cleanup.sh

    Description of Parameters:
      REGION = region where script is run.
      PREFIX = resource prefix used as parameter when stack was created.
      STACK_NAME = stack name if known. service catalog stacks created with mastertemplate.yaml need this parameter to be specified.
      MASTER = boolean value to switch between product deletion mode and master (service catalog) deletion mode. Defaults to False.

##del_all_params.sh

Deletes all parameters in the parameter store for a given region.

    Usage : 
        REGION=<regionname> ./del_all_params.sh
    Example: 
        REGION=eu-west-1 ./del_all_params.sh

##del_portfolio.sh

Deletes Portfolio "ALCloud" from the Service Catalog for a given region.

    Usage : 
        region=<regionname> ./del_portfolio.sh
    Example: 
        region=eu-west-1 ./del_portfolio.sh

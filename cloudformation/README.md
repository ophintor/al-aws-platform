# Description of files

## cloudplatform.yaml
Main cloud infrastructure deployment
## containerapp.template.yaml
Used by codedeploy pipeline to deploy additional infrastructure required by app, probably a good place for the dashboard lambda stuff
## stand-alone-elasticsearch.yaml
The elasticsearch stuff is based on the json example here https://github.com/awslabs/aws-centralized-logging/blob/master/centralized-logging.template 
A stand alone elasticsearch cluster that exports and endpoint so infrastructure and application stacks can stream data to it

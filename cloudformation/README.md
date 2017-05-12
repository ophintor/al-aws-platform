# Description of files

The elasticsearch stuff is base on the json example here https://github.com/awslabs/aws-centralized-logging/blob/master/centralized-logging.template 
## infrastructure.yaml
Main cloud infrastructure deployment
## infrastructure-working-ES-and-proxy-stack.yaml
Mostly working infrastructure stack with nginx reverse proxy in front of elasticseach, currently if ES 5.1 is specified the reverse proxy doesn't work correctly so the office IP needs to be added to the cluster access policy. It seems fine with ES 2.3
## lambda-mvp.yaml
Minimal python lambda function, for integration into dashboard deployment
## myapp.template.yaml
Used by codedeploy pipeline to deploy additional infrastructure required by app, probably a good place for the dashboard lambda stuff
## stand-alone-elasticsearch.yaml
A stand alone elasticsearch cluster that exports and endpoint so infrastructure and application stacks can stream data to it

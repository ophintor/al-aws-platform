# AWS Cloud Platform

This is a cloud infrastructure build on top of AWS services. To be able to deploy this you need an AWS account.
You can use the AWS User Interface to deploy the code as well as the [CLI](https://aws.amazon.com/cli/).
Check their documentation how to configure your AWS [CLI](https://aws.amazon.com/cli/).

This repo contains a simple _todo application_ written in NodeJS and all the AWS configurations.

## How to run

The repo have a working demo that  creates several AWS resources, creates a CD (Continuous Deployment) pipeline and
Instances where the code will run. The demo uses the NodeJS code present on this repo to show the workflow.

### Prerequisites

There are only 4 regions supporting all the resources required to create the stack:

 * Virginia: **us-east-1**
 * Ohio: **us-east-2**
 * Oregon: **us-west-2**
 * Ireland: **eu-west-1**

You need also to have an AWS account and configure the [AWS CLI](https://aws.amazon.com/cli/):

 * AWS IAM user within product development account
 * AWS CLI installed
 * AWS credentials configured

If you intend to use git to push some code to codecommit, please follow the instructions on this page:
http://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-ssh-unixes.html?icmpid=docs_acc_console_connect

### Parameters Conditions Explained

 * Use DNS -> This option when enabled will map the Elastic Load Balancer to a subdomain in al-labs.co.uk
 * Use HTTPS -> This option when enabled will create a certificate using the Amazon Certificate Manager and attach it to the Elastic Load Balancer to create a secure HTTPS connection.
 * Use ElasticsearchLogs -> This option when enabled will stream logs to an Elastic Search instance.
 * Use Spot Instances -> This option when enabled will use Spot Instances instead of On-Demand Instances.
   Spot Instances cost far less than On-Demand Instances and can be used in non-critical environments like development.
   **WARNING: Spot Instances can be auto terminated by AWS when the Spot Price rises above your bid price.**
   AWS will provide a 2 minute warning and then terminate the instance.
   It is possible to fail-over to using On-Demand Instances when this happens, but this feature has not been implemented in this platform yet.

### Launch the stack

 * Use AWS console to
[![Launch Stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?region=eu-west-1&stackName=al-example&templateURL=https://s3.amazonaws.com/al-cf-templates-us-east-1/templates/infrastructure.yaml)
.

 * You can also use a *deploy* script from *utils/* folder to create the stack.

```
STACK_NAME=<stack name> REGION=<region> ./utils/deploy.sh
```

#### Manual creation

*Note*: you need to specify your key name on parameters _KeyName_!

```
aws cloudformation deploy --region "eu-west-1" --template-file "cloudformation/infrastructure.yaml" --stack-name "test-stack" --capabilities "CAPABILITY_NAMED_IAM" --parameter-overrides KeyName="mykey"
```

##### Deploy the code to code commit (It will trigger the code pipeline)

First you need to get your git repo URL (from CodeCommit) to push your code. You can go to AWS CodeCommit UI or use the AWS CLI:

```
GIT_REMOTE=$(aws cloudformation describe-stacks --region "eu-west-1" --stack-name "test-stack"  --query "Stacks[].Outputs[?OutputKey=='RepoURL'].OutputValue"  --output text)
```

Then add a new remote repository to your git and push the code

```
git remote add codecommit ${GIT_REMOTE}
git push codecommit master
```

### Cleanup

You can use a *cleanup* script from *utils/* folder to cleanup the resources created by a stack.

```
STACK_NAME=<stack name> REGION=<region> ./utils/cleanup.sh
```

####�Manual delete
To delete all the resources by hand from the demo you should execute this steps sequentially:

 1. Delete the [stack name]-Service stack. [AWS console](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1)
```
aws s3 rb --region "eu-west-1" s3://<stack name>-codepipeline-artifacts --force
```
 2. Delete the S3 bucket `<stack name>-codepipeline-artifacts`. [AWS console](https://console.aws.amazon.com/s3/home?region=eu-west-1)
```
aws ecr delete-repository --region "eu-west-1" --repository-name "<stack name>-myapp" --force
```
 3. Delete ECS Registry `<stack name>-myapp`. [AWS console](https://eu-west-1.console.aws.amazon.com/ecs/home?region=eu-west-1#/repositories)
```
aws cloudformation wait stack-delete-complete --region "eu-west-1" --stack-name "<stack name>-MyApp-Service"
```
 4. Delete the `<stack name>`. [AWS console](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1)
```
aws cloudformation delete-stack --region "eu-west-1" --stack-name <stack name>
```
 5. Delete the ACM Certificates. [AWS console](https://eu-west-1.console.aws.amazon.com/acm/home?region=eu-west-1)
```
aws acm delete-certificate --region "eu-west-1" --certificate-arn <certificate ARN>
```
 6. Delete the Log Groups from CloudWatch. [AWS console](https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#logs:)
```
aws logs delete-log-group --region "eu-west-1" --log-group-name <group name>
```

## Contributing

This repo has an **.editorconfig** file so you should install EditorConfig in your code editor/IDE to maintain code style consistency.

* VS Code - https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig
* Atom - https://atom.io/packages/editorconfig

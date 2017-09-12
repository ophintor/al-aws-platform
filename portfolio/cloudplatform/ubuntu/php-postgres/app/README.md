# AWS Cloud Platform

This is a cloud infrastructure build on top of AWS services. To be able to deploy this you need an AWS account.
You can use the AWS User Interface to deploy the code as well as the [CLI](https://aws.amazon.com/cli/).
Check their documentation how to configure your AWS [CLI](https://aws.amazon.com/cli/).

This repo contains a simple _todo application_ written in NodeJS and all the AWS configurations.

# PHP application with Postgresql Database
The application is a simple to do list that uses PHP to display items stored in a postgresql database.
All php scripts and sql schema are located in ./scripts/test directory.

The changes made to the cloudformation.json are as follows:

- LaunchConfig we are installing a series of php and apache2 packages. In the userdata, we are installing the postgresql-contrib as for some reason the stack fails to create when this is included in the packages section. In the services section we are using a restart apache2 protocol whenever an php package is installed. We are also keeping track of apache2 error log and access log files.

- RDS engine was changed from mysql to postgresql. The parameter in DBInstanceClass was also changed to "db.m4.large" as the postgresql db did not support the previously set default. This could be due to the region we were using, Oregon could not support this or the actual postgresql db itself.

## How to run

The repo have a working demo that  creates several AWS resources, creates a CD (Continuous Deployment) pipeline and
Instances where the code will run. The demo uses the NodeJS code present on this repo to show the workflow.

### Prerequisites

There are only 4 regions supporting all the resources required to create the stack:

 * Virginia: **us-east-1**
 * Oregon: **us-west-2**
 * Ireland: **eu-west-1**

You need also to have an AWS account and configure the [AWS CLI](https://aws.amazon.com/cli/):

 * AWS IAM user within product development account
 * AWS CLI installed
 * AWS credentials configured

#### Manual creation

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

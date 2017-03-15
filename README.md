# AWS Cloud Platform

This is a cloud infrastructure build on top of AWS services. To be able to deploy this you need an AWS account.
You can use the AWS User Interface to deploy the code as well as the [CLI](https://aws.amazon.com/cli/). Check their documentation how to configure your AWS CLI.

Notes:
 * The templates are only configured to use one region to keep them simple small.

## How to run

### Prerequisites

 * AWS IAM user within product development account
 * AWS CLI installed
 * AWS credentials configured

### Launch the stack

*Note*: you need to specify your key name on parameters _KeyName_!

```
aws cloudformation deploy --region "eu-west-1" --template-file "cloudformation/infrastructure.yaml" --stack-name "test-stack" --capabilities "CAPABILITY_NAMED_IAM" --parameter-overrides KeyName="mykey"
```

### Deploy the code to code commit (It will trigger the code pipeline)

First you need to get your git repo URL (from codecommit) to push your code. You can go to AWS CodeCommit UI or use the AWS CLI:

```
GIT_REMOTE=$(aws cloudformation describe-stacks --region "eu-west-1" --stack-name "test-stack"  --query "Stacks[].Outputs[?OutputKey=='RepoURL'].OutputValue"  --output text)
```

Then add a new remote repository to your git and push the code

```
git remote add codecommit ${GIT_REMOTE}
git push codecommit master
```

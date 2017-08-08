# Description of files

```
cloudformation
├── README.md
├── mastertemplate.yaml
├── portfolio
│   ├── central-logging
│   │   └── central-logging-elasticsearch.yaml
│   ├── cloudplatform
│   │   └── ubuntu
│   │       └── node-sql
│   │           ├── cloudplatform.yaml
│   │           └── containerapp.template.yaml
│   └── mappings.yaml
└── servicecatalogue
    └── lambda
        ├── lambda-cloudformation.yaml
        ├── requirements.txt
        └── sync-catalog.py
```

## mastertemplate.yaml
Template for _CodePipeline_ to manage a _Service Catalog_. The pipeline consists of a _CodeCommit_ repository and the steps to manage the portfolio and its products.

## portfolio/
### mappings.yaml
Instructions for the _CodePipeline_ defining the _Service Catalog_ portfolio and a list of products that are a part of it.

### central-logging/
#### stand-alone-elasticsearch.yaml
A stand alone Elasticsearch cluster that exports an endpoint so infrastructure and application stacks can stream data to it.

### cloudplatform/ubuntu/note-sql/
#### cloudplatform.yaml
Main _CloudFormation_ template for infrastructure deployment.
#### containerapp.template.yaml
Used by the _CodePipeline_ defined in cloudplatform.yaml to deploy an alternative container backend for the application.

## servicecatalogue/lambda
### lambda-cloudformation.yaml
_CloudFormaiton_ template to deploy a stack with the lambda code from this directory and its supporting resources.
### requirements.txt
Python dependencies to be packaged with lambda code.
### sync-catalog.py
Code of the lambda used to manage the _Service Catalog_ portfolio.

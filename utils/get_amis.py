import boto3
import sys
import argparse

REGIONS = ['us-east-1',  # US East (N. Virginia)
           'us-east-2',  # US East (Ohio)
           'us-west-1',  # US West (N. California)
           'us-west-2',  # US West (Oregon)
           'ca-central-1',  # Canada (Central)
           'eu-west-1',  # EU (Ireland)
           'eu-central-1',  # EU (Frankfurt)
           'eu-west-2',  # EU (London)
           'ap-northeast-1',  # Asia Pacific (Tokyo)
           'ap-northeast-2',  # Asia Pacific (Seoul)
           'ap-southeast-1',  # Asia Pacific (Singapore)
           'ap-southeast-2',  # Asia Pacific (Sydney)
           'ap-south-1',  # Asia Pacific (Mumbai)
           'sa-east-1'  # South America (São Paulo)
           ]

parser = argparse.ArgumentParser(
                       description='Find equivalent AMI IDs in other regions.')
parser.add_argument("region", help="AWS region of the known AMI")
parser.add_argument("known_ami", help="ID of the known AMI")
parser.add_argument("-v", "--verbose",
                    help="Enable verbose output",
                    action="store_true")
args = parser.parse_args()


def get_known_ami_details(given_ami_region, given_ami_id):
    known_ami = {}
    client = boto3.client('ec2', region_name=given_ami_region)
    filters = [{'Name': 'image-id', 'Values': [given_ami_id]}]
    fetched_ami = client.describe_images(Filters=filters)['Images'][0]
    known_ami['Name'] = fetched_ami['Name']
    known_ami['Id'] = fetched_ami['ImageId']
    return known_ami


def get_ami_ids(known_region, known_ami):
    amis = {known_region: known_ami['Id']}
    filters = [{'Name': 'name', 'Values': [known_ami['Name']]}]
    for region in [r for r in REGIONS if r != known_region]:
        if args.verbose:
            print('Getting AMI information for: {}'.format(region))
        client = boto3.client('ec2', region_name=region)
        obtained_ami = client.describe_images(Filters=filters)['Images']
        if len(obtained_ami) > 0:
            amis[region] = obtained_ami[0]['ImageId']
        else:
            amis[region] = 'No matching ami found'
    return amis


if __name__ == "__main__":
    if args.region not in REGIONS:
        print('Region {} is eiter unsupported in this version '
              'or does not exist.'.format(args.region))
        sys.exit(1)

    known_ami_details = get_known_ami_details(args.region, args.known_ami)
    print(get_ami_ids(args.region, known_ami_details))
    sys.exit(0)

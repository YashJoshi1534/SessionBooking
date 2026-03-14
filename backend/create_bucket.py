import boto3
import os
from botocore.client import Config

def create_initial_bucket():
    s3 = boto3.resource('s3',
                  endpoint_url=os.environ.get('AWS_S3_ENDPOINT_URL', 'http://minio:9000'),
                  aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID', 'minioadmin'),
                  aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY', 'minioadmin'),
                  config=Config(signature_version='s3v4'),
                  region_name='us-east-1')

    bucket_name = os.environ.get('AWS_STORAGE_BUCKET_NAME', 'sessions')
    
    try:
        s3.create_bucket(Bucket=bucket_name)
        print(f"Bucket '{bucket_name}' created successfully.")
    except Exception as e:
        if "BucketAlreadyOwnedByYou" in str(e) or "BucketAlreadyExists" in str(e):
            print(f"Bucket '{bucket_name}' already exists.")
        else:
            print(f"Error creating bucket: {e}")
            return

    # Add public-read policy
    import json
    policy = {
        "Version": "2012-10-17",
        "Statement": [{
            "Sid": "PublicRead",
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
        }]
    }
    try:
        s3.BucketPolicy(bucket_name).put(Policy=json.dumps(policy))
        print(f"Bucket policy set to public-read successfully.")
    except Exception as e:
        print(f"Error setting bucket policy: {e}")

if __name__ == "__main__":
    create_initial_bucket()

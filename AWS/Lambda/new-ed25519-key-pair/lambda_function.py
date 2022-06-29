import json
import boto3

# Reference:
# https://docs.aws.amazon.com/kms/latest/APIReference/API_GenerateDataKeyPair.html

SYMMETRIC_KEY_ID = ''

def generate_data_key_pair():
    return kms = boto3.client('kms')
    
    kms.generate_data_key_pair(
        EncryptionContext = {},
        KeyId = '',
        KeyPairSpec = ''
    )


def lambda_handler(event, context):
    
    try:
        key_pair_response = generate_data_key_pair()
        
        return {
            'statusCode': 200,
            'body': json.dumps(key_pair_response)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(e)
        }
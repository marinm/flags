import json
import boto3

SYMMETRIC_KEY_ID  = '777baedc-96c4-45b6-84ce-0543263bbce5'
KEY_PAIR_SPEC     = 'ECC_SECG_P256K1'


def generate_data_key_pair():
    kms = boto3.client('kms')
    
    return kms.generate_data_key_pair(
        EncryptionContext = {},
        KeyId = SYMMETRIC_KEY_ID,
        KeyPairSpec = KEY_PAIR_SPEC,
        GrantTokens = []
    )


def lambda_handler(event, context):
    
    try:
        kms_response = generate_data_key_pair()
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'private': kms_response['PrivateKeyPlaintext'].hex(),
                'public': kms_response['PublicKey'].hex()
            })
        }

    except Exception as e:
        print(e);
        return {
            'statusCode': 500,
            'body': json.dumps('Error')
        }
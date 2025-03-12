// audit_producer/index.js
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const dynamoDBClient = new DynamoDBClient({ region: 'eu-central-1' });
const AUDIT_TABLE_NAME = 'cmtr-32249428-Audit-fqn8';

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        const { eventName, dynamodb } = record;

        if (!dynamodb || !dynamodb.Keys) {
            console.warn('Invalid DynamoDB event format:', record);
            continue;
        }

        const itemKey = dynamodb.Keys.key.S;
        const modificationTime = new Date().toISOString();
        let oldValue = null;
        let newValue = null;

        if (eventName === 'INSERT' || eventName === 'MODIFY') {
            newValue = dynamodb.NewImage?.value?.N ? parseInt(dynamodb.NewImage.value.N) : null;
        }
        
        if (eventName === 'MODIFY' || eventName === 'REMOVE') {
            oldValue = dynamodb.OldImage?.value?.N ? parseInt(dynamodb.OldImage.value.N) : null;
        }

        const auditRecord = {
            id: { S: uuidv4() },
            itemKey: { S: itemKey },
            modificationTime: { S: modificationTime },
            newValue: newValue !== null ? { N: newValue.toString() } : { NULL: true },
            oldValue: oldValue !== null ? { N: oldValue.toString() } : { NULL: true },
            updatedAttribute: { S: 'value' }
        };

        try {
            const putCommand = new PutItemCommand({
                TableName: AUDIT_TABLE_NAME,
                Item: auditRecord
            });

            await dynamoDBClient.send(putCommand);
            console.log('Audit record saved:', auditRecord);
        } catch (error) {
            console.error('Error saving audit record:', error);
        }
    }
};
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const AUDIT_TABLE_NAME = process.env.AUDIT_TABLE_NAME || 'Audit';

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        const { eventName, dynamodb } = record;
        
        let auditEntry = {
            audit_id: `${dynamodb.Keys.config_id.S}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            event_type: eventName,
        };
        
        if (eventName === 'INSERT') {
            auditEntry.details = {
                newItem: AWS.DynamoDB.Converter.unmarshall(dynamodb.NewImage)
            };
        } else if (eventName === 'MODIFY') {
            auditEntry.details = {
                oldItem: AWS.DynamoDB.Converter.unmarshall(dynamodb.OldImage),
                newItem: AWS.DynamoDB.Converter.unmarshall(dynamodb.NewImage)
            };
        } else if (eventName === 'REMOVE') {
            auditEntry.details = {
                deletedItem: AWS.DynamoDB.Converter.unmarshall(dynamodb.OldImage)
            };
        }

        try {
            await dynamoDB.put({
                TableName: AUDIT_TABLE_NAME,
                Item: auditEntry
            }).promise();
            console.log('Audit entry saved:', auditEntry);
        } catch (error) {
            console.error('Failed to save audit entry:', error);
        }
    }

    return { statusCode: 200, body: 'Audit processing complete!' };
};

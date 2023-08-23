import {DynamoDBDocumentClient, ScanCommand} from "@aws-sdk/lib-dynamodb";
import {UpdateItemCommand} from "@aws-sdk/client-dynamodb";

export async function handleDisconnect(connectionId: string, tableName: string, ddbClient: DynamoDBDocumentClient) {
    const topics = await ddbClient.send(new ScanCommand({
        TableName: tableName,
    }));
    
    for (const topic of topics?.Items ?? []) {
        const receivers = topic.receivers ?? [];
        if (receivers.includes(connectionId)) {
            await ddbClient.send(new UpdateItemCommand({
                TableName: tableName,
                Key: { name: topic.name },
                UpdateExpression: 'DELETE receivers :receivers',
                ExpressionAttributeValues: {
                    ':receivers': [connectionId],
                } as any,
            }));
        }
    }
    
    console.log('Disconnected: ' + connectionId);
}

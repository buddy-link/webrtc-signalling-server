import {DynamoDBDocumentClient, ScanCommand} from "@aws-sdk/lib-dynamodb";
import {UpdateItemCommand} from "@aws-sdk/client-dynamodb";

export default class TopicsRepository {
    private readonly ddbClient: DynamoDBDocumentClient;
    private readonly tableName: string;

    constructor(ddbClient: DynamoDBDocumentClient, tableName: string) {
        this.ddbClient = ddbClient;
        this.tableName = tableName;
    }

    async unsubscribeAll(connectionId: string) {
        const topics = await this.ddbClient.send(new ScanCommand({
            TableName: this.tableName,
        }));

        for (const topic of topics?.Items ?? []) {
            const receivers = topic.receivers ?? [];
            if (receivers.includes(connectionId)) {
                await this.unsubscribeFromTopic(topic.name, connectionId);
            }
        }
    }

    async unsubscribeFromTopic(topicName: string, connectionId: string) {
        await this.ddbClient.send(new UpdateItemCommand({
            TableName: this.tableName,
            Key: { name: topicName } as any,
            UpdateExpression: 'DELETE receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': [connectionId],
            } as any,
        }));
    }
}
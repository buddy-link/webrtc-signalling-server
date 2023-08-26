import {DynamoDBDocumentClient, ScanCommand} from "@aws-sdk/lib-dynamodb";
import {GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";

export default class TopicsRepository {
    private readonly ddbClient: DynamoDBDocumentClient;
    private readonly tableName: string;

    constructor(ddbClient: DynamoDBDocumentClient, tableName: string) {
        this.ddbClient = ddbClient;
        this.tableName = tableName;
    }

    async unsubscribeFromAll(connectionId: string) {
        console.debug(`Unsubscribing from all topics: ${connectionId}`);
        const topics = await this.ddbClient.send(new ScanCommand({
            TableName: this.tableName,
        }));

        for (const topic of topics?.Items ?? []) {
            const receivers = Array.from(topic.receivers ?? new Set());
            if (receivers.includes(connectionId)) {
                await this.unsubscribeFromTopic(topic.name, connectionId);
            }
        }
    }

    async unsubscribeFromTopic(topicName: string, connectionId: string) {
        console.debug(`Unsubscribing from topic: topic=${topicName}, connection=${connectionId}`);
        await this.ddbClient.send(new UpdateItemCommand({
            TableName: this.tableName,
            Key: { name: { 'S': topicName } },
            UpdateExpression: 'DELETE receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': {
                    SS: [connectionId]
                },
            },
        }));
    }

    async subscribeToTopic(topicName: string, connectionId: string) {
        console.debug(`Subscribing to topic: topic=${topicName}, connection=${connectionId}`);
        await this.ddbClient.send(new UpdateItemCommand({
            TableName: this.tableName,
            Key: { name: { 'S': topicName } },
            UpdateExpression: 'ADD receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': {
                    SS: [connectionId]
                },
            },
        }));
    }

    async getReceiversForTopic(topicName: string): Promise<Array<string>> {
        console.debug(`Retrieving receivers for topic: ${topicName}`);
        const result = await this.ddbClient.send(new GetItemCommand({
            TableName: this.tableName,
            Key: { name: { 'S': topicName } },
        }));
        
        return Array.from((result?.Item?.receivers?.SS ?? new Set()) as Set<string>);
    }
}
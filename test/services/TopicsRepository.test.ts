import {mockClient} from "aws-sdk-client-mock";
import {DynamoDBDocumentClient, ScanCommand} from "@aws-sdk/lib-dynamodb";
import {GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import 'aws-sdk-client-mock-jest';
import TopicsRepository from "../../lib/services/TopicsRepository";

describe('TopicsRepository', () => {
    let ddbMock: any;
    let topicsRepository: TopicsRepository;

    beforeEach(() => {
        ddbMock = mockClient(DynamoDBDocumentClient);
        topicsRepository = new TopicsRepository(ddbMock, 'test-topics-table');
    })

    afterEach(() => {
        ddbMock.reset();
    })

    it('can unsubscribe a connection from every topic', async () => {
        ddbMock.on(ScanCommand).resolves({
            Items: [
                { name: 'topic-1', receivers: new Set(['connection-1', 'connection-2']) },
                { name: 'topic-2', receivers: new Set(['connection-2', 'connection-3']) },
                { name: 'topic-3', receivers: new Set(['connection-3', 'connection-1']) },
            ]
        });

        await topicsRepository.unsubscribeFromAll('connection-1');

        expect(ddbMock).toHaveReceivedCommandWith(UpdateItemCommand, {
            TableName: 'test-topics-table',
            Key: { name: { S: 'topic-1' } },
            UpdateExpression: 'DELETE receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': { SS: ['connection-1'] },
            }
        })
        expect(ddbMock).toHaveReceivedCommandWith(UpdateItemCommand, {
            TableName: 'test-topics-table',
            Key: { name: { S: 'topic-3' } },
            UpdateExpression: 'DELETE receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': { SS: ['connection-1'] },
            }
        })
    });

    it('handles a topic with no receivers when unsubscribing a connection from all topics', async () => {
        ddbMock.on(ScanCommand).resolves({
            Items: [
                { name: 'topic-1' },
                { name: 'topic-3', receivers: new Set(['connection-3', 'connection-1']) },
            ]
        });

        await topicsRepository.unsubscribeFromAll('connection-1');

        expect(ddbMock).toHaveReceivedCommandWith(UpdateItemCommand, {
            TableName: 'test-topics-table',
            Key: { name: { S: 'topic-3' } },
            UpdateExpression: 'DELETE receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': { SS: ['connection-1'] },
            }
        })
    });

    it('can unsubscribe a connection from a single topic', async () => {
        await topicsRepository.unsubscribeFromTopic('topic-1', 'connection-1');

        expect(ddbMock).toHaveReceivedCommandWith(UpdateItemCommand, {
            TableName: 'test-topics-table',
            Key: { name: { S: 'topic-1' } },
            UpdateExpression: 'DELETE receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': { SS: ['connection-1'] },
            }
        })
    })

    it('can subscribe a connection to a single topic', async () => {
        await topicsRepository.subscribeToTopic('topic-1', 'connection-1');

        expect(ddbMock).toHaveReceivedCommandWith(UpdateItemCommand, {
            TableName: 'test-topics-table',
            Key: { name: { S: 'topic-1' } },
            UpdateExpression: 'ADD receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': { SS: ['connection-1'] },
            }
        })
    })

    it('can return the receivers for a topic', async () => {
        ddbMock.on(GetItemCommand, {
            TableName: 'test-topics-table',
            Key: { name: { S: 'topic-1' } },
        }).resolves({
            Item: {
                name: { S: 'topic-1' },
                receivers: { SS: new Set(['connection-1', 'connection-2']) },
            }
        });
        
        const result = await topicsRepository.getReceiversForTopic('topic-1');

        expect(result).toEqual([
            'connection-1',
            'connection-2',
        ])
    })
})

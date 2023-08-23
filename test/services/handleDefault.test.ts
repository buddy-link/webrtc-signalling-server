import {handleDefault} from "../../lib/services/handleDefault";
import {UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import TopicsRepository from "../../lib/services/TopicsRepository";
import {mockClient} from "aws-sdk-client-mock";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";
import 'aws-sdk-client-mock-jest';

describe('Default', () => {
    let log: any;
    let ddbMock: any;
    let topicsRepository: TopicsRepository;

    beforeEach(() => {
        log = jest.spyOn(console, 'log').mockImplementation(() => {});
        ddbMock = mockClient(DynamoDBDocumentClient);
        topicsRepository = new TopicsRepository(ddbMock, 'test-topics-table');
    })

    afterEach(() => {
        log.mockReset();
        ddbMock.reset();
    })

    it('logs that a client sent a message', async () => {
        const event= {
            type: 'unsubscribe',
            topics: ['topic-1', 'topic-2'],
        } as any;
        
        await handleDefault('connection-id', event, topicsRepository);

        expect(log).toBeCalledWith('Received from: connection-id');
    });
    
    it('handles the unsubscribe event', async () => {
        const unsubscribeEvent= {
            type: 'unsubscribe',
            topics: ['topic-1', 'topic-2'],
        } as any;
        
        await handleDefault('connection-1', unsubscribeEvent, topicsRepository);

        expect(ddbMock).toHaveReceivedCommandWith(UpdateItemCommand, {
            TableName: 'test-topics-table',
            Key: { name: 'topic-1' } as any,
            UpdateExpression: 'DELETE receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': ['connection-1'],
            } as any
        })
        expect(ddbMock).toHaveReceivedCommandWith(UpdateItemCommand, {
            TableName: 'test-topics-table',
            Key: { name: 'topic-2' } as any,
            UpdateExpression: 'DELETE receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': ['connection-1'],
            } as any
        })
    })

    it('handles the subscribe event', async () => {
        const subscribeEvent = {
            type: 'subscribe',
            topics: ['topic-1', 'topic-2'],
        } as any;

        await handleDefault('connection-1', subscribeEvent, topicsRepository);

        expect(ddbMock).toHaveReceivedCommandWith(UpdateItemCommand, {
            TableName: 'test-topics-table',
            Key: { name: 'topic-1' } as any,
            UpdateExpression: 'ADD receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': ['connection-1'],
            } as any
        })
        expect(ddbMock).toHaveReceivedCommandWith(UpdateItemCommand, {
            TableName: 'test-topics-table',
            Key: { name: 'topic-2' } as any,
            UpdateExpression: 'ADD receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': ['connection-1'],
            } as any
        })
    })

    it('does nothing if the event has no type', async () => {
        await expect(handleDefault('connection-1', undefined as any, topicsRepository)).resolves.not.toThrowError();
    })
})

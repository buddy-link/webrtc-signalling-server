import {handleDisconnect} from "../../lib/lambdas/handleDisconnect";
import {mockClient} from "aws-sdk-client-mock";
import {DynamoDBDocumentClient, ScanCommand} from "@aws-sdk/lib-dynamodb";
import {UpdateItemCommand} from "@aws-sdk/client-dynamodb"; 
import 'aws-sdk-client-mock-jest';

describe('Disconnect', () => {
    let log: any;
    let ddbMock: any;

    beforeEach(() => {
        log = jest.spyOn(console, 'log').mockImplementation(() => {});
        ddbMock = mockClient(DynamoDBDocumentClient);
    })

    afterEach(() => {
        log.mockReset();
        ddbMock.reset();
    })

    it('logs that a client disconnected', async () => {
        await handleDisconnect('connection-id', 'test-topics-table', ddbMock);

        expect(log).toBeCalledWith('Disconnected: connection-id');
    });

    it('removes the client from each topic they are a receiver on', async () => {
        ddbMock.on(ScanCommand).resolves({
            Items: [
                { name: 'topic-1', receivers: ['connection-1', 'connection-2'] },
                { name: 'topic-2', receivers: ['connection-2', 'connection-3'] },
                { name: 'topic-3', receivers: ['connection-3', 'connection-1'] },
            ]
        });

        await handleDisconnect('connection-1', 'test-topics-table', ddbMock);
        
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
            Key: { name: 'topic-3' } as any,
            UpdateExpression: 'DELETE receivers :receivers',
            ExpressionAttributeValues: {
                ':receivers': ['connection-1'],
            } as any
        })
    });
})

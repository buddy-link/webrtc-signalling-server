import {handleDisconnect} from "../../lib/services/handleDisconnect";
import {mockClient} from "aws-sdk-client-mock";
import {DynamoDBDocumentClient, ScanCommand} from "@aws-sdk/lib-dynamodb";
import {UpdateItemCommand} from "@aws-sdk/client-dynamodb"; 
import 'aws-sdk-client-mock-jest';
import TopicsRepository from "../../lib/services/TopicsRepository";

describe('Disconnect', () => {
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

    it('logs that a client disconnected', async () => {
        await handleDisconnect('connection-id', topicsRepository);

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

        await handleDisconnect('connection-1', topicsRepository);
        
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
})

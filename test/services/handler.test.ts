import { handler } from "../../lib/services/handler";
import {mockClient} from "aws-sdk-client-mock";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";

describe('handler', () => {
    const env = process.env;
    let error: any;
    let log: any;
    let ddbMock: any;

    beforeEach(() => {
        jest.resetModules();
        error = jest.spyOn(console, 'error').mockImplementation(() => {});
        log = jest.spyOn(console, 'log').mockImplementation(() => {});
        process.env = { 
            ...env,
            TOPICS_TABLE: 'test-topics-table',
        };
        ddbMock = mockClient(DynamoDBDocumentClient);
    })
    
    afterEach(() => {
        process.env = env;
        error.mockReset();
        log.mockReset();
        ddbMock.reset();
    })
    
    it('returns a 502 if there is no TOPICS_TABLE environment variable', async () => {
        process.env.TOPICS_TABLE = undefined;
        
        const result = await handler({} as any);
        
        expect(result.statusCode).toBe(502);
        expect(result.body).toBe(JSON.stringify('Bad Gateway'));
        expect(error).toBeCalledWith('TOPICS_TABLE not configured.');
    });

    it('returns a 200 if there is a TOPICS_TABLE environment variable', async () => {
        process.env.TOPICS_TABLE = 'test-topics-table';
        
        const result = await handler({
            requestContext: {
                routeKey: '$default'
            },
            body: '{}',
        } as any);

        expect(result.statusCode).toBe(200);
    });
    
    it.each([
        ['$connect'],
        ['$disconnect'],
        ['$default'],
    ])('handles the %s event', async (routeKey: string) => {
        const result = await handler({
            requestContext: {
                routeKey,
                connectionId: 'connection-id',
            },
            body: '{}'
        } as any);

        expect(result.statusCode).toBe(200);
    });

    it('returns a 500 if there it is passed an invalid payload', async () => {
        const result = await handler({} as any);

        expect(result.statusCode).toBe(500);
        expect(error).toBeCalledTimes(1);
    });
});
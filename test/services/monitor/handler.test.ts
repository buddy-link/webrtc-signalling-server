import {handler} from "../../../lib/services/monitor/handler";

describe('handler', () => {
    const env = process.env;
    let error: any;
    const secretResponse = {
        SecretString: "https://localhost:3000/",
    };
    const fetchSpy = jest.fn(() => Promise.resolve({ json: () => secretResponse } as any));

    beforeEach(() => {
        jest.resetModules();
        global.fetch = fetchSpy;
        error = jest.spyOn(console, 'error').mockImplementation(() => {});
        process.env = {
            ...env,
            AWS_SESSION_TOKEN: 'aws-session-token',
        };
    })

    afterEach(() => {
        jest.clearAllMocks();
        process.env = env;
        error.mockReset();
        fetchSpy.mockClear();
        // @ts-ignore
        delete global.fetch;
    })
    
    it('makes a request to the webhook for each record in SnsEvents', async () => {
        await handler({
            Records: [
                {
                    Sns: {
                        Message: 'Test message 1'
                    }
                },
                {
                    Sns: {
                        Message: 'Test message 2'
                    }
                },
            ]
        } as any)

        expect(fetchSpy).toHaveBeenCalledTimes(3);
        expect(fetchSpy).toHaveBeenCalledWith('https://localhost:3000/', {
            method: 'POST',
            body: JSON.stringify({
                text: 'Houston, we have a problem: Test message 1'
            })
        })
        expect(fetchSpy).toHaveBeenCalledWith('https://localhost:3000/', {
            method: 'POST',
            body: JSON.stringify({
                text: 'Houston, we have a problem: Test message 2'
            })
        })
    })

    test('does not make requests when there are no records in SnsEvents', async () => {
        await handler({
            Records: []
        } as any)

        expect(fetchSpy).not.toHaveBeenCalled();
    })
});
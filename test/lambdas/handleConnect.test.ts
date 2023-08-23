import {handleConnect} from "../../lib/lambdas/handleConnect";

describe('Connect', () => {
    let log: any;

    beforeEach(() => {
        log = jest.spyOn(console, 'log').mockImplementation(() => {});
    })

    afterEach(() => {
        log.mockReset();
    })

    it('logs that a client connected', async () => {
        await handleConnect('connection-id');

        expect(log).toBeCalledWith('Connected: connection-id');
    });
})
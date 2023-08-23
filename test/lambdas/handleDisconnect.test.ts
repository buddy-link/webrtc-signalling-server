import {handleDisconnect} from "../../lib/lambdas/handleDisconnect";

describe('Disconnect', () => {
    let log: any;

    beforeEach(() => {
        log = jest.spyOn(console, 'log').mockImplementation(() => {});
    })

    afterEach(() => {
        log.mockReset();
    })

    it('logs that a client disconnected', async () => {
        await handleDisconnect('connection-id');

        expect(log).toBeCalledWith('Disconnected: connection-id');
    });
})

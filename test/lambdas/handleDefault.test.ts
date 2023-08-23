import {handleDefault} from "../../lib/lambdas/handleDefault";

describe('Default', () => {
    let log: any;

    beforeEach(() => {
        log = jest.spyOn(console, 'log').mockImplementation(() => {});
    })

    afterEach(() => {
        log.mockReset();
    })

    it('logs that a client sent a message', async () => {
        await handleDefault('connection-id');

        expect(log).toBeCalledWith('Received from: connection-id');
    });
})

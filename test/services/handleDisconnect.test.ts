import {handleDisconnect} from "../../lib/services/handleDisconnect";

describe('Disconnect', () => {
    let log: any;
    let topicsRepository: any;

    beforeEach(() => {
        log = jest.spyOn(console, 'log').mockImplementation(() => {});
        topicsRepository = {
            unsubscribeFromAll: jest.fn(() => Promise.resolve()),
            unsubscribeFromTopic: jest.fn(() => Promise.resolve()),
            subscribeToTopic: jest.fn(() => Promise.resolve()),
        }
    })

    afterEach(() => {
        log.mockReset();
    })

    it('logs that a client disconnected', async () => {
        await handleDisconnect('connection-id', topicsRepository);

        expect(log).toBeCalledWith('Disconnected: connection-id');
    });

    it('removes the client from each topic they are a receiver on', async () => {
        await handleDisconnect('connection-1', topicsRepository);
        
        expect(topicsRepository.unsubscribeFromAll).toHaveBeenCalledTimes(1);
    });
})

import {handleDefault} from "../../lib/services/handleDefault";

describe('Default', () => {
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

        expect(topicsRepository.unsubscribeFromTopic).toHaveBeenCalledWith('topic-1', 'connection-1')
        expect(topicsRepository.unsubscribeFromTopic).toHaveBeenCalledWith('topic-2', 'connection-1')
    })

    it('handles the subscribe event', async () => {
        const subscribeEvent = {
            type: 'subscribe',
            topics: ['topic-1', 'topic-2'],
        } as any;

        await handleDefault('connection-1', subscribeEvent, topicsRepository);

        expect(topicsRepository.subscribeToTopic).toHaveBeenCalledWith('topic-1', 'connection-1')
        expect(topicsRepository.subscribeToTopic).toHaveBeenCalledWith('topic-2', 'connection-1')
    })

    it('does nothing if the event has no type', async () => {
        await expect(handleDefault('connection-1', undefined as any, topicsRepository)).resolves.not.toThrowError();
    })
})

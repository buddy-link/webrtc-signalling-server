import TopicsRepository from "./TopicsRepository";

interface SubscribeEvent {
    type: 'subscribe',
    topics?: string[];
}

interface UnsubscribeEvent {
    type: 'unsubscribe',
    topics?: string[];
}

export async function handleDefault(
    connectionId: string,
    event:
        | SubscribeEvent
        | UnsubscribeEvent,
    topicsRepository: TopicsRepository
) {
    console.log('Received from: ' + connectionId);
    
    if (event && event.type) {
        switch(event.type) {
            case 'subscribe':
                for (const topic of (event.topics || [])) {
                    await topicsRepository.subscribeToTopic(topic, connectionId);
                }
                break;
            case 'unsubscribe':
                for (const topic of (event.topics || [])) {
                    await topicsRepository.unsubscribeFromTopic(topic, connectionId);
                }
                break;
        }
    }
}

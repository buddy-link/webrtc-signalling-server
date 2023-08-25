import TopicsRepository from "./TopicsRepository";
import EventBus from "./EventBus";

interface SubscribeEvent {
    type: 'subscribe';
    topics?: string[];
}

interface UnsubscribeEvent {
    type: 'unsubscribe';
    topics?: string[];
}

interface PingEvent {
    type: 'ping';
}

interface PublishEvent {
    type: 'publish';
    topic?: string;
    [k: string]: any;
}

export async function handleDefault(
    connectionId: string,
    event:
        | PublishEvent
        | PingEvent
        | SubscribeEvent
        | UnsubscribeEvent,
    topicsRepository: TopicsRepository,
    eventBus: EventBus,
) {
    console.log('Received from: ' + connectionId);
    
    if (event && event.type) {
        switch(event.type) {
            case "publish":
                if (event.topic) {
                    const receivers = await topicsRepository.getReceiversForTopic(event.topic);
                    for (const receiver of receivers) {
                        await eventBus.send(receiver, event);
                    }
                }
                break;
            case 'ping':
                await eventBus.send(connectionId, { type: 'pong' });
                break;
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

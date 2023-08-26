import TopicsRepository from "./TopicsRepository";
import EventBus from "./EventBus";

interface SubscribeEvent {
  type: "subscribe";
  topics?: string[];
}

interface UnsubscribeEvent {
  type: "unsubscribe";
  topics?: string[];
}

interface PingEvent {
  type: "ping";
}

interface PublishEvent {
  type: "publish";
  topic?: string;
  [k: string]: any;
}

export async function handleDefault(
  connectionId: string,
  event: PublishEvent | PingEvent | SubscribeEvent | UnsubscribeEvent,
  topicsRepository: TopicsRepository,
  eventBus: EventBus,
) {
  if (event && event.type) {
    switch (event.type) {
      case "publish":
        console.log("Handling publish event.");
        if (event.topic) {
          const receivers = await topicsRepository.getReceiversForTopic(
            event.topic,
          );
          for (const receiver of receivers) {
            await eventBus.send(receiver, event);
          }
        }
        break;
      case "ping":
        console.log("Handling ping event.");
        await eventBus.send(connectionId, { type: "pong" });
        break;
      case "subscribe":
        console.log("Handling subscribe event.");
        for (const topic of event.topics || []) {
          await topicsRepository.subscribeToTopic(topic, connectionId);
        }
        break;
      case "unsubscribe":
        console.log("Handling unsubscribe event.");
        for (const topic of event.topics || []) {
          await topicsRepository.unsubscribeFromTopic(topic, connectionId);
        }
        break;
    }
  }
}

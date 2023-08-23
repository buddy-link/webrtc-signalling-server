import TopicsRepository from "./TopicsRepository";

export async function handleDisconnect(connectionId: string, topicsRepository: TopicsRepository) {
    await topicsRepository.unsubscribeFromAll(connectionId);
    
    console.log('Disconnected: ' + connectionId);
}

import {ApiGatewayManagementApiClient, PostToConnectionCommand} from '@aws-sdk/client-apigatewaymanagementapi';
import TopicsRepository from "./TopicsRepository";

export default class EventBus {
    private readonly apiClient: ApiGatewayManagementApiClient;
    private readonly topicsRepository: TopicsRepository;
    
    constructor(apiClient: ApiGatewayManagementApiClient, topicsRepository: TopicsRepository) {
        this.apiClient = apiClient;
        this.topicsRepository = topicsRepository;
    }

    async send(connectionId: string, event: any) {
        try {
            await this.apiClient.send(new PostToConnectionCommand({
                ConnectionId: connectionId,
                Data: JSON.stringify(event),
            }))
        } catch (error: any) {
            if (error.statusCode === 410) {
                await this.topicsRepository.unsubscribeFromAll(connectionId);
            } else {
                throw error;
            }
        }
    }
}

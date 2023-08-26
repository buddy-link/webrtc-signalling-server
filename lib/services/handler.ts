import {APIGatewayProxyStructuredResultV2, APIGatewayProxyWebsocketEventV2} from "aws-lambda";
import {handleConnect} from "./handleConnect";
import {handleDisconnect} from "./handleDisconnect";
import {handleDefault} from "./handleDefault";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";
import {ApiGatewayManagementApiClient} from "@aws-sdk/client-apigatewaymanagementapi";
import TopicsRepository from "./TopicsRepository";
import EventBus from "./EventBus";

let topicsRepository: TopicsRepository | undefined;
let eventBus: EventBus | undefined;

export async function handler(event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    if (!process.env.TOPICS_TABLE) {
        console.error('TOPICS_TABLE not configured.')
        
        return {
            statusCode: 502,
            body: JSON.stringify('Bad Gateway'),
        }
    }
    
    try {
        if (!topicsRepository) {
            console.log('Instantiating topic repository.');
            const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
            topicsRepository = new TopicsRepository(ddbDocClient, process.env.TOPICS_TABLE);
        }
        if (!eventBus) {
            console.log('Instantiating event bus.');
            const { domainName, stage } = event.requestContext;
            const callbackUrl = `https://${domainName}/${stage}`;
            const apiClient = new ApiGatewayManagementApiClient({
                endpoint: callbackUrl,
            });
            eventBus = new EventBus(apiClient, topicsRepository);
        }
        
        const { connectionId } = event.requestContext;
        
        switch (event.requestContext.routeKey) {
            case '$connect':
                console.log(`Handling $connect route: ${connectionId}`);
                await handleConnect(connectionId);
                break;
            case '$disconnect':
                console.log(`Handling $disconnect route: ${connectionId}`);
                await handleDisconnect(connectionId, topicsRepository);
                break;
            case '$default':
                console.log(`Handling $default route: ${connectionId}`);
                await handleDefault(connectionId, JSON.parse(event.body!), topicsRepository, eventBus);
                break;
        }
        
        return { statusCode: 200 };
    } catch (error: any) {
        console.error(error.message);
        
        return {
            statusCode: 500,
            body: JSON.stringify(error.message),
        }
    }
}
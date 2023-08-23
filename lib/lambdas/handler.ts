import {APIGatewayProxyStructuredResultV2, APIGatewayProxyWebsocketEventV2} from "aws-lambda";
import {handleConnect} from "./handleConnect";
import {handleDisconnect} from "./handleDisconnect";
import {handleDefault} from "./handleDefault";

export async function handler(event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    if (!process.env.TOPICS_TABLE) {
        console.error('TOPICS_TABLE not configured.')
        
        return {
            statusCode: 502,
            body: JSON.stringify('Bad Gateway'),
        }
    }
    
    try {
        switch (event.requestContext.routeKey) {
            case '$connect':
                await handleConnect(event.requestContext.connectionId);
                break;
            case '$disconnect':
                await handleDisconnect(event.requestContext.connectionId);
                break;
            case '$default':
                await handleDefault(event.requestContext.connectionId);
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
import {APIGatewayProxyResultV2, APIGatewayProxyWebsocketEventV2} from "aws-lambda";

export async function handler(event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResultV2> {
    return {
        statusCode: 200,
        body: JSON.stringify('Thanks for your message!')
    };
}
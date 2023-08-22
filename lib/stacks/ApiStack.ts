import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {WebSocketApi, WebSocketStage} from "@aws-cdk/aws-apigatewayv2-alpha";
import {WebSocketLambdaIntegration} from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import {IFunction} from "aws-cdk-lib/aws-lambda";

interface ApiStackProps extends StackProps {
    stageName?: string
    handler: IFunction
}

export class ApiStack extends Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);
        
        const lambdaIntegration = new WebSocketLambdaIntegration('WebRtcLambdaIntegration', props.handler);
        
        const webSocketApi = new WebSocketApi(this, 'WebRtcWebSocketApi', {
            connectRouteOptions: {
                integration: lambdaIntegration,
            },
            disconnectRouteOptions: {
                integration: lambdaIntegration,
            },
            defaultRouteOptions: {
                integration: lambdaIntegration,
            },
        })
        
        new WebSocketStage(this, 'WebRtcWebSocketStage', {
            webSocketApi,
            stageName: props.stageName!,
            autoDeploy: true,
        });
    }
}
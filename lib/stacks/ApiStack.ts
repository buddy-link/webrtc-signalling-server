import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { WebSocketApi, WebSocketStage } from "@aws-cdk/aws-apigatewayv2-alpha";
import { WebSocketLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

interface ApiStackProps extends StackProps {
  stageName?: string;
  topicsTable: ITable;
}

export class ApiStack extends Stack {
  public readonly webSocketApi: WebSocketApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const handler = new NodejsFunction(this, "WebRtcLambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: join(__dirname, "..", "services", "handler.ts"),
      environment: {
        TOPICS_TABLE: props.topicsTable.tableName,
      },
    });

    handler.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [props.topicsTable.tableArn],
        actions: [
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
        ],
      }),
    );

    this.webSocketApi = new WebSocketApi(this, "WebRtcWebSocketApi", {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "WebRtcConnectIntegration",
          handler,
        ),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "WebRtcDisconnectIntegration",
          handler,
        ),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "WebRtcDefaultIntegration",
          handler,
        ),
      },
      routeSelectionExpression: "$request.body.type",
    });
    this.webSocketApi.grantManageConnections(handler);

    new WebSocketStage(this, "WebRtcWebSocketStage", {
      webSocketApi: this.webSocketApi,
      stageName: props.stageName!,
      autoDeploy: true,
    });
  }
}

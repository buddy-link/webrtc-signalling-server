import {Duration, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Alarm, Metric, Unit} from "aws-cdk-lib/aws-cloudwatch";
import {WebSocketApi} from "@aws-cdk/aws-apigatewayv2-alpha";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {LayerVersion, Runtime} from "aws-cdk-lib/aws-lambda";
import {join} from "path";
import {Topic} from "aws-cdk-lib/aws-sns";
import {LambdaSubscription} from "aws-cdk-lib/aws-sns-subscriptions";
import {SnsAction} from "aws-cdk-lib/aws-cloudwatch-actions";
import {Secret} from "aws-cdk-lib/aws-secretsmanager";

interface MonitorStackProps extends StackProps {
    stageName?: string
    webSocketApi: WebSocketApi
}

export class MonitorStack extends Stack {
    constructor(scope: Construct, id: string, props: MonitorStackProps) {
        super(scope, id, props);
        
        const secretsExtensionArn = 'arn:aws:lambda:eu-west-1:015030872274:layer:AWS-Parameters-and-Secrets-Lambda-Extension:4';
        
        const webHookLambda = new NodejsFunction(this, 'WebRtcWebHookLambda', {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: (join(__dirname, '..', 'services', 'monitor', 'handler.ts')),
            layers: [
                LayerVersion.fromLayerVersionArn(this, 'SecretsExtensionLayer', secretsExtensionArn),
            ]
        });
        
        const webHookUrlSecret = Secret.fromSecretNameV2(this, 'WebRtcWebHookUrlSecret', 'webrtc-slack-webhook-url');
        webHookUrlSecret.grantRead(webHookLambda);
        
        const alarmTopic = new Topic(this, 'WebRtcAlarmTopic', {
            displayName: 'WebRtcAlarmTopic',
            topicName: 'WebRtcAlarmTopic',
        });
        alarmTopic.addSubscription(new LambdaSubscription(webHookLambda));
        
        const executionErrorAlarm = new Alarm(this, 'WebRtcExecutionErrorAlarm', {
            metric: new Metric({
                metricName: 'ExecutionError',
                namespace: 'AWS/ApiGateway',
                period: Duration.minutes(1),
                statistic: 'Sum',
                unit: Unit.COUNT,
                dimensionsMap: {
                    ApiId: props.webSocketApi.apiId,
                }
            }),
            evaluationPeriods: 1,
            threshold: 5,
            alarmName: 'WebRtcExecutionErrorAlarm',
        });
        
        const topicAction = new SnsAction(alarmTopic);
        executionErrorAlarm.addAlarmAction(topicAction);
        executionErrorAlarm.addOkAction(topicAction);
    }
}

import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {IFunction, Runtime} from "aws-cdk-lib/aws-lambda";
import {join} from "path";
import {ITable} from "aws-cdk-lib/aws-dynamodb";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

interface LambdaStackProps extends StackProps {
    stageName?: string
    topicsTable: ITable
}

export class LambdaStack extends Stack {
    public readonly handler: IFunction;
    
    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        this.handler = new NodejsFunction(this, 'WebRtcLambda', {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: (join(__dirname, '..', 'lambdas', 'handler.ts')),
            environment: {
                TOPICS_TABLE: props.topicsTable.tableName,
            }
        })
        
        this.handler.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            resources: [props.topicsTable.tableArn],
            actions: [
                'dynamodb:PutItem',
                'dynamodb:Scan',
                'dynamodb:GetItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
            ]
        }))
    }
}

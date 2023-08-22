import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {IFunction, Runtime} from "aws-cdk-lib/aws-lambda";
import { join } from "path";

interface LambdaStackProps extends StackProps {
    stageName?: string
}

export class LambdaStack extends Stack {
    public readonly handler: IFunction;
    
    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        this.handler = new NodejsFunction(this, 'WebRtcLambda', {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: (join(__dirname, '..', 'lambdas', 'handler.ts'))
        })
    }
}

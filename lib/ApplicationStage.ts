import {Construct} from "constructs";
import {Stage, StageProps} from "aws-cdk-lib";
import {ApiStack} from "./stacks/ApiStack";
import {LambdaStack} from "./stacks/LambdaStack";

export class ApplicationStage extends Stage {
    constructor(scope: Construct, id: string, props: StageProps) {
        super(scope, id, props);

        const lambdaStack = new LambdaStack(this, 'LambdaStack', {
            stageName: props.stageName
        })
        
        new ApiStack(this, 'ApiStack', {
            stageName: props.stageName,
            handler: lambdaStack.handler,
        })
    }
}
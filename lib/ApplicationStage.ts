import {Construct} from "constructs";
import {Stage, StageProps} from "aws-cdk-lib";
import {ApiStack} from "./stacks/ApiStack";

export class ApplicationStage extends Stage {
    constructor(scope: Construct, id: string, props: StageProps) {
        super(scope, id, props);
        
        new ApiStack(this, 'ApiStack', {
            stageName: props.stageName
        })
    }
}
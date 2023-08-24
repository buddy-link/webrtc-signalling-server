import {Construct} from "constructs";
import {Stage, StageProps} from "aws-cdk-lib";
import {ApiStack} from "./stacks/ApiStack";
import {DataStack} from "./stacks/DataStack";

export class ApplicationStage extends Stage {
    constructor(scope: Construct, id: string, props: StageProps) {
        super(scope, id, props);

        const dataStack = new DataStack(this, 'DataStack', {
            stageName: props.stageName
        })
        
        new ApiStack(this, 'ApiStack', {
            stageName: props.stageName,
            topicsTable: dataStack.topicsTable
        })
    }
}
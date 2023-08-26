import {Construct} from "constructs";
import {Stage, StageProps} from "aws-cdk-lib";
import {ApiStack} from "./stacks/ApiStack";
import {DataStack} from "./stacks/DataStack";
import {MonitorStack} from "./stacks/MonitorStack";

export class ApplicationStage extends Stage {
    constructor(scope: Construct, id: string, props: StageProps) {
        super(scope, id, props);

        const dataStack = new DataStack(this, 'DataStack', {
            stageName: props.stageName
        })
        
        const apiStack = new ApiStack(this, 'ApiStack', {
            stageName: props.stageName,
            topicsTable: dataStack.topicsTable
        })
        
        new MonitorStack(this, 'MonitorStack', {
            stageName: props.stageName,
            webSocketApi: apiStack.webSocketApi
        })
    }
}
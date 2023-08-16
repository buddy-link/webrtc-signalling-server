import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";

interface ApiStackProps extends StackProps {
    stageName?: string
}

export class ApiStack extends Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);
    }
}
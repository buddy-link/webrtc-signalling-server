import {Stack, StackProps} from "aws-cdk-lib";
import {AttributeType, ITable, Table} from "aws-cdk-lib/aws-dynamodb";
import {Construct} from "constructs";
import {getSuffixFromStack} from "../Utils";

interface DataStackProps extends StackProps {
    stageName?: string
}

export class DataStack extends Stack {
    public readonly topicsTable: ITable;
    
    constructor(scope: Construct, id: string, props: DataStackProps) {
        super(scope, id, props);

        this.topicsTable = new Table(this, 'WebRtcTopicsTable', {
            partitionKey: {
                name: 'name',
                type: AttributeType.STRING,
            },
            tableName: `WebRtcTopicsTable-${getSuffixFromStack(this)}`
        })
    }
}

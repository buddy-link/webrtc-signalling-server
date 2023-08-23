import {Match, Template} from "aws-cdk-lib/assertions";
import {App} from "aws-cdk-lib";
import {LambdaStack} from "../../lib/stacks/LambdaStack";
import {DataStack} from "../../lib/stacks/DataStack";

describe('The Lambda Stack', () => {
    let template: Template;
    
    beforeAll(() => {
        const app = new App({
            outdir: 'cdk.out',
        });
        const dataStack = new DataStack(app, 'DataStack', {
            stageName: 'Production',
        })
        const lambdaStack = new LambdaStack(app, 'LambdaStack', {
            stageName: 'Production',
            topicsTable: dataStack.topicsTable,
        });
        template = Template.fromStack(lambdaStack);
    })
    
    it('adds a Lambda', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'index.handler',
            Runtime: 'nodejs18.x',
            Environment: {
                Variables: {
                    TOPICS_TABLE: {
                        'Fn::ImportValue': Match.stringLikeRegexp('WebRtcTopicsTable'),
                    }
                }
            }
        });
    });
    
    it('adds a Policy', () => {
        template.hasResourceProperties('AWS::IAM::Policy', {
            PolicyDocument: {
                Statement: [
                    {
                        Effect: 'Allow',
                        Action: [
                            'dynamodb:PutItem',
                            'dynamodb:Scan',
                            'dynamodb:GetItem',
                            'dynamodb:UpdateItem',
                            'dynamodb:DeleteItem',
                        ]
                    }
                ]
            }
        });
    });
});

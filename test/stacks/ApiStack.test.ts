import {Match, Template} from "aws-cdk-lib/assertions";
import {App} from "aws-cdk-lib";
import {ApiStack} from "../../lib/stacks/ApiStack";
import {DataStack} from "../../lib/stacks/DataStack";

describe('The Api Stack', () => {
    let template: Template;
    
    beforeAll(() => {
        const app = new App({
            outdir: 'cdk.out',
        });
        const dataStack = new DataStack(app, 'DataStack', {
            stageName: 'Production',
        })
        const apiStack = new ApiStack(app, 'LambdaStack', {
            stageName: 'Production',
            topicsTable: dataStack.topicsTable,
        });
        template = Template.fromStack(apiStack);
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
                    },
                    {
                        Effect: 'Allow',
                        Action: "execute-api:ManageConnections"
                    }
                ]
            }
        });
    });
    
    it('adds an Api', () => {
        template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
            ProtocolType: 'WEBSOCKET',
            RouteSelectionExpression: '$request.body.type',
        });
    });

    it('adds a Stage', () => {
        template.hasResourceProperties('AWS::ApiGatewayV2::Stage', {
            AutoDeploy: true,
            StageName: 'Production',
        });
    });

    it.each([
        ['$connect'],
        ['$disconnect'],
        ['$default'],
    ])('adds the %s Route', (RouteKey: string) => {
        template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
            RouteKey,
        });
    });
});

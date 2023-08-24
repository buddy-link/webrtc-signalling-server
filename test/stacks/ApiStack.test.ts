import {Template} from "aws-cdk-lib/assertions";
import {App} from "aws-cdk-lib";
import {ApiStack} from "../../lib/stacks/ApiStack";
import {LambdaStack} from "../../lib/stacks/LambdaStack";
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
        const lambdaStack = new LambdaStack(app, 'LambdaStack', {
            stageName: 'Production',
            topicsTable: dataStack.topicsTable,
        });
        const apiStack = new ApiStack(app, 'ApiStack', {
            stageName: 'Production',
            handler: lambdaStack.handler
        });
        template = Template.fromStack(apiStack);
    })
    
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

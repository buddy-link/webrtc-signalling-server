import {Template} from "aws-cdk-lib/assertions";
import {App} from "aws-cdk-lib";
import {ApiStack} from "../../lib/stacks/ApiStack";
import {LambdaStack} from "../../lib/stacks/LambdaStack";

describe('The Api Stack', () => {
    let template: Template;
    
    beforeAll(() => {
        const app = new App({
            outdir: 'cdk.out',
        });
        const lambdaStack = new LambdaStack(app, 'LambdaStack', {
            stageName: 'Production',
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
            RouteSelectionExpression: '$request.body.action',
        });
    });
    
    it('adds a Stage', () => {
        template.hasResourceProperties('AWS::ApiGatewayV2::Stage', {
            AutoDeploy: true,
            StageName: 'Production',
        });
    });

    it.each([
        ['$connect', false],
        ['$disconnect', false],
        ['$default', true],
    ])('adds the %s Route', (RouteKey: string, ReturnResponse: boolean) => {
        template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
            RouteKey,
        });
        
        if (ReturnResponse) {
            template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
                RouteResponseSelectionExpression: RouteKey,
            });
        }
    });
});

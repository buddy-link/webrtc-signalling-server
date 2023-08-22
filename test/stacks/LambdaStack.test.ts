import {Template} from "aws-cdk-lib/assertions";
import {App} from "aws-cdk-lib";
import {ApiStack} from "../../lib/stacks/ApiStack";
import {LambdaStack} from "../../lib/stacks/LambdaStack";

describe('The Lambda Stack', () => {
    let template: Template;
    
    beforeAll(() => {
        const app = new App({
            outdir: 'cdk.out',
        });
        const stack = new LambdaStack(app, 'LambdaStack', {
            stageName: 'Production',
        });
        template = Template.fromStack(stack);
    })
    
    it('adds a Lambda', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'index.handler',
            Runtime: 'nodejs18.x',
        });
    });
});

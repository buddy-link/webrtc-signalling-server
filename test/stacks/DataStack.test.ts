import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib";
import { DataStack } from "../../lib/stacks/DataStack";

describe("The Data Stack", () => {
  let template: Template;

  beforeAll(() => {
    const app = new App({
      outdir: "cdk.out",
    });
    const stack = new DataStack(app, "DataStack", {
      stageName: "Production",
    });
    template = Template.fromStack(stack);
  });

  it("adds a Table", () => {
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      KeySchema: [
        {
          AttributeName: "name",
          KeyType: "HASH",
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "name",
          AttributeType: "S",
        },
      ],
    });
  });
});

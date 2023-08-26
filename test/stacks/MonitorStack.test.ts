import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib";
import { DataStack } from "../../lib/stacks/DataStack";
import { ApiStack } from "../../lib/stacks/ApiStack";
import { MonitorStack } from "../../lib/stacks/MonitorStack";

describe("The Monitor Stack", () => {
  let template: Template;

  beforeAll(() => {
    const app = new App({
      outdir: "cdk.out",
    });
    const dataStack = new DataStack(app, "DataStack", {
      stageName: "Production",
    });
    const apiStack = new ApiStack(app, "ApiStack", {
      stageName: "Production",
      topicsTable: dataStack.topicsTable,
    });
    const monitorStack = new MonitorStack(app, "MonitorStack", {
      stageName: "Production",
      webSocketApi: apiStack.webSocketApi,
    });
    template = Template.fromStack(monitorStack);
  });

  it("adds a Lambda", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Handler: "index.handler",
      Runtime: "nodejs18.x",
      Layers: [
        "arn:aws:lambda:eu-west-1:015030872274:layer:AWS-Parameters-and-Secrets-Lambda-Extension:4",
      ],
      Timeout: 5,
    });
  });

  it("adds an ExecutionError Alarm", () => {
    template.hasResourceProperties("AWS::CloudWatch::Alarm", {
      ComparisonOperator: "GreaterThanOrEqualToThreshold",
      EvaluationPeriods: 1,
      MetricName: "ExecutionError",
      Namespace: "AWS/ApiGateway",
      Period: 60,
      Statistic: "Sum",
      Threshold: 5,
      Unit: "Count",
    });
  });

  it("adds a MessageCount Alarm", () => {
    template.hasResourceProperties("AWS::CloudWatch::Alarm", {
      ComparisonOperator: "GreaterThanOrEqualToThreshold",
      EvaluationPeriods: 1,
      MetricName: "MessageCount",
      Namespace: "AWS/ApiGateway",
      Period: 60,
      Statistic: "Sum",
      Threshold: 240,
      Unit: "Count",
    });
  });
});

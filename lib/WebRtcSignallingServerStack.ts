import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";
import {ApplicationStage} from "./ApplicationStage";
import {BuildSpec} from "aws-cdk-lib/aws-codebuild";

export class WebRtcSignallingServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const pipeline = new CodePipeline(this, 'CodePipeline', {
      pipelineName: 'WebRtcSignallingServerPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('smudger/webrtc-signalling-server', 'main'),
        commands: [
            'npm ci',
            'npx cdk synth',
        ],
      })
    })
    
    const productionStage = new ApplicationStage(this, 'ProductionStage', {
      stageName: 'Production'
    });
    
    const testStep = new CodeBuildStep('Test', {
      commands: [
          'npm ci',
          'npm test',
      ]
    })
    
    pipeline
        .addStage(productionStage)
        .addPre(testStep);
  }
}

# WebRTC Signaling Server

A serverless WebRTC signaling server implementation using AWS API Gateway, Lambda, and DynamoDB, orchestrated via the AWS CDK.

Inspired by [this article](https://medium.com/collaborne-engineering/serverless-yjs-72d0a84326a2) on creating a serverless signaling server by Ronny Roeller.

## Requirements

This project uses Node v16.

The AWS CDK app requires the following two secrets to be set in the AWS Secrets Manager: - `github-token`: A GitHub personal access token with the `repo` scope. - `webrtc-slack-webhook-url`: A Slack webhook URL for sending notifications from the monitoring stack.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## Testing locally

The `./invoke.ts` script can be used to invoke the signaling server Lambda function locally. It requires the following environment variables to be set:

- `AWS_REGION`: The AWS region to use.
- `TOPICS_TABLE`: The name of the DynamoDB table to use for storing topics (from the deployed data stack).

The `./WebRtc.http` file contains examples of requests that can be sent to the signaling server.

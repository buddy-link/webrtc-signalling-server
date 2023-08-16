#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebRtcSignallingServerStack } from '../lib/WebRtcSignallingServerStack';

const app = new cdk.App();
new WebRtcSignallingServerStack(app, 'WebRtcSignallingServerStack');

app.synth();
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebrtcSignallingServerStack } from '../lib/webrtc-signalling-server-stack';

const app = new cdk.App();
new WebrtcSignallingServerStack(app, 'WebrtcSignallingServerStack');
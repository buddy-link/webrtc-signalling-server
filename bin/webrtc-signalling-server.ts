#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { WebRtcSignallingServerStack } from "../lib/WebRtcSignallingServerStack";
import { Aspects, Tag } from "aws-cdk-lib";

const app = new cdk.App();

Aspects.of(app).add(new Tag("project", "webrtc-signalling-server"));

new WebRtcSignallingServerStack(app, "WebRtcSignallingServerStack");

app.synth();

#!/usr/bin/env bun
import { App } from "aws-cdk-lib";
import { HostingStack } from "../lib/hosting-stack";

const app = new App();

new HostingStack(app, "CarolynPortfolioHostingStack", {
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: "us-west-2",
	},
	description:
		"AWS Amplify Hosting production infrastructure for carolyndiloreto.com",
});

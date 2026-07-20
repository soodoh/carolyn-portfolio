#!/usr/bin/env bun
import { App } from "aws-cdk-lib";
import {
	PRODUCTION_AWS_ACCOUNT,
	PRODUCTION_AWS_REGION,
} from "../lib/environment";
import { HostingStack } from "../lib/hosting-stack";

const app = new App();

new HostingStack(app, "CarolynPortfolioHostingStack", {
	env: {
		account: PRODUCTION_AWS_ACCOUNT,
		region: PRODUCTION_AWS_REGION,
	},
	description:
		"AWS Amplify Hosting production infrastructure for carolyndiloreto.com",
});

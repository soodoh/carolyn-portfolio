import { describe, expect, test } from "bun:test";
import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { getCleanUrlRules } from "../../lib/amplify-artifact";
import {
	PRODUCTION_AWS_ACCOUNT,
	PRODUCTION_AWS_REGION,
} from "../lib/environment";
import { HostingStack } from "../lib/hosting-stack";

function partitionArn(suffix: string) {
	return {
		"Fn::Join": ["", ["arn:", { Ref: "AWS::Partition" }, suffix]],
	};
}

const secretParameterArns = [
	partitionArn(
		":ssm:us-west-2:725669362139:parameter/carolyn-portfolio/prod/contentful-access-token",
	),
	partitionArn(
		":ssm:us-west-2:725669362139:parameter/carolyn-portfolio/prod/project-auth-secret",
	),
];

function createProductionStack(): HostingStack {
	return new HostingStack(new App(), "TestHostingStack", {
		env: {
			account: PRODUCTION_AWS_ACCOUNT,
			region: PRODUCTION_AWS_REGION,
		},
	});
}

function createTemplate(): Template {
	return Template.fromStack(createProductionStack());
}

function getResource(
	template: Template,
	type: string,
	logicalIdFragment?: string,
) {
	const matches = Object.entries(template.findResources(type)).filter(
		([logicalId]) =>
			logicalIdFragment === undefined || logicalId.includes(logicalIdFragment),
	);
	expect(matches).toHaveLength(1);
	const match = matches[0];
	if (!match) {
		throw new Error(`Missing ${type} resource ${logicalIdFragment ?? ""}`);
	}
	return { logicalId: match[0], resource: match[1] };
}

function expectSecretPolicy(
	template: Template,
	roleLogicalIdFragment: string,
	expectedLogStatements: unknown[] = [],
): void {
	const { logicalId: keyLogicalId } = getResource(
		template,
		"AWS::KMS::Key",
		"ProductionSecretKey",
	);
	const { logicalId: roleLogicalId } = getResource(
		template,
		"AWS::IAM::Role",
		roleLogicalIdFragment,
	);
	const { resource: policy } = getResource(
		template,
		"AWS::IAM::Policy",
		roleLogicalIdFragment,
	);
	expect(policy.Properties.Roles).toEqual([{ Ref: roleLogicalId }]);
	expect(policy.Properties.PolicyDocument).toEqual({
		Statement: [
			{
				Action: "ssm:GetParameter",
				Effect: "Allow",
				Resource: secretParameterArns,
			},
			{
				Action: "kms:Decrypt",
				Condition: {
					StringEquals: {
						"kms:EncryptionContext:PARAMETER_ARN": secretParameterArns,
					},
				},
				Effect: "Allow",
				Resource: { "Fn::GetAtt": [keyLogicalId, "Arn"] },
			},
			...expectedLogStatements,
		],
		Version: "2012-10-17",
	});
}

describe("HostingStack environment guardrails", () => {
	test("rejects a non-production account", () => {
		expect(
			() =>
				new HostingStack(new App(), "WrongAccountStack", {
					env: {
						account: "111111111111",
						region: PRODUCTION_AWS_REGION,
					},
				}),
		).toThrow(PRODUCTION_AWS_ACCOUNT);
	});

	test("rejects a non-production region", () => {
		expect(
			() =>
				new HostingStack(new App(), "WrongRegionStack", {
					env: {
						account: PRODUCTION_AWS_ACCOUNT,
						region: "us-east-1",
					},
				}),
		).toThrow(PRODUCTION_AWS_REGION);
	});

	test("synthesizes production account and region ARNs", () => {
		const stack = createProductionStack();
		expect(stack.account).toBe(PRODUCTION_AWS_ACCOUNT);
		expect(stack.region).toBe(PRODUCTION_AWS_REGION);
		const template = JSON.stringify(Template.fromStack(stack).toJSON());
		expect(template).toContain(PRODUCTION_AWS_ACCOUNT);
		expect(template).toContain(PRODUCTION_AWS_REGION);
	});
});

describe("HostingStack production resources", () => {
	test("configures WEB_COMPUTE with exact bounded secret policies", () => {
		const template = createTemplate();
		template.hasResourceProperties("AWS::Amplify::App", {
			CacheConfig: { Type: "AMPLIFY_MANAGED" },
			EnableBranchAutoDeletion: false,
			Platform: "WEB_COMPUTE",
			Repository: "https://github.com/soodoh/carolyn-portfolio",
		});
		template.hasResourceProperties("AWS::Amplify::Branch", {
			BranchName: "amplify-production",
			EnableAutoBuild: false,
			EnablePerformanceMode: false,
			EnablePullRequestPreview: false,
			Framework: "Nitro",
			Stage: "PRODUCTION",
		});

		expectSecretPolicy(template, "AmplifyServiceAndLoggingRole", [
			{
				Action: "logs:CreateLogGroup",
				Effect: "Allow",
				Resource: partitionArn(
					":logs:us-west-2:725669362139:log-group:/aws/amplify/*",
				),
			},
			{
				Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
				Effect: "Allow",
				Resource: partitionArn(
					":logs:us-west-2:725669362139:log-group:/aws/amplify/*:log-stream:*",
				),
			},
			{
				Action: "logs:DescribeLogGroups",
				Effect: "Allow",
				Resource: "*",
			},
		]);
		expectSecretPolicy(template, "AmplifySsrComputeRole");
	});

	test("pins Amplify trust boundaries and the branch compute role", () => {
		const template = createTemplate();
		const { resource: serviceRole } = getResource(
			template,
			"AWS::IAM::Role",
			"AmplifyServiceAndLoggingRole",
		);
		expect(serviceRole.Properties.AssumeRolePolicyDocument).toEqual({
			Statement: [
				{
					Action: "sts:AssumeRole",
					Condition: {
						ArnLike: {
							"aws:SourceArn": partitionArn(
								":amplify:us-west-2:725669362139:apps/*",
							),
						},
						StringEquals: {
							"aws:SourceAccount": { Ref: "AWS::AccountId" },
						},
					},
					Effect: "Allow",
					Principal: { Service: "amplify.amazonaws.com" },
				},
			],
			Version: "2012-10-17",
		});

		const { logicalId: computeRoleLogicalId, resource: computeRole } =
			getResource(template, "AWS::IAM::Role", "AmplifySsrComputeRole");
		expect(computeRole.Properties.AssumeRolePolicyDocument).toEqual({
			Statement: [
				{
					Action: "sts:AssumeRole",
					Condition: {
						ArnLike: {
							"aws:SourceArn": {
								"Fn::Join": [
									"",
									[{ "Fn::GetAtt": ["AmplifyApp", "Arn"] }, "/branches/*"],
								],
							},
						},
						StringEquals: {
							"aws:SourceAccount": { Ref: "AWS::AccountId" },
						},
					},
					Effect: "Allow",
					Principal: { Service: "amplify.amazonaws.com" },
				},
			],
			Version: "2012-10-17",
		});

		const { resource: productionBranch } = getResource(
			template,
			"AWS::Amplify::Branch",
			"ProductionBranch",
		);
		expect(productionBranch.Properties.ComputeRoleArn).toEqual({
			"Fn::GetAtt": [computeRoleLogicalId, "Arn"],
		});
	});

	test("configures canonical clean URL rewrites for emitted static files", () => {
		const template = createTemplate();
		template.hasResourceProperties("AWS::Amplify::App", {
			CustomRules: [
				{
					Source: "https://www.carolyndiloreto.com",
					Status: "301",
					Target: "https://carolyndiloreto.com",
				},
				{
					Source: "https://carolyn.diloreto.com",
					Status: "301",
					Target: "https://carolyndiloreto.com",
				},
				...getCleanUrlRules().map((rule) => ({
					Source: rule.source,
					Status: rule.status,
					Target: rule.target,
				})),
			],
		});
	});

	test("pins the exact GitHub OIDC trust and deployment permissions", () => {
		const template = createTemplate();
		const { logicalId: providerLogicalId, resource: provider } = getResource(
			template,
			"AWS::IAM::OIDCProvider",
		);
		expect(provider.Properties).toEqual({
			ClientIdList: ["sts.amazonaws.com"],
			Url: "https://token.actions.githubusercontent.com",
		});

		const { logicalId: roleLogicalId, resource: role } = getResource(
			template,
			"AWS::IAM::Role",
			"GitHubDeploymentRole",
		);
		expect(role.Properties.AssumeRolePolicyDocument).toEqual({
			Statement: [
				{
					Action: "sts:AssumeRoleWithWebIdentity",
					Condition: {
						StringEquals: {
							"token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
							"token.actions.githubusercontent.com:sub": [
								"repo:soodoh/carolyn-portfolio:environment:production",
							],
						},
					},
					Effect: "Allow",
					Principal: { Federated: { Ref: providerLogicalId } },
				},
			],
			Version: "2012-10-17",
		});

		const { resource: policy } = getResource(
			template,
			"AWS::IAM::Policy",
			"GitHubDeploymentRole",
		);
		expect(policy.Properties.Roles).toEqual([{ Ref: roleLogicalId }]);
		expect(policy.Properties.PolicyDocument).toEqual({
			Statement: [
				{
					Action: "amplify:GetApp",
					Effect: "Allow",
					Resource: { "Fn::GetAtt": ["AmplifyApp", "Arn"] },
				},
				{
					Action: "amplify:GetBranch",
					Effect: "Allow",
					Resource: { "Fn::GetAtt": ["ProductionBranch", "Arn"] },
				},
				{
					Action: ["amplify:GetJob", "amplify:StartJob"],
					Effect: "Allow",
					Resource: {
						"Fn::Join": [
							"",
							[{ "Fn::GetAtt": ["ProductionBranch", "Arn"] }, "/jobs/*"],
						],
					},
				},
			],
			Version: "2012-10-17",
		});
	});

	test("pins domains, SNS alarm wiring, and both budget notifications", () => {
		const template = createTemplate();
		template.resourceCountIs("AWS::Amplify::Domain", 2);
		template.hasResourceProperties("AWS::Amplify::Domain", {
			DomainName: "carolyndiloreto.com",
			EnableAutoSubDomain: false,
			SubDomainSettings: [
				{ BranchName: "amplify-production", Prefix: "" },
				{ BranchName: "amplify-production", Prefix: "www" },
			],
		});
		template.hasResourceProperties("AWS::Amplify::Domain", {
			DomainName: "diloreto.com",
			EnableAutoSubDomain: false,
			SubDomainSettings: [
				{ BranchName: "amplify-production", Prefix: "carolyn" },
			],
		});

		const { logicalId: topicLogicalId } = getResource(
			template,
			"AWS::SNS::Topic",
			"OperationalAlarmTopic",
		);
		const { resource: subscription } = getResource(
			template,
			"AWS::SNS::Subscription",
		);
		expect(subscription.Properties).toEqual({
			Endpoint: { Ref: "NotificationEmail" },
			Protocol: "email",
			TopicArn: { Ref: topicLogicalId },
		});
		const { resource: alarm } = getResource(template, "AWS::CloudWatch::Alarm");
		expect(alarm.Properties).toEqual({
			AlarmActions: [{ Ref: topicLogicalId }],
			AlarmDescription:
				"At least one Amplify Hosting 5xx response in five minutes",
			ComparisonOperator: "GreaterThanOrEqualToThreshold",
			Dimensions: [
				{ Name: "App", Value: { "Fn::GetAtt": ["AmplifyApp", "AppId"] } },
			],
			EvaluationPeriods: 1,
			MetricName: "5xxErrors",
			Namespace: "AWS/AmplifyHosting",
			Period: 300,
			Statistic: "Sum",
			Threshold: 1,
			TreatMissingData: "notBreaching",
		});

		const { resource: budget } = getResource(template, "AWS::Budgets::Budget");
		expect(budget.Properties).toEqual({
			Budget: {
				BudgetLimit: { Amount: 5, Unit: "USD" },
				BudgetName: "carolyn-portfolio-account-monthly",
				BudgetType: "COST",
				TimeUnit: "MONTHLY",
			},
			NotificationsWithSubscribers: [
				{
					Notification: {
						ComparisonOperator: "GREATER_THAN",
						NotificationType: "FORECASTED",
						Threshold: 100,
						ThresholdType: "PERCENTAGE",
					},
					Subscribers: [
						{
							Address: { Ref: "NotificationEmail" },
							SubscriptionType: "EMAIL",
						},
					],
				},
				{
					Notification: {
						ComparisonOperator: "GREATER_THAN",
						NotificationType: "ACTUAL",
						Threshold: 100,
						ThresholdType: "PERCENTAGE",
					},
					Subscribers: [
						{
							Address: { Ref: "NotificationEmail" },
							SubscriptionType: "EMAIL",
						},
					],
				},
			],
		});
	});

	test("retains logs and rotates and retains the production KMS key", () => {
		const template = createTemplate();
		const { resource: logGroup } = getResource(template, "AWS::Logs::LogGroup");
		expect(logGroup).toMatchObject({
			DeletionPolicy: "Retain",
			Properties: { RetentionInDays: 14 },
			UpdateReplacePolicy: "Retain",
		});
		const { resource: key } = getResource(
			template,
			"AWS::KMS::Key",
			"ProductionSecretKey",
		);
		expect(key).toMatchObject({
			DeletionPolicy: "Retain",
			Properties: { EnableKeyRotation: true },
			UpdateReplacePolicy: "Retain",
		});
	});
});

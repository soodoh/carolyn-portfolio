import type { StackProps } from "aws-cdk-lib";
import {
	ArnFormat,
	Aws,
	CfnCondition,
	CfnOutput,
	CfnParameter,
	Duration,
	Fn,
	RemovalPolicy,
	Stack,
	Token,
} from "aws-cdk-lib";
import { CfnApp, CfnBranch, CfnDomain } from "aws-cdk-lib/aws-amplify";
import { CfnBudget } from "aws-cdk-lib/aws-budgets";
import {
	Alarm,
	ComparisonOperator,
	Metric,
	TreatMissingData,
} from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import {
	CfnOIDCProvider,
	Effect,
	PolicyStatement,
	Role,
	ServicePrincipal,
	WebIdentityPrincipal,
} from "aws-cdk-lib/aws-iam";
import { Alias, Key } from "aws-cdk-lib/aws-kms";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import type { Construct } from "constructs";

const AWS_REGION = "us-west-2";
const DOMAIN_NAME = "carolyndiloreto.com";
const REPOSITORY_URL = "https://github.com/soodoh/carolyn-portfolio";
const PRODUCTION_BRANCH = "amplify-production";
const CONTENTFUL_ACCESS_TOKEN_PARAMETER =
	"/carolyn-portfolio/prod/contentful-access-token";
const PROJECT_AUTH_SECRET_PARAMETER =
	"/carolyn-portfolio/prod/project-auth-secret";

// Route 53 Registrar created this zone when the domain was registered. It is
// imported so CDK does not create a duplicate hosted zone during migration.
const HOSTED_ZONE_ID = "Z32YJCERCJ1WLI";
const HOSTED_ZONE_NAME_SERVERS = [
	"ns-1056.awsdns-04.org",
	"ns-1780.awsdns-30.co.uk",
	"ns-362.awsdns-45.com",
	"ns-917.awsdns-50.net",
];

export class HostingStack extends Stack {
	constructor(scope: Construct, id: string, props: StackProps) {
		super(scope, id, props);

		if (Stack.of(this).region !== AWS_REGION) {
			throw new Error(`This stack must be deployed in ${AWS_REGION}`);
		}

		const contentfulSpaceId = new CfnParameter(this, "ContentfulSpaceId", {
			description: "Non-secret Contentful space identifier",
			type: "String",
		});
		const notificationEmail = new CfnParameter(this, "NotificationEmail", {
			description: "Email address for the AWS budget and 5xx alarm",
			type: "String",
		});
		const githubAccessTokenSecretArn = new CfnParameter(
			this,
			"GitHubAccessTokenSecretArn",
			{
				default: "",
				description:
					"Temporary Secrets Manager ARN containing a token field for initial GitHub App authorization",
				type: "String",
			},
		);
		const enableDomainAssociation = new CfnParameter(
			this,
			"EnableDomainAssociation",
			{
				allowedValues: ["true", "false"],
				default: "false",
				description:
					"Create the Amplify custom-domain association after DNS records have been inventoried",
				type: "String",
			},
		);
		const hasGitHubAccessToken = new CfnCondition(
			this,
			"HasGitHubAccessToken",
			{
				expression: Fn.conditionNot(
					Fn.conditionEquals(githubAccessTokenSecretArn.valueAsString, ""),
				),
			},
		);
		const shouldCreateDomainAssociation = new CfnCondition(
			this,
			"ShouldCreateDomainAssociation",
			{
				expression: Fn.conditionEquals(
					enableDomainAssociation.valueAsString,
					"true",
				),
			},
		);

		const hostedZone = HostedZone.fromHostedZoneAttributes(
			this,
			"ProductionHostedZone",
			{
				hostedZoneId: HOSTED_ZONE_ID,
				zoneName: DOMAIN_NAME,
			},
		);

		const secretKey = new Key(this, "ProductionSecretKey", {
			description: "Encrypts Carolyn Portfolio production SecureStrings",
			enableKeyRotation: true,
			removalPolicy: RemovalPolicy.RETAIN,
		});
		new Alias(this, "ProductionSecretKeyAlias", {
			aliasName: "alias/carolyn-portfolio-prod-secrets",
			targetKey: secretKey,
		});

		const contentfulParameterArn = this.parameterArn(
			CONTENTFUL_ACCESS_TOKEN_PARAMETER,
		);
		const projectAuthParameterArn = this.parameterArn(
			PROJECT_AUTH_SECRET_PARAMETER,
		);

		const amplifySourceArn = this.formatArn({
			arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
			resource: "apps",
			resourceName: "*",
			service: "amplify",
		});
		const amplifyServicePrincipal = new ServicePrincipal(
			"amplify.amazonaws.com",
		).withConditions({
			ArnLike: { "aws:SourceArn": amplifySourceArn },
			StringEquals: { "aws:SourceAccount": Aws.ACCOUNT_ID },
		});
		const amplifyServiceRole = new Role(this, "AmplifyServiceAndLoggingRole", {
			assumedBy: amplifyServicePrincipal,
			description:
				"Allows Amplify builds to read Contentful and Amplify SSR to publish bounded CloudWatch logs",
		});
		amplifyServiceRole.addToPolicy(
			new PolicyStatement({
				actions: ["ssm:GetParameter"],
				resources: [contentfulParameterArn],
			}),
		);
		amplifyServiceRole.addToPolicy(
			new PolicyStatement({
				actions: ["kms:Decrypt"],
				conditions: {
					StringEquals: {
						"kms:EncryptionContext:PARAMETER_ARN": contentfulParameterArn,
					},
				},
				resources: [secretKey.keyArn],
			}),
		);
		amplifyServiceRole.addToPolicy(
			new PolicyStatement({
				actions: ["logs:CreateLogGroup"],
				resources: [
					this.formatArn({
						arnFormat: ArnFormat.COLON_RESOURCE_NAME,
						resource: "log-group",
						resourceName: "/aws/amplify/*",
						service: "logs",
					}),
				],
			}),
		);
		amplifyServiceRole.addToPolicy(
			new PolicyStatement({
				actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
				resources: [
					this.formatArn({
						arnFormat: ArnFormat.COLON_RESOURCE_NAME,
						resource: "log-group",
						resourceName: "/aws/amplify/*:log-stream:*",
						service: "logs",
					}),
				],
			}),
		);
		amplifyServiceRole.addToPolicy(
			new PolicyStatement({
				actions: ["logs:DescribeLogGroups"],
				resources: ["*"],
			}),
		);

		const githubAccessToken = Token.asString(
			Fn.conditionIf(
				hasGitHubAccessToken.logicalId,
				Fn.join("", [
					"{{resolve:secretsmanager:",
					githubAccessTokenSecretArn.valueAsString,
					":SecretString:token}}",
				]),
				Aws.NO_VALUE,
			),
		);
		const amplifyApp = new CfnApp(this, "AmplifyApp", {
			accessToken: githubAccessToken,
			cacheConfig: { type: "AMPLIFY_MANAGED_NO_COOKIES" },
			customRules: [
				{
					source: `https://www.${DOMAIN_NAME}`,
					status: "301",
					target: `https://${DOMAIN_NAME}`,
				},
			],
			description: "Carolyn DiLoreto portfolio production hosting",
			enableBranchAutoDeletion: false,
			iamServiceRole: amplifyServiceRole.roleArn,
			name: "carolyn-portfolio",
			platform: "WEB_COMPUTE",
			repository: REPOSITORY_URL,
		});
		const amplifyComputeRole = new Role(this, "AmplifySsrComputeRole", {
			assumedBy: new ServicePrincipal("amplify.amazonaws.com").withConditions({
				ArnLike: {
					"aws:SourceArn": `${amplifyApp.attrArn}/branches/*`,
				},
				StringEquals: { "aws:SourceAccount": Aws.ACCOUNT_ID },
			}),
			description:
				"App-scoped SSR role for the two Carolyn Portfolio production SecureStrings",
		});
		amplifyComputeRole.addToPolicy(
			new PolicyStatement({
				actions: ["ssm:GetParameter"],
				resources: [contentfulParameterArn, projectAuthParameterArn],
			}),
		);
		amplifyComputeRole.addToPolicy(
			new PolicyStatement({
				actions: ["kms:Decrypt"],
				conditions: {
					StringEquals: {
						"kms:EncryptionContext:PARAMETER_ARN": [
							contentfulParameterArn,
							projectAuthParameterArn,
						],
					},
				},
				resources: [secretKey.keyArn],
			}),
		);

		const branch = new CfnBranch(this, "ProductionBranch", {
			appId: amplifyApp.attrAppId,
			branchName: PRODUCTION_BRANCH,
			computeRoleArn: amplifyComputeRole.roleArn,
			description: "Exact-SHA production releases from GitHub Actions",
			enableAutoBuild: false,
			enablePerformanceMode: false,
			enablePullRequestPreview: false,
			environmentVariables: [
				{
					name: "CONTENTFUL_SPACE_ID",
					value: contentfulSpaceId.valueAsString,
				},
			],
			framework: "Nitro",
			stage: "PRODUCTION",
		});
		branch.addDependency(amplifyApp);

		const domain = new CfnDomain(this, "ProductionDomain", {
			appId: amplifyApp.attrAppId,
			domainName: hostedZone.zoneName,
			enableAutoSubDomain: false,
			subDomainSettings: [
				{ branchName: PRODUCTION_BRANCH, prefix: "" },
				{ branchName: PRODUCTION_BRANCH, prefix: "www" },
			],
		});
		domain.cfnOptions.condition = shouldCreateDomainAssociation;
		domain.addDependency(branch);

		new LogGroup(this, "AmplifySsrLogGroup", {
			logGroupName: `/aws/amplify/${amplifyApp.attrAppId}`,
			removalPolicy: RemovalPolicy.RETAIN,
			retention: RetentionDays.TWO_WEEKS,
		});

		const alarmTopic = new Topic(this, "OperationalAlarmTopic", {
			displayName: "Carolyn Portfolio production alarms",
		});
		alarmTopic.addSubscription(
			new EmailSubscription(notificationEmail.valueAsString),
		);
		const serverErrorAlarm = new Alarm(this, "Amplify5xxAlarm", {
			alarmDescription:
				"At least one Amplify Hosting 5xx response in five minutes",
			comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
			evaluationPeriods: 1,
			metric: new Metric({
				dimensionsMap: { App: amplifyApp.attrAppId },
				metricName: "5xxErrors",
				namespace: "AWS/AmplifyHosting",
				period: Duration.minutes(5),
				statistic: "Sum",
			}),
			threshold: 1,
			treatMissingData: TreatMissingData.NOT_BREACHING,
		});
		serverErrorAlarm.addAlarmAction(new SnsAction(alarmTopic));

		new CfnBudget(this, "MonthlyBudget", {
			budget: {
				budgetLimit: { amount: 5, unit: "USD" },
				budgetName: "carolyn-portfolio-account-monthly",
				budgetType: "COST",
				timeUnit: "MONTHLY",
			},
			notificationsWithSubscribers: [
				{
					notification: {
						comparisonOperator: "GREATER_THAN",
						notificationType: "FORECASTED",
						threshold: 100,
						thresholdType: "PERCENTAGE",
					},
					subscribers: [
						{
							address: notificationEmail.valueAsString,
							subscriptionType: "EMAIL",
						},
					],
				},
				{
					notification: {
						comparisonOperator: "GREATER_THAN",
						notificationType: "ACTUAL",
						threshold: 100,
						thresholdType: "PERCENTAGE",
					},
					subscribers: [
						{
							address: notificationEmail.valueAsString,
							subscriptionType: "EMAIL",
						},
					],
				},
			],
		});

		const githubOidcProvider = new CfnOIDCProvider(
			this,
			"GitHubActionsOidcProvider",
			{
				clientIdList: ["sts.amazonaws.com"],
				url: "https://token.actions.githubusercontent.com",
			},
		);
		const githubSubjectConditions = {
			StringEquals: {
				"token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
				"token.actions.githubusercontent.com:sub": [
					"repo:soodoh/carolyn-portfolio:ref:refs/heads/main",
				],
			},
		};
		const deploymentRole = new Role(this, "GitHubDeploymentRole", {
			assumedBy: new WebIdentityPrincipal(
				githubOidcProvider.ref,
				githubSubjectConditions,
			),
			description:
				"Allows Carolyn Portfolio main-branch workflows to release and monitor Amplify production",
		});
		deploymentRole.addToPolicy(
			new PolicyStatement({
				actions: ["amplify:GetApp"],
				effect: Effect.ALLOW,
				resources: [amplifyApp.attrArn],
			}),
		);
		deploymentRole.addToPolicy(
			new PolicyStatement({
				actions: ["amplify:GetBranch"],
				effect: Effect.ALLOW,
				resources: [branch.attrArn],
			}),
		);
		deploymentRole.addToPolicy(
			new PolicyStatement({
				actions: ["amplify:GetJob", "amplify:StartJob"],
				effect: Effect.ALLOW,
				resources: [`${branch.attrArn}/jobs/*`],
			}),
		);

		new CfnOutput(this, "AmplifyAppId", { value: amplifyApp.attrAppId });
		new CfnOutput(this, "AmplifyDefaultDomain", {
			value: amplifyApp.attrDefaultDomain,
		});
		new CfnOutput(this, "AmplifyProductionUrl", {
			value: `https://${PRODUCTION_BRANCH}.${amplifyApp.attrDefaultDomain}`,
		});
		new CfnOutput(this, "ProductionBranchName", {
			value: PRODUCTION_BRANCH,
		});
		new CfnOutput(this, "HostedZoneId", { value: HOSTED_ZONE_ID });
		new CfnOutput(this, "HostedZoneNameServers", {
			value: HOSTED_ZONE_NAME_SERVERS.join(","),
		});
		new CfnOutput(this, "GitHubDeploymentRoleArn", {
			value: deploymentRole.roleArn,
		});
		new CfnOutput(this, "SecretKmsKeyArn", { value: secretKey.keyArn });
		new CfnOutput(this, "ContentfulAccessTokenParameter", {
			value: CONTENTFUL_ACCESS_TOKEN_PARAMETER,
		});
		new CfnOutput(this, "ProjectAuthSecretParameter", {
			value: PROJECT_AUTH_SECRET_PARAMETER,
		});
	}

	private parameterArn(parameterName: string): string {
		return this.formatArn({
			resource: "parameter",
			resourceName: parameterName.slice(1),
			service: "ssm",
		});
	}
}

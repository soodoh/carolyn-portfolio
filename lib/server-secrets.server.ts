import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

export const CONTENTFUL_ACCESS_TOKEN_PARAMETER =
	"/carolyn-portfolio/prod/contentful-access-token";
export const PROJECT_AUTH_SECRET_PARAMETER =
	"/carolyn-portfolio/prod/project-auth-secret";

interface SecretDefinition {
	environmentName: string;
	parameterName: string;
}

interface ServerSecretLoaderOptions {
	environment: Readonly<Record<string, string | undefined>>;
	getParameter: (name: string) => Promise<string | undefined>;
}

export interface ServerSecretLoader {
	getContentfulAccessToken: () => Promise<string>;
	getProjectAuthSecret: () => Promise<string>;
}

const contentfulAccessTokenDefinition: SecretDefinition = {
	environmentName: "CONTENTFUL_ACCESS_TOKEN",
	parameterName: CONTENTFUL_ACCESS_TOKEN_PARAMETER,
};
const projectAuthSecretDefinition: SecretDefinition = {
	environmentName: "PROJECT_AUTH_SECRET",
	parameterName: PROJECT_AUTH_SECRET_PARAMETER,
};

export function createServerSecretLoader({
	environment,
	getParameter,
}: ServerSecretLoaderOptions): ServerSecretLoader {
	function createCachedSecretGetter(
		definition: SecretDefinition,
	): () => Promise<string> {
		let initialization: Promise<string> | undefined;

		return () => {
			if (!initialization) {
				const pendingInitialization = loadSecret(definition);
				initialization = pendingInitialization;
				void pendingInitialization.catch(() => {
					if (initialization === pendingInitialization) {
						initialization = undefined;
					}
				});
			}
			return initialization;
		};
	}

	async function loadSecret(definition: SecretDefinition): Promise<string> {
		const localValue = environment[definition.environmentName];
		if (localValue) {
			return localValue;
		}

		let parameterValue: string | undefined;
		try {
			parameterValue = await getParameter(definition.parameterName);
		} catch {
			throw new Error(
				`Failed to initialize ${definition.environmentName} from AWS Systems Manager Parameter Store`,
			);
		}
		if (!parameterValue) {
			throw new Error(
				`Missing ${definition.environmentName}; set it locally or create ${definition.parameterName}`,
			);
		}
		return parameterValue;
	}

	return {
		getContentfulAccessToken: createCachedSecretGetter(
			contentfulAccessTokenDefinition,
		),
		getProjectAuthSecret: createCachedSecretGetter(projectAuthSecretDefinition),
	};
}

const ssmClient = new SSMClient({
	region: process.env.AWS_REGION ?? "us-west-2",
});
const serverSecrets = createServerSecretLoader({
	environment: process.env,
	getParameter: async (name) => {
		const response = await ssmClient.send(
			new GetParameterCommand({ Name: name, WithDecryption: true }),
		);
		return response.Parameter?.Value;
	},
});

export const getContentfulAccessToken = serverSecrets.getContentfulAccessToken;
export const getProjectAuthSecret = serverSecrets.getProjectAuthSecret;

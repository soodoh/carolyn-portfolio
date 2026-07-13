export type ProjectPasswordInput = {
	slug: string;
	password: string;
};

export function validateProjectSlug(input: unknown): string {
	if (typeof input !== "string" || input.length === 0) {
		throw new TypeError("Project slug must be a non-empty string.");
	}
	return input;
}

export function validateProjectPasswordInput(
	input: unknown,
): ProjectPasswordInput {
	if (
		typeof input !== "object" ||
		input === null ||
		!("slug" in input) ||
		!("password" in input) ||
		typeof input.password !== "string"
	) {
		throw new TypeError("Project password input is malformed.");
	}

	return {
		slug: validateProjectSlug(input.slug),
		password: input.password,
	};
}

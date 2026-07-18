export type ProjectPasswordInput = {
	slug: string;
	password: string;
};

export const MAX_PROJECT_SLUG_LENGTH = 100;
export const MAX_ALBUM_NAME_LENGTH = 100;
export const MAX_PROJECT_PASSWORD_BYTES = 72;

const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const textEncoder = new TextEncoder();

export function isValidProjectSlug(input: unknown): input is string {
	return (
		typeof input === "string" &&
		input.length <= MAX_PROJECT_SLUG_LENGTH &&
		PROJECT_SLUG_PATTERN.test(input)
	);
}

export function validateProjectSlug(input: unknown): string {
	if (!isValidProjectSlug(input)) {
		throw new TypeError("Project slug is malformed.");
	}
	return input;
}

export function isProjectPasswordWithinLimit(password: string): boolean {
	return textEncoder.encode(password).byteLength <= MAX_PROJECT_PASSWORD_BYTES;
}

export function validateAlbumName(input: unknown): string {
	if (
		typeof input !== "string" ||
		!input ||
		input.length > MAX_ALBUM_NAME_LENGTH ||
		input.trim() !== input
	) {
		throw new TypeError("Album name is malformed.");
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
		typeof input.password !== "string" ||
		!isProjectPasswordWithinLimit(input.password)
	) {
		throw new TypeError("Project password input is malformed.");
	}

	return {
		slug: validateProjectSlug(input.slug),
		password: input.password,
	};
}

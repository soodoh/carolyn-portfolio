import {
	isProjectPasswordWithinLimit,
	isValidProjectSlug,
	MAX_PROJECT_PASSWORD_BYTES,
} from "@/lib/server-function-inputs";

export type ProjectAuthSource = {
	slug: string;
	password?: string;
};

export type ProjectAuthManifestEntry = {
	passwordHash: string | null;
};

export type ProjectAuthManifest = Record<string, ProjectAuthManifestEntry>;

export async function buildProjectAuthManifest(
	projects: ProjectAuthSource[],
	hashPassword: (password: string) => Promise<string>,
): Promise<ProjectAuthManifest> {
	const manifest: ProjectAuthManifest = {};

	for (const project of projects) {
		const { password, slug } = project;
		if (!isValidProjectSlug(slug)) {
			throw new Error(`Project has an invalid slug: ${slug || "<empty>"}`);
		}
		if (Object.hasOwn(manifest, slug)) {
			throw new Error(`Duplicate project slug: ${slug}`);
		}
		if (password && !isProjectPasswordWithinLimit(password)) {
			throw new Error(
				`Password for project ${slug} exceeds bcrypt's ${MAX_PROJECT_PASSWORD_BYTES}-byte limit.`,
			);
		}

		manifest[slug] = {
			passwordHash: password ? await hashPassword(password) : null,
		};
	}

	return manifest;
}

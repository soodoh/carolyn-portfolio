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
	authVersion: string | null;
	passwordHash: string | null;
};

export type ProjectAuthManifest = Record<string, ProjectAuthManifestEntry>;

export type DeriveProjectAuthVersion = (
	slug: string,
	password: string,
) => Promise<string>;

function describeProtection(isProtected: boolean): string {
	return isProtected ? "protected" : "public";
}

export function projectAuthVersionsEqual(
	first: string,
	second: string,
): boolean {
	const length = Math.max(first.length, second.length);
	let mismatch = first.length ^ second.length;
	for (let index = 0; index < length; index += 1) {
		mismatch |=
			(first.charCodeAt(index) || 0) ^ (second.charCodeAt(index) || 0);
	}
	return mismatch === 0;
}

export async function assertProjectAuthManifestCurrent(
	manifest: ProjectAuthManifest,
	projects: ProjectAuthSource[],
	verifyPassword: (password: string, hash: string) => Promise<boolean>,
	deriveAuthVersion: DeriveProjectAuthVersion,
): Promise<void> {
	const currentPasswords = new Map<string, string | null>();
	for (const { password, slug } of projects) {
		if (currentPasswords.has(slug)) {
			throw new Error(
				`Duplicate project slug during auth revalidation: ${slug}`,
			);
		}
		currentPasswords.set(slug, password || null);
	}

	const allSlugs = new Set([
		...Object.keys(manifest),
		...currentPasswords.keys(),
	]);
	const changes: string[] = [];
	for (const slug of [...allSlugs].sort()) {
		const manifestEntry = manifest[slug];
		const currentPassword = currentPasswords.get(slug);
		if (!manifestEntry) {
			changes.push(`${slug} was added`);
			continue;
		}
		if (currentPassword === undefined) {
			changes.push(`${slug} was removed`);
			continue;
		}
		const manifestProtection = Boolean(manifestEntry.passwordHash);
		if (
			manifestProtection !== Boolean(manifestEntry.authVersion) ||
			(manifestEntry.authVersion !== null &&
				typeof manifestEntry.authVersion !== "string")
		) {
			throw new Error(
				`Project authorization manifest has an invalid auth version for ${slug}.`,
			);
		}
		const currentProtection = currentPassword !== null;
		if (manifestProtection !== currentProtection) {
			changes.push(
				`${slug} changed from ${describeProtection(manifestProtection)} to ${describeProtection(currentProtection)}`,
			);
			continue;
		}
		if (currentPassword && !isProjectPasswordWithinLimit(currentPassword)) {
			throw new Error(
				`Password for project ${slug} exceeds bcrypt's ${MAX_PROJECT_PASSWORD_BYTES}-byte limit during auth revalidation.`,
			);
		}
		if (manifestEntry.passwordHash && currentPassword) {
			if (
				!(await verifyPassword(currentPassword, manifestEntry.passwordHash))
			) {
				changes.push(`${slug} password changed`);
				continue;
			}
			const currentAuthVersion = await deriveAuthVersion(slug, currentPassword);
			if (
				!manifestEntry.authVersion ||
				!projectAuthVersionsEqual(currentAuthVersion, manifestEntry.authVersion)
			) {
				changes.push(`${slug} auth version changed`);
			}
		}
	}

	if (changes.length > 0) {
		throw new Error(
			`Project authorization changed during the build: ${changes.join(", ")}. Rebuild from a fresh Contentful snapshot.`,
		);
	}
}

export async function buildProjectAuthManifest(
	projects: ProjectAuthSource[],
	hashPassword: (password: string) => Promise<string>,
	deriveAuthVersion: DeriveProjectAuthVersion,
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

		manifest[slug] = password
			? {
					authVersion: await deriveAuthVersion(slug, password),
					passwordHash: await hashPassword(password),
				}
			: { authVersion: null, passwordHash: null };
	}

	return manifest;
}

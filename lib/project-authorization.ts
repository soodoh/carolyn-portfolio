import {
	type DeriveProjectAuthVersion,
	type ProjectAuthManifestEntry,
	projectAuthVersionsEqual,
} from "@/lib/project-auth-manifest-builder";
import { isProjectPasswordWithinLimit } from "@/lib/server-function-inputs";

export class ProjectAuthorizationDriftError extends Error {
	constructor(slug: string) {
		super(`Project authorization changed since this release: ${slug}`);
		this.name = "ProjectAuthorizationDriftError";
	}
}

export type ProjectAuthorizationSnapshot = {
	password?: string;
};

export type ProjectDetailSnapshot<ProjectInfo> =
	ProjectAuthorizationSnapshot & {
		projectInfo: ProjectInfo;
	};

export type AuthorizedProjectResult<ProjectInfo> =
	| { authorized: false }
	| { authorized: true; projectInfo: ProjectInfo };

export async function assertProjectAuthorizationCurrent(
	slug: string,
	releaseAuth: ProjectAuthManifestEntry,
	currentPassword: string | undefined,
	deriveAuthVersion: DeriveProjectAuthVersion,
): Promise<void> {
	const releaseIsProtected = Boolean(releaseAuth.passwordHash);
	if (
		releaseIsProtected !== Boolean(releaseAuth.authVersion) ||
		releaseIsProtected !== Boolean(currentPassword)
	) {
		throw new ProjectAuthorizationDriftError(slug);
	}
	if (!currentPassword) {
		return;
	}
	if (!isProjectPasswordWithinLimit(currentPassword)) {
		throw new ProjectAuthorizationDriftError(slug);
	}

	const currentAuthVersion = await deriveAuthVersion(slug, currentPassword);
	if (
		!releaseAuth.authVersion ||
		!projectAuthVersionsEqual(currentAuthVersion, releaseAuth.authVersion)
	) {
		throw new ProjectAuthorizationDriftError(slug);
	}
}

export async function loadProjectAfterAuthorization<ProjectInfo>(
	slug: string,
	releaseAuth: ProjectAuthManifestEntry,
	loadAuthorization: () => Promise<ProjectAuthorizationSnapshot>,
	verifyRequest: () => Promise<boolean>,
	loadDetail: () => Promise<ProjectDetailSnapshot<ProjectInfo>>,
	deriveAuthVersion: DeriveProjectAuthVersion,
): Promise<AuthorizedProjectResult<ProjectInfo>> {
	const authorization = await loadAuthorization();
	await assertProjectAuthorizationCurrent(
		slug,
		releaseAuth,
		authorization.password,
		deriveAuthVersion,
	);

	if (releaseAuth.passwordHash && !(await verifyRequest())) {
		return { authorized: false };
	}

	const detail = await loadDetail();
	await assertProjectAuthorizationCurrent(
		slug,
		releaseAuth,
		detail.password,
		deriveAuthVersion,
	);
	return { authorized: true, projectInfo: detail.projectInfo };
}

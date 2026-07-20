import { describe, expect, test } from "bun:test";
import {
	assertProjectAuthorizationCurrent,
	loadProjectAfterAuthorization,
} from "@/lib/project-authorization";

const publicRelease = { authVersion: null, passwordHash: null };
const releasePassword = "release-password";
const deriveAuthVersion = async (slug: string, password: string) =>
	`${slug}:${password}`;
const protectedRelease = {
	authVersion: `protected-project:${releasePassword}`,
	passwordHash: "build-time-bcrypt-hash",
};

describe("runtime project authorization", () => {
	test("fails closed when a released public project becomes protected", async () => {
		await expect(
			assertProjectAuthorizationCurrent(
				"public-project",
				publicRelease,
				"new-password",
				deriveAuthVersion,
			),
		).rejects.toThrow("authorization changed since this release");
	});

	test("fails closed when a protected project password changes", async () => {
		await expect(
			assertProjectAuthorizationCurrent(
				"protected-project",
				protectedRelease,
				"changed-password",
				deriveAuthVersion,
			),
		).rejects.toThrow("authorization changed since this release");
	});

	test("fails closed when a protected release has a stale auth version", async () => {
		await expect(
			assertProjectAuthorizationCurrent(
				"protected-project",
				{ ...protectedRelease, authVersion: "stale-auth-version" },
				releasePassword,
				deriveAuthVersion,
			),
		).rejects.toThrow("authorization changed since this release");
	});

	test("does not load protected detail or perform bcrypt work before cookie authorization", async () => {
		let detailLoads = 0;
		let versionDerivations = 0;
		await expect(
			loadProjectAfterAuthorization(
				"protected-project",
				protectedRelease,
				async () => ({ password: releasePassword }),
				async () => false,
				async () => {
					detailLoads += 1;
					throw new Error("malformed protected detail");
				},
				async (slug, password) => {
					versionDerivations += 1;
					return deriveAuthVersion(slug, password);
				},
			),
		).resolves.toEqual({ authorized: false });
		expect(detailLoads).toBe(0);
		expect(versionDerivations).toBe(1);
	});

	test("fetches detail only after verification and detects query drift", async () => {
		const events: string[] = [];
		await expect(
			loadProjectAfterAuthorization(
				"protected-project",
				protectedRelease,
				async () => {
					events.push("authorization");
					return { password: releasePassword };
				},
				async () => {
					events.push("cookie");
					return true;
				},
				async () => {
					events.push("detail");
					return {
						password: "changed-password",
						projectInfo: { title: "must not return" },
					};
				},
				deriveAuthVersion,
			),
		).rejects.toThrow("authorization changed since this release");
		expect(events).toEqual(["authorization", "cookie", "detail"]);
	});

	test("accepts authorization from the same runtime content snapshot", async () => {
		await expect(
			assertProjectAuthorizationCurrent(
				"protected-project",
				protectedRelease,
				releasePassword,
				deriveAuthVersion,
			),
		).resolves.toBeUndefined();
		await expect(
			assertProjectAuthorizationCurrent(
				"public-project",
				publicRelease,
				undefined,
				deriveAuthVersion,
			),
		).resolves.toBeUndefined();
	});
});

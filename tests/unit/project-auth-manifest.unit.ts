import { describe, expect, test } from "bun:test";
import { compare, hash } from "bcryptjs";
import {
	assertProjectAuthManifestCurrent,
	buildProjectAuthManifest,
} from "@/lib/project-auth-manifest-builder";

const deriveAuthVersion = async (slug: string, password: string) =>
	`version:${slug}:${password}`;

describe("project auth manifest", () => {
	test("records public and protected projects explicitly", async () => {
		const manifest = await buildProjectAuthManifest(
			[
				{ slug: "public-project" },
				{ slug: "protected-project", password: "secret" },
			],
			async (password) => `hashed:${password}`,
			deriveAuthVersion,
		);

		expect(manifest).toEqual({
			"public-project": { authVersion: null, passwordHash: null },
			"protected-project": {
				authVersion: "version:protected-project:secret",
				passwordHash: "hashed:secret",
			},
		});
	});

	test("rejects duplicate and malformed slugs", async () => {
		const hashPassword = async (password: string) => password;
		expect(
			buildProjectAuthManifest(
				[{ slug: "duplicate" }, { slug: "duplicate" }],
				hashPassword,
				deriveAuthVersion,
			),
		).rejects.toThrow("Duplicate project slug: duplicate");
		expect(
			buildProjectAuthManifest(
				[{ slug: "Invalid Slug" }],
				hashPassword,
				deriveAuthVersion,
			),
		).rejects.toThrow("Project has an invalid slug");
	});

	test("rejects authorization drift after a build starts", async () => {
		const manifest = {
			public: { authVersion: null, passwordHash: null },
			protected: {
				authVersion: "version:protected:existing-password",
				passwordHash: "hashed:existing-password",
			},
		};
		const verifyPassword = async (password: string, hash: string) =>
			hash === `hashed:${password}`;

		await expect(
			assertProjectAuthManifestCurrent(
				manifest,
				[
					{ slug: "public", password: "new-password" },
					{ slug: "protected", password: "existing-password" },
				],
				verifyPassword,
				deriveAuthVersion,
			),
		).rejects.toThrow("public changed from public to protected");
		await expect(
			assertProjectAuthManifestCurrent(
				manifest,
				[{ slug: "public" }, { slug: "protected" }],
				verifyPassword,
				deriveAuthVersion,
			),
		).rejects.toThrow("protected changed from protected to public");
	});

	test("rejects added, removed, and duplicate project drift", async () => {
		const verifyPassword = async (password: string, passwordHash: string) =>
			passwordHash === `hashed:${password}`;
		await expect(
			assertProjectAuthManifestCurrent(
				{ existing: { authVersion: null, passwordHash: null } },
				[{ slug: "existing" }, { slug: "added" }],
				verifyPassword,
				deriveAuthVersion,
			),
		).rejects.toThrow("added was added");
		await expect(
			assertProjectAuthManifestCurrent(
				{
					existing: { authVersion: null, passwordHash: null },
					removed: { authVersion: null, passwordHash: null },
				},
				[{ slug: "existing" }],
				verifyPassword,
				deriveAuthVersion,
			),
		).rejects.toThrow("removed was removed");
		await expect(
			assertProjectAuthManifestCurrent(
				{ duplicate: { authVersion: null, passwordHash: null } },
				[{ slug: "duplicate" }, { slug: "duplicate" }],
				verifyPassword,
				deriveAuthVersion,
			),
		).rejects.toThrow("Duplicate project slug during auth revalidation");
	});

	test("rejects protected password drift", async () => {
		const verifyPassword = async (password: string, hash: string) =>
			hash === `hashed:${password}`;
		await expect(
			assertProjectAuthManifestCurrent(
				{
					public: { authVersion: null, passwordHash: null },
					protected: {
						authVersion: "version:protected:original-password",
						passwordHash: "hashed:original-password",
					},
				},
				[
					{ slug: "public" },
					{ slug: "protected", password: "different-password" },
				],
				verifyPassword,
				deriveAuthVersion,
			),
		).rejects.toThrow("protected password changed");
	});

	test("rejects a stale auth version even when the bcrypt hash matches", async () => {
		const password = "current-password";
		const passwordHash = await hash(password, 4);
		expect(await compare(password, passwordHash)).toBe(true);

		await expect(
			assertProjectAuthManifestCurrent(
				{
					protected: {
						authVersion: "version:protected:stale-password",
						passwordHash,
					},
				},
				[{ slug: "protected", password }],
				compare,
				deriveAuthVersion,
			),
		).rejects.toThrow("protected auth version changed");
	});

	test("accepts an unchanged authorization manifest", async () => {
		await expect(
			assertProjectAuthManifestCurrent(
				{
					public: { authVersion: null, passwordHash: null },
					protected: {
						authVersion: "version:protected:original-password",
						passwordHash: "hashed:original-password",
					},
				},
				[
					{ slug: "public" },
					{ slug: "protected", password: "original-password" },
				],
				async (password, hash) => hash === `hashed:${password}`,
				deriveAuthVersion,
			),
		).resolves.toBeUndefined();
	});

	test("rejects passwords above bcrypt's byte limit", async () => {
		expect(
			buildProjectAuthManifest(
				[{ slug: "protected", password: "é".repeat(37) }],
				async (password) => password,
				deriveAuthVersion,
			),
		).rejects.toThrow("72-byte limit");
	});

	test("rejects an overlong current password before bcrypt truncation", async () => {
		const bcryptPrefix = "a".repeat(72);
		const passwordHash = await hash(bcryptPrefix, 4);
		expect(await compare(`${bcryptPrefix}suffix`, passwordHash)).toBe(true);

		let comparisons = 0;
		await expect(
			assertProjectAuthManifestCurrent(
				{ protected: { authVersion: "version:protected", passwordHash } },
				[{ slug: "protected", password: `${bcryptPrefix}suffix` }],
				async (password, currentHash) => {
					comparisons += 1;
					return compare(password, currentHash);
				},
				deriveAuthVersion,
			),
		).rejects.toThrow("72-byte limit during auth revalidation");
		expect(comparisons).toBe(0);
	});
});

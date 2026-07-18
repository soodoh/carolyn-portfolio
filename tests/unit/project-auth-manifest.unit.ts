import { describe, expect, test } from "bun:test";
import { buildProjectAuthManifest } from "@/lib/project-auth-manifest-builder";

describe("project auth manifest", () => {
	test("records public and protected projects explicitly", async () => {
		const manifest = await buildProjectAuthManifest(
			[
				{ slug: "public-project" },
				{ slug: "protected-project", password: "secret" },
			],
			async (password) => `hashed:${password}`,
		);

		expect(manifest).toEqual({
			"public-project": { passwordHash: null },
			"protected-project": { passwordHash: "hashed:secret" },
		});
	});

	test("rejects duplicate and malformed slugs", async () => {
		const hashPassword = async (password: string) => password;
		expect(
			buildProjectAuthManifest(
				[{ slug: "duplicate" }, { slug: "duplicate" }],
				hashPassword,
			),
		).rejects.toThrow("Duplicate project slug: duplicate");
		expect(
			buildProjectAuthManifest([{ slug: "Invalid Slug" }], hashPassword),
		).rejects.toThrow("Project has an invalid slug");
	});

	test("rejects passwords above bcrypt's byte limit", async () => {
		expect(
			buildProjectAuthManifest(
				[{ slug: "protected", password: "é".repeat(37) }],
				async (password) => password,
			),
		).rejects.toThrow("72-byte limit");
	});
});

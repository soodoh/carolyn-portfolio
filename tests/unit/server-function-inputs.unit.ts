import { describe, expect, test } from "bun:test";
import {
	isProjectPasswordWithinLimit,
	isValidProjectSlug,
	MAX_ALBUM_NAME_LENGTH,
	MAX_PROJECT_PASSWORD_BYTES,
	MAX_PROJECT_SLUG_LENGTH,
	validateAlbumName,
	validateProjectPasswordInput,
	validateProjectSlug,
} from "@/lib/server-function-inputs";

describe("server function inputs", () => {
	test("validates album names", () => {
		expect(validateAlbumName("Portraits")).toBe("Portraits");
		expect(validateAlbumName("a".repeat(MAX_ALBUM_NAME_LENGTH))).toBe(
			"a".repeat(MAX_ALBUM_NAME_LENGTH),
		);
		for (const input of [
			undefined,
			null,
			42,
			"",
			" Portraits",
			"Portraits ",
			"a".repeat(MAX_ALBUM_NAME_LENGTH + 1),
		]) {
			expect(() => validateAlbumName(input)).toThrow(TypeError);
		}
	});

	test("validates project slugs", () => {
		expect(isValidProjectSlug("magnolia-app")).toBe(true);
		expect(isValidProjectSlug("Magnolia-app")).toBe(false);
		expect(validateProjectSlug("magnolia-app")).toBe("magnolia-app");
		expect(validateProjectSlug("a".repeat(MAX_PROJECT_SLUG_LENGTH))).toBe(
			"a".repeat(MAX_PROJECT_SLUG_LENGTH),
		);

		for (const input of [
			undefined,
			null,
			42,
			{},
			[],
			"",
			"Magnolia-app",
			"magnolia_app",
			"magnolia/app",
			"-magnolia",
			"magnolia-",
			"magnolia--app",
			"a".repeat(MAX_PROJECT_SLUG_LENGTH + 1),
		]) {
			expect(() => validateProjectSlug(input)).toThrow(TypeError);
		}
	});

	test("validates project password input", () => {
		expect(isProjectPasswordWithinLimit("a".repeat(72))).toBe(true);
		expect(isProjectPasswordWithinLimit("é".repeat(36))).toBe(true);
		expect(isProjectPasswordWithinLimit("é".repeat(37))).toBe(false);
		expect(
			validateProjectPasswordInput({
				slug: "magnolia-app",
				password: "",
				extra: "discarded",
			}),
		).toEqual({ slug: "magnolia-app", password: "" });
		expect(
			validateProjectPasswordInput({
				slug: "magnolia-app",
				password: "a".repeat(MAX_PROJECT_PASSWORD_BYTES),
			}),
		).toEqual({
			slug: "magnolia-app",
			password: "a".repeat(MAX_PROJECT_PASSWORD_BYTES),
		});
		expect(
			validateProjectPasswordInput({
				slug: "magnolia-app",
				password: "é".repeat(MAX_PROJECT_PASSWORD_BYTES / 2),
			}),
		).toEqual({
			slug: "magnolia-app",
			password: "é".repeat(MAX_PROJECT_PASSWORD_BYTES / 2),
		});

		for (const input of [
			undefined,
			null,
			[],
			{},
			{ slug: "magnolia-app" },
			{ password: "secret" },
			{ slug: 42, password: "secret" },
			{ slug: "magnolia-app", password: 42 },
			{ slug: "", password: "secret" },
			{
				slug: "magnolia-app",
				password: "a".repeat(MAX_PROJECT_PASSWORD_BYTES + 1),
			},
			{
				slug: "magnolia-app",
				password: "é".repeat(MAX_PROJECT_PASSWORD_BYTES / 2 + 1),
			},
		]) {
			expect(() => validateProjectPasswordInput(input)).toThrow(TypeError);
		}
	});
});

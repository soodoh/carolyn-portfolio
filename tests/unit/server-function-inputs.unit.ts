import { describe, expect, test } from "bun:test";
import {
	validateProjectPasswordInput,
	validateProjectSlug,
} from "@/lib/server-function-inputs";

describe("server function inputs", () => {
	test("validates project slugs", () => {
		expect(validateProjectSlug("magnolia-app")).toBe("magnolia-app");

		for (const input of [undefined, null, 42, {}, [], ""]) {
			expect(() => validateProjectSlug(input)).toThrow(TypeError);
		}
	});

	test("validates project password input", () => {
		expect(
			validateProjectPasswordInput({
				slug: "magnolia-app",
				password: "",
				extra: "discarded",
			}),
		).toEqual({ slug: "magnolia-app", password: "" });

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
		]) {
			expect(() => validateProjectPasswordInput(input)).toThrow(TypeError);
		}
	});
});

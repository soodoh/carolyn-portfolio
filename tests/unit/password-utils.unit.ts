import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import {
	deriveProjectAuthVersion,
	signToken,
	verifyToken,
} from "@/lib/password-utils";

const TEST_SECRET = "password-utils-test-secret";
const SLUG = "magnolia-app";
const AUTH_VERSION = "auth-version-one";
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const TOKEN_CLOCK_SKEW_SECONDS = 5 * 60;
const NOW_SECONDS = 2_000_000_000;

let originalSecret: string | undefined;

beforeAll(() => {
	originalSecret = process.env.PROJECT_AUTH_SECRET;
	process.env.PROJECT_AUTH_SECRET = TEST_SECRET;
});

afterEach(() => {
	setSystemTime();
});

afterAll(() => {
	if (originalSecret === undefined) {
		delete process.env.PROJECT_AUTH_SECRET;
	} else {
		process.env.PROJECT_AUTH_SECRET = originalSecret;
	}
});

async function createToken(
	slug: string,
	timestamp: string,
	authVersion = AUTH_VERSION,
): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(TEST_SECRET),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(`${slug}:${authVersion}:${timestamp}`),
	);
	const encodedSignature = [...new Uint8Array(signature)]
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
	return `${slug}.${timestamp}.${encodedSignature}`;
}

describe("project auth tokens", () => {
	test("accepts current and boundary timestamps", async () => {
		setSystemTime(NOW_SECONDS * 1000);

		expect(
			await verifyToken(
				await createToken(SLUG, String(NOW_SECONDS)),
				SLUG,
				AUTH_VERSION,
			),
		).toBe(true);
		expect(
			await verifyToken(
				await createToken(SLUG, String(NOW_SECONDS - TOKEN_TTL_SECONDS)),
				SLUG,
				AUTH_VERSION,
			),
		).toBe(true);
		expect(
			await verifyToken(
				await createToken(SLUG, String(NOW_SECONDS + TOKEN_CLOCK_SKEW_SECONDS)),
				SLUG,
				AUTH_VERSION,
			),
		).toBe(true);
	});

	test("rejects expired and excessively future timestamps", async () => {
		setSystemTime(NOW_SECONDS * 1000);

		expect(
			await verifyToken(
				await createToken(SLUG, String(NOW_SECONDS - TOKEN_TTL_SECONDS - 1)),
				SLUG,
				AUTH_VERSION,
			),
		).toBe(false);
		expect(
			await verifyToken(
				await createToken(
					SLUG,
					String(NOW_SECONDS + TOKEN_CLOCK_SKEW_SECONDS + 1),
				),
				SLUG,
				AUTH_VERSION,
			),
		).toBe(false);
	});

	test("rejects noncanonical and unsafe timestamps", async () => {
		setSystemTime(NOW_SECONDS * 1000);

		for (const timestamp of [
			"-1",
			"+1",
			"01",
			"1.5",
			"1e3",
			"123abc",
			String(Number.MAX_SAFE_INTEGER + 1),
		]) {
			expect(
				await verifyToken(
					await createToken(SLUG, timestamp),
					SLUG,
					AUTH_VERSION,
				),
			).toBe(false);
		}
	});

	test("derives stable password-specific auth versions", async () => {
		const version = await deriveProjectAuthVersion(SLUG, "first-password");
		expect(await deriveProjectAuthVersion(SLUG, "first-password")).toBe(
			version,
		);
		expect(await deriveProjectAuthVersion(SLUG, "second-password")).not.toBe(
			version,
		);
	});

	test("revokes a token when the project auth version changes", async () => {
		setSystemTime(NOW_SECONDS * 1000);
		const token = await signToken(SLUG, AUTH_VERSION);

		expect(await verifyToken(token, SLUG, AUTH_VERSION)).toBe(true);
		expect(await verifyToken(token, SLUG, "auth-version-two")).toBe(false);
	});
});

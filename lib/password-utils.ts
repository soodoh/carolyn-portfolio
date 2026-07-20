import { getProjectAuthSecret } from "@/lib/server-secrets.server";

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const TOKEN_CLOCK_SKEW_SECONDS = 5 * 60; // Allow up to 5 minutes of clock skew.
const CANONICAL_TIMESTAMP_PATTERN = /^(?:0|[1-9]\d*)$/;

async function hmacSign(data: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(await getProjectAuthSecret()),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
	return [...new Uint8Array(signature)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function hmacVerify(data: string, signature: string): Promise<boolean> {
	const expected = await hmacSign(data);
	if (expected.length !== signature.length) {
		return false;
	}
	// Keep deterministic work across every character to avoid early-exit timing leaks.
	let mismatchCount = 0;
	for (let i = 0; i < expected.length; i += 1) {
		const value = expected[i];
		if (value !== signature[i]) {
			mismatchCount += 1;
		}
	}
	return mismatchCount === 0;
}

export function deriveProjectAuthVersion(
	slug: string,
	password: string,
): Promise<string> {
	return hmacSign(`project-auth-version:${slug}:${password}`);
}

export async function signToken(
	slug: string,
	authVersion: string,
): Promise<string> {
	const timestamp = Math.floor(Date.now() / 1000).toString();
	const data = `${slug}:${authVersion}:${timestamp}`;
	const signature = await hmacSign(data);
	return `${slug}.${timestamp}.${signature}`;
}

export async function verifyToken(
	token: string,
	slug: string,
	authVersion: string,
): Promise<boolean> {
	const parts = token.split(".");
	if (parts.length !== 3) {
		return false;
	}
	const [tokenSlug, timestamp, signature] = parts;
	if (tokenSlug !== slug) {
		return false;
	}

	if (!CANONICAL_TIMESTAMP_PATTERN.test(timestamp)) {
		return false;
	}
	const ts = Number(timestamp);
	if (!Number.isSafeInteger(ts)) {
		return false;
	}
	const now = Math.floor(Date.now() / 1000);
	if (now - ts > TOKEN_TTL_SECONDS || ts - now > TOKEN_CLOCK_SKEW_SECONDS) {
		return false;
	}

	return hmacVerify(`${tokenSlug}:${authVersion}:${timestamp}`, signature);
}

export const COOKIE_MAX_AGE = TOKEN_TTL_SECONDS;

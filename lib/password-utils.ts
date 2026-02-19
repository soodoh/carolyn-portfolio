const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getSecret(): string {
  const secret = process.env.PROJECT_AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing PROJECT_AUTH_SECRET environment variable");
  }
  return secret;
}

async function hmacSign(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
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
  for (const [index, value] of [...expected].entries()) {
    if (value !== signature[index]) {
      mismatchCount += 1;
    }
  }
  return mismatchCount === 0;
}

export async function signToken(slug: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const data = `${slug}:${timestamp}`;
  const signature = await hmacSign(data);
  return `${data}:${signature}`;
}

export async function verifyToken(
  token: string,
  slug: string,
): Promise<boolean> {
  const parts = token.split(":");
  if (parts.length !== 3) {return false;}
  const [tokenSlug, timestamp, signature] = parts;
  if (tokenSlug !== slug) {return false;}

  const ts = Number.parseInt(timestamp, 10);
  if (Number.isNaN(ts)) {return false;}
  const now = Math.floor(Date.now() / 1000);
  if (now - ts > TOKEN_TTL_SECONDS) {return false;}

  return hmacVerify(`${tokenSlug}:${timestamp}`, signature);
}

export const COOKIE_MAX_AGE = TOKEN_TTL_SECONDS;

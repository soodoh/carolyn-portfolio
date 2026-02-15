import { verifyToken } from "@/lib/password-utils";
import manifest from "@/lib/project-auth-manifest.json";
import { NextRequest, NextResponse } from "next/server";

const protectedSlugs = new Set(Object.keys(manifest));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Match /projects/{slug} but not /projects/{slug}/auth
  const match = pathname.match(/^\/projects\/([^/]+)$/);
  if (!match) return NextResponse.next();

  const slug = match[1];
  if (!protectedSlugs.has(slug)) return NextResponse.next();

  const cookie = request.cookies.get(`project-auth-${slug}`);
  if (cookie) {
    const valid = await verifyToken(cookie.value, slug);
    if (valid) return NextResponse.next();
  }

  // Rewrite to auth page (URL stays the same for the user)
  const authUrl = request.nextUrl.clone();
  authUrl.pathname = `/projects/${slug}/auth`;
  return NextResponse.rewrite(authUrl);
}

export const config = {
  matcher: "/projects/:slug",
};

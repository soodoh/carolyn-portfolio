"use server";

import { COOKIE_MAX_AGE, signToken } from "@/lib/password-utils";
import manifest from "@/lib/project-auth-manifest.json";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const protectedSlugs = manifest as Record<string, string>;

export type AuthState = {
  error: string | null;
};

export async function verifyProjectPassword(
  slug: string,
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = formData.get("password");
  if (typeof password !== "string" || !password) {
    return { error: "Please enter a password." };
  }

  const hash = protectedSlugs[slug];
  if (!hash) {
    return { error: "This project is not password protected." };
  }

  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    return { error: "The password you entered is incorrect." };
  }

  const token = await signToken(slug);
  const cookieStore = await cookies();
  cookieStore.set(`project-auth-${slug}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: `/projects/${slug}`,
    maxAge: COOKIE_MAX_AGE,
  });

  redirect(`/projects/${slug}`);
}

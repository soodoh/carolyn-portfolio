import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import { compare } from "bcryptjs";
import { COOKIE_MAX_AGE, signToken } from "@/lib/password-utils";
import { getProjectAuth } from "@/lib/project-auth";
import { validateProjectPasswordInput } from "@/lib/server-function-inputs";

export const verifyProjectPassword = createServerFn({ method: "POST" })
	.validator(validateProjectPasswordInput)
	.handler(async ({ data: { slug, password } }) => {
		if (!password) {
			return { error: "Please enter a password." };
		}

		const auth = getProjectAuth(slug);
		if (!auth?.passwordHash || !auth.authVersion) {
			return { error: "This project is not password protected." };
		}

		if (!(await compare(password, auth.passwordHash))) {
			return { error: "The password you entered is incorrect." };
		}

		const token = await signToken(slug, auth.authVersion);
		setCookie(`project-auth-${slug}`, token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
			maxAge: COOKIE_MAX_AGE,
		});
		return {};
	});

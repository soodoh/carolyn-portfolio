import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { compare } from "bcryptjs";
import { getAboutData, getResumeUrl } from "@/lib/fetch-about-data";
import { getBackgroundImage, getSocialMedia } from "@/lib/fetch-home-data";
import getAlbums from "@/lib/fetch-photos";
import {
	getProjectInfo,
	getProjects,
	ProjectNotFoundError,
} from "@/lib/fetch-projects";
import { COOKIE_MAX_AGE, signToken, verifyToken } from "@/lib/password-utils";
import manifest from "@/lib/project-auth-manifest.json";
import {
	validateProjectPasswordInput,
	validateProjectSlug,
} from "@/lib/server-function-inputs";

const protectedProjects = new Map(Object.entries(manifest));

export const getRootData = createServerFn().handler(async () => ({
	socialMedia: await getSocialMedia(),
}));

export const getHomePageData = createServerFn().handler(async () => {
	const [backgroundImage, projects] = await Promise.all([
		getBackgroundImage(),
		getProjects(),
	]);
	return { backgroundImage, projects };
});

export const getAboutPageData = createServerFn().handler(async () => {
	const [backgroundImage, aboutData] = await Promise.all([
		getBackgroundImage(),
		getAboutData(),
	]);
	return { backgroundImage, aboutData };
});

export const getProjectsPageData = createServerFn().handler(getProjects);

export const getPhotographyPageData = createServerFn().handler(getAlbums);

export const getProjectPageData = createServerFn({ method: "POST" })
	.validator(validateProjectSlug)
	.handler(async ({ data: slug }) => {
		const hash = protectedProjects.get(slug);
		if (hash) {
			const token = getCookie(`project-auth-${slug}`);
			if (!token || !(await verifyToken(token, slug))) {
				return { authorized: false as const, slug };
			}
		}

		try {
			const project = await getProjectInfo(slug);
			const { password, ...projectInfo } = project;
			void password;
			return {
				authorized: true as const,
				projectInfo,
				protected: Boolean(hash),
			};
		} catch (error) {
			if (error instanceof ProjectNotFoundError) {
				return { notFound: true as const };
			}
			throw error;
		}
	});

export const verifyProjectPassword = createServerFn({ method: "POST" })
	.validator(validateProjectPasswordInput)
	.handler(async ({ data: { slug, password } }) => {
		if (!password) {
			return { error: "Please enter a password." };
		}

		const hash = protectedProjects.get(slug);
		if (!hash) {
			return { error: "This project is not password protected." };
		}

		if (!(await compare(password, hash))) {
			return { error: "The password you entered is incorrect." };
		}

		const token = await signToken(slug);
		setCookie(`project-auth-${slug}`, token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
			maxAge: COOKIE_MAX_AGE,
		});
		return {};
	});

export const getResumePageUrl = createServerFn().handler(getResumeUrl);

import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setResponseHeader } from "@tanstack/react-start/server";
import type { JSX } from "react";
import PasswordForm from "@/components/password-form";
import ProjectInfoPage from "@/components/project-info-page";
import {
	getProjectAuthorizationSnapshot,
	getProjectPageSnapshot,
	ProjectNotFoundError,
} from "@/lib/fetch-projects";
import { deriveProjectAuthVersion, verifyToken } from "@/lib/password-utils";
import { getProjectAuth } from "@/lib/project-auth";
import {
	loadProjectAfterAuthorization,
	ProjectAuthorizationDriftError,
} from "@/lib/project-authorization";
import {
	isValidProjectSlug,
	validateProjectSlug,
} from "@/lib/server-function-inputs";

const getProjectPageData = createServerFn({ method: "POST" })
	.validator(validateProjectSlug)
	.handler(async ({ data: slug }) => {
		const auth = getProjectAuth(slug);
		if (!auth) {
			return { notFound: true as const };
		}
		try {
			if (auth.passwordHash) {
				setResponseHeader("Cache-Control", "private, no-store");
			}
			const result = await loadProjectAfterAuthorization(
				slug,
				auth,
				() => getProjectAuthorizationSnapshot(slug),
				async () => {
					const token = getCookie(`project-auth-${slug}`);
					return Boolean(
						auth.authVersion &&
							token &&
							(await verifyToken(token, slug, auth.authVersion)),
					);
				},
				() => getProjectPageSnapshot(slug),
				deriveProjectAuthVersion,
			);
			if (!result.authorized) {
				return { authorized: false as const, slug };
			}
			return {
				authorized: true as const,
				projectInfo: result.projectInfo,
				protected: Boolean(auth.passwordHash),
			};
		} catch (error) {
			if (error instanceof ProjectNotFoundError) {
				return { notFound: true as const };
			}
			if (error instanceof ProjectAuthorizationDriftError) {
				setResponseHeader("Cache-Control", "private, no-store");
			}
			throw error;
		}
	});

export const Route = createFileRoute("/projects/$slug")({
	loader: async ({ params: { slug } }) => {
		if (!isValidProjectSlug(slug)) {
			throw notFound();
		}
		const data = await getProjectPageData({ data: slug });
		if ("notFound" in data) {
			throw notFound();
		}
		return data;
	},
	head: ({ loaderData }) => {
		if (!loaderData?.authorized) {
			return {
				meta: [
					{ title: "CD Projects - Password Protected" },
					{ name: "robots", content: "noindex, nofollow" },
				],
			};
		}
		const { projectInfo } = loaderData;
		return {
			meta: [
				{ title: `CD Projects - ${projectInfo.title}` },
				{
					name: "description",
					content: `Carolyn DiLoreto's project, ${projectInfo.title} - ${projectInfo.summary}`,
				},
				{
					name: "robots",
					content: loaderData.protected ? "noindex, nofollow" : "index, follow",
				},
			],
		};
	},
	component: ProjectPage,
});

function ProjectPage(): JSX.Element {
	const data = Route.useLoaderData();
	if (!data.authorized) {
		return <PasswordForm slug={data.slug} />;
	}
	return <ProjectInfoPage projectInfo={data.projectInfo} />;
}

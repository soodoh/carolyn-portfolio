import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import type { JSX } from "react";
import PasswordForm from "@/components/password-form";
import ProjectInfoPage from "@/components/project-info-page";
import { getProjectInfo, ProjectNotFoundError } from "@/lib/fetch-projects";
import { verifyToken } from "@/lib/password-utils";
import manifest from "@/lib/project-auth-manifest.json";
import { validateProjectSlug } from "@/lib/server-function-inputs";

const protectedProjects = new Map(Object.entries(manifest));

const getProjectPageData = createServerFn({ method: "POST" })
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

export const Route = createFileRoute("/projects/$slug")({
	loader: async ({ params: { slug } }) => {
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

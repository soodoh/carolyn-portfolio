import { createFileRoute, notFound } from "@tanstack/react-router";
import type { JSX } from "react";
import PasswordForm from "@/components/password-form";
import ProjectInfoPage from "@/components/project-info-page";
import { getProjectPageData } from "@/lib/server-functions";

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

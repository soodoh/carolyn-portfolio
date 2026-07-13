import { createFileRoute } from "@tanstack/react-router";
import type { JSX } from "react";
import Projects from "@/components/projects";
import { getProjectsPageData } from "@/lib/server-functions";

export const Route = createFileRoute("/projects/")({
	loader: () => getProjectsPageData(),
	head: () => ({
		meta: [
			{ title: "CD Projects" },
			{
				name: "description",
				content:
					"View Carolyn DiLoreto's past and current projects. From film editing to UX Engineering there are many skills showcased in this section of the portfolio.",
			},
		],
	}),
	component: ProjectsPage,
});

function ProjectsPage(): JSX.Element {
	const projects = Route.useLoaderData();
	return <Projects projects={projects} />;
}

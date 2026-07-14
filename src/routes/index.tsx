import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { JSX } from "react";
import Background from "@/components/background";
import HomePageContent from "@/components/home-page-content";
import Projects from "@/components/projects";
import { getBackgroundImage } from "@/lib/fetch-home-data";
import { getProjects } from "@/lib/fetch-projects";

const getHomePageData = createServerFn().handler(async () => {
	const [backgroundImage, projects] = await Promise.all([
		getBackgroundImage(),
		getProjects(),
	]);
	return { backgroundImage, projects };
});

export const Route = createFileRoute("/")({
	loader: () => getHomePageData(),
	head: () => ({
		meta: [
			{ title: "CD Portfolio" },
			{
				name: "description",
				content:
					"Carolyn DiLoreto is a multi-media visual artist, dancer and USC alumnus. In this portfolio, view photo galleries, read about past projects, or even read her bio.",
			},
		],
	}),
	component: Home,
});

function Home(): JSX.Element {
	const { backgroundImage, projects } = Route.useLoaderData();
	return (
		<>
			<Background image={backgroundImage} />
			<HomePageContent />
			<Projects projects={projects} />
		</>
	);
}

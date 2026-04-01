import type { Metadata } from "next";
import type { JSX } from "react";
import Background from "@/components/background";
import HomePageContent from "@/components/home-page-content";
import Projects from "@/components/projects";
import { getBackgroundImage } from "@/lib/fetch-home-data";
import { getProjects } from "@/lib/fetch-projects";

// Statically generated at build time, will error if any Dynamic APIs are used
export const dynamic = "error";

export const metadata: Metadata = {
	title: "CD Portfolio",
	description:
		"Carolyn DiLoreto is a multi-media visual artist, dancer and USC alumnus. In this portfolio, view photo galleries, read about past projects, or even read her bio.",
	keywords: [],
};

export default async function Home(): Promise<JSX.Element> {
	const backgroundImage = await getBackgroundImage();
	const projects = await getProjects();

	return (
		<>
			<Background image={backgroundImage} />
			<HomePageContent />
			<Projects projects={projects} />
		</>
	);
}

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { JSX } from "react";
import PhotographyContent from "@/components/photography-content";
import getAlbums from "@/lib/fetch-photos";
import { containerClass } from "@/lib/utils";

const getPhotographyPageData = createServerFn().handler(getAlbums);

export const Route = createFileRoute("/photography")({
	loader: () => getPhotographyPageData(),
	head: () => ({
		meta: [
			{ title: "CD Photography" },
			{
				name: "description",
				content:
					"Carolyn DiLoreto's photography portfolio consists of dance, scenery and headshots. She is available for hire as a professional photographer in Los Angeles, CA.",
			},
		],
	}),
	component: PhotographyPage,
});

function PhotographyPage(): JSX.Element {
	const albums = Route.useLoaderData();
	return (
		<div className={containerClass}>
			<PhotographyContent albums={albums} />
		</div>
	);
}

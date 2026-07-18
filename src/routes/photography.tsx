import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { JSX } from "react";
import PhotographyContent from "@/components/photography-content";
import { getAlbumNames, getFirstAlbum } from "@/lib/fetch-photos";
import { containerClass } from "@/lib/utils";

const getPhotographyPageData = createServerFn().handler(async () => {
	const [albumNames, initialAlbum] = await Promise.all([
		getAlbumNames(),
		getFirstAlbum(),
	]);
	if (albumNames[0] !== initialAlbum.name) {
		throw new Error("Photography album order is inconsistent.");
	}
	return { albumNames, initialAlbum };
});

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
	const { albumNames, initialAlbum } = Route.useLoaderData();
	return (
		<div className={containerClass}>
			<h1 className="sr-only">Photography</h1>
			<PhotographyContent albumNames={albumNames} initialAlbum={initialAlbum} />
		</div>
	);
}

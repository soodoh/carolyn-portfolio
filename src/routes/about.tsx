import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { JSX } from "react";
import Background from "@/components/background";
import ImageWrapper from "@/components/image-wrapper";
import { getAboutData } from "@/lib/fetch-about-data";
import { getBackgroundImage } from "@/lib/fetch-home-data";
import { containerClass } from "@/lib/utils";

const getAboutPageData = createServerFn().handler(async () => {
	const [backgroundImage, aboutData] = await Promise.all([
		getBackgroundImage(),
		getAboutData(),
	]);
	return { backgroundImage, aboutData };
});

export const Route = createFileRoute("/about")({
	loader: () => getAboutPageData(),
	head: () => ({
		meta: [
			{ title: "About Carolyn" },
			{
				name: "description",
				content:
					"Carolyn DiLoreto is a multi-media visual artist, dancer, and USC alumnus, with a Media Arts + Practice major and a double minor in Dance and Computer Programming.",
			},
		],
	}),
	component: About,
});

function About(): JSX.Element {
	const { backgroundImage, aboutData } = Route.useLoaderData();
	return (
		<div className={containerClass}>
			<Background fixed image={backgroundImage} />
			<div className="grid grid-cols-[25%_1fr] gap-10 mt-14 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:grid-rows-[auto_auto]">
				<div className="flex flex-col items-center text-light text-base leading-6 max-md:mb-10">
					<ImageWrapper
						quality={50}
						className="w-full h-auto border-[1.5rem] border-light box-border mb-8"
						image={aboutData.profilePicture}
					/>
					<span>{aboutData.location}</span>
					<span>{aboutData.email}</span>
				</div>
				<div className="grow text-light-text font-header text-xl leading-8 [&_a]:text-light [&_p]:mt-0 [&_p]:mb-8">
					{documentToReactComponents(aboutData.bio)}
				</div>
			</div>
		</div>
	);
}

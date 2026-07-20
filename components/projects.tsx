"use client";

import { Link } from "@tanstack/react-router";
import type { JSX } from "react";
import { useMemo, useState } from "react";
import Filter from "@/components/filter";
import ImageWrapper, {
	MASONRY_IMAGE_BREAKPOINTS,
	MASONRY_IMAGE_SIZES,
} from "@/components/image-wrapper";
import Masonry from "@/components/masonry";
import type { Project, ProjectFilter } from "@/lib/types";
import { containerClass } from "@/lib/utils";

type Props = {
	projects: Project[];
	prioritizeFirst?: boolean;
};

const Projects = ({
	projects,
	prioritizeFirst = false,
}: Props): JSX.Element => {
	const projectTypes: ProjectFilter[] = useMemo(() => {
		const uniqueTypes = new Set<ProjectFilter>(["All"]);
		for (const project of projects) {
			for (const projectType of project.projectType) {
				uniqueTypes.add(projectType);
			}
		}
		return [...uniqueTypes];
	}, [projects]);

	const [projectType, setProjectType] = useState<ProjectFilter>("All");
	const filteredProjects =
		projectType === "All"
			? projects
			: projects.filter((project) => project.projectType.includes(projectType));

	return (
		<div className={containerClass}>
			<h1 className="sr-only">Projects</h1>
			<Filter
				options={projectTypes}
				current={projectType}
				onChange={setProjectType}
			/>

			<div>
				<Masonry>
					{filteredProjects.map((item, index) => (
						<Link
							key={item.id}
							aria-label={`${item.title} - ${item.summary}`}
							to="/projects/$slug"
							params={{ slug: item.slug }}
							className="relative flex text-dark no-underline group [&_h2]:m-0 [&_h2]:p-0 [&_h2]:inline [&_h2]:text-center [&_h2]:font-body [&_h2]:text-2xl [&_h2]:mb-2 [&_h3]:m-0 [&_h3]:p-0 [&_h3]:inline [&_h3]:text-center [&_h3]:font-body [&_h3]:text-base"
						>
							<div className="transition-all duration-[250ms] ease-in-out nonessential-motion opacity-0 invisible absolute inset-0 flex flex-col justify-center items-center z-1 group-hover:opacity-100 group-hover:visible group-hover:bg-white/90 group-focus-visible:opacity-100 group-focus-visible:visible group-focus-visible:bg-white/90 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:bg-white/90">
								<h2>{item.title}</h2>
								<h3>{item.summary}</h3>
							</div>
							<ImageWrapper
								alt=""
								breakpoints={MASONRY_IMAGE_BREAKPOINTS}
								image={item.coverImage}
								priority={prioritizeFirst && index === 0}
								quality={50}
								sizes={MASONRY_IMAGE_SIZES}
							/>
						</Link>
					))}
				</Masonry>
			</div>
		</div>
	);
};

export default Projects;

"use client";

import Filter from "@/components/Filter";
import ImageWrapper from "@/components/ImageWrapper";
import Masonry from "@/components/Masonry";
import { containerClass } from "@/lib/utils";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Project, ProjectType } from "@/lib/types";

const Projects = ({ projects }: { projects: Project[] }) => {
  const projectTypes: ProjectType[] = useMemo(() => {
    return Array.from(
      new Set(
        projects.reduce(
          (typeList, project) => {
            return typeList.concat(project.projectType);
          },
          ["All"] as ProjectType[],
        ),
      ),
    );
  }, [projects]);

  const [projectType, setProjectType] = useState<ProjectType>("All");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

  const handleProjectChange = (newType: ProjectType) => {
    setProjectType(newType);
    if (newType === "All") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter((project) => project.projectType.includes(newType)),
      );
    }
  };

  return (
    <div className={containerClass}>
      <Filter
        options={projectTypes}
        current={projectType}
        onChange={handleProjectChange}
      />

      <div role="tabpanel">
        <Masonry>
          {filteredProjects.map((item) => (
            <Link
              key={item.id}
              aria-label={`${item.title} - ${item.summary}`}
              href={`/projects/${item.slug}`}
              className="relative flex text-dark no-underline group [&_h2]:m-0 [&_h2]:p-0 [&_h2]:inline [&_h2]:text-center [&_h2]:font-body [&_h2]:text-2xl [&_h2]:mb-2 [&_h3]:m-0 [&_h3]:p-0 [&_h3]:inline [&_h3]:text-center [&_h3]:font-body [&_h3]:text-base"
            >
              <div className="transition-all duration-[250ms] ease-in-out opacity-0 invisible absolute inset-0 flex flex-col justify-center items-center z-1 group-hover:opacity-100 group-hover:visible group-hover:bg-white/90">
                <h2>{item.title}</h2>
                <h3>{item.summary}</h3>
              </div>
              <ImageWrapper image={item.coverImage} quality={50} />
            </Link>
          ))}
        </Masonry>
      </div>
    </div>
  );
};

export default Projects;

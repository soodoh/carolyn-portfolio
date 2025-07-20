"use client";

import layoutStyles from "@/components/commonStyles/layout.module.css";
import Filter from "@/components/Filter";
import ImageWrapper from "@/components/ImageWrapper";
import Masonry from "@/components/Masonry";
import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./projects.module.css";
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
    <div className={layoutStyles.container}>
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
              className={styles.projectContainer}
            >
              <div role="tooltip" className={styles.projectInfo}>
                <h2>{item.title}</h2>
                <h3>{item.summary}</h3>
              </div>
              <ImageWrapper image={item.coverImage} />
            </Link>
          ))}
        </Masonry>
      </div>
    </div>
  );
};

export default Projects;

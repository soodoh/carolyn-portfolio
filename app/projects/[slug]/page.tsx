import ProjectInfoPage from "@/components/ProjectInfoPage";
import { getProjectInfo, getProjects } from "@/lib/fetch-projects";
import type { Metadata } from "next";
import type { JSX } from "react";

// Statically generated at build time, will error if any Dynamic APIs are used
export const dynamic = "error";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projectData = await getProjectInfo(slug);
  return {
    title: `CD Projects - ${projectData.title}`,
    description: `Carolyn DiLoreto's project, ${projectData.title} - ${projectData.summary}`,
    robots: projectData.password ? "noindex, nofollow" : "index, follow",
    keywords: [],
  };
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const projects = await getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const projectData = await getProjectInfo(slug);
  const { password, ...publicData } = projectData;
  void password;

  return <ProjectInfoPage projectInfo={publicData} />;
}

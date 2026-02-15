import ProjectInfoPage from "@/components/ProjectInfoPage";
import { getProjectInfo, getProjects } from "@/lib/fetch-projects";
import { Metadata } from "next";

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

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projectData = await getProjectInfo(slug);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...publicData } = projectData;

  return <ProjectInfoPage projectInfo={publicData} />;
}

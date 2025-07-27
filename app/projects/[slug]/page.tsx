import ProjectInfoPage from "@/components/ProjectInfoPage";
import ProtectedProjectPage from "@/components/ProtectedProjectPage";
import { getProjectInfo } from "@/lib/fetch-projects";
import { Metadata } from "next";

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

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projectData = await getProjectInfo(slug);

  if (projectData.password) {
    return <ProtectedProjectPage projectInfo={projectData} />;
  }
  return <ProjectInfoPage projectInfo={projectData} />;
}

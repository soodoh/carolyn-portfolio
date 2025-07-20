import ProjectInfoPage from "@/components/ProjectInfoPage";
import ProtectedProjectPage from "@/components/ProtectedProjectPage";
import { getProjectInfo } from "@/lib/fetch-projects";

// <svelte:head>
// 	<title>CD Projects - {projectData.title}</title>
// 	<meta
// 		name="description"
// 		content={`Carolyn DiLoreto's project, ${projectData.title} - ${projectData.summary}`}
// 	/>
// 	<meta name="robots" content={projectData.password ? 'noindex, nofollow' : 'index, follow'} />
// </svelte:head>

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

import Projects from "@/components/Projects";
import { getProjects } from "@/lib/fetch-projects";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <Projects projects={projects} />;
}

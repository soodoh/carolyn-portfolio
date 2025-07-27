import Projects from "@/components/Projects";
import { getProjects } from "@/lib/fetch-projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CD Projects",
  description:
    "View Carolyn DiLoreto's past and current projects. From film editing to UX Engineering there are many skills showcased in this section of the portfolio.",
  keywords: [],
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <Projects projects={projects} />;
}

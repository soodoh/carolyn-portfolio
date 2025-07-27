import Projects from "@/components/Projects";
import { getProjects } from "@/lib/fetch-projects";
import type { Metadata } from "next";

// Statically generated at build time, will error if any Dynamic APIs are used
export const dynamic = "error";

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

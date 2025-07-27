import Background from "@/components/Background";
import HomePageContent from "@/components/HomePageContent";
import Projects from "@/components/Projects";
import { getBackgroundImage } from "@/lib/fetch-home-data";
import { getProjects } from "@/lib/fetch-projects";
import { Metadata } from "next";

// Statically generated at build time, will error if any Dynamic APIs are used
export const dynamic = "error";

export const metadata: Metadata = {
  title: "CD Portfolio",
  description:
    "Carolyn DiLoreto is a multi-media visual artist, dancer and USC alumnus. In this portfolio, view photo galleries, read about past projects, or even read her bio.",
  keywords: [],
};

export default async function Home() {
  const backgroundImage = await getBackgroundImage();
  const projects = await getProjects();

  return (
    <>
      <Background image={backgroundImage} />
      <HomePageContent />
      <Projects projects={projects} />
    </>
  );
}

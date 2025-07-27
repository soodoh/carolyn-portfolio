import Background from "@/components/Background";
import HomePageContent from "@/components/HomePageContent";
import Projects from "@/components/Projects";
import { getBackgroundImage } from "@/lib/fetch-home-data";
import { getProjects } from "@/lib/fetch-projects";
import { Metadata } from "next";

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

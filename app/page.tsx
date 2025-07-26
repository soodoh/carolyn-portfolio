import Background from "@/components/Background";
import Projects from "@/components/Projects";
import { getBackgroundImage } from "@/lib/fetch-home-data";
import { getProjects } from "@/lib/fetch-projects";
import { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Carolyn DiLoreto: Portfolio",
  description: "",
  keywords: [],
};

export default async function Home() {
  const backgroundImage = await getBackgroundImage();
  const projects = await getProjects();

  return (
    <>
      <Background image={backgroundImage} />
      <div className={styles.container}>
        <div className={styles.brand}>
          <h1>Carolyn DiLoreto</h1>
        </div>
        <div className={styles.links}>
          <Link aria-label="View Photography" href="/photography">
            View Photography
          </Link>
          <Link aria-label="View Projects" href="/projects">
            View Projects
          </Link>
        </div>
      </div>
      <Projects projects={projects} />
    </>
  );
}

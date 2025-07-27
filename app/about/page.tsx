import Background from "@/components/Background";
import layoutStyles from "@/components/commonStyles/layout.module.css";
import ImageWrapper from "@/components/ImageWrapper";
import { getAboutData } from "@/lib/fetch-about-data";
import { getBackgroundImage } from "@/lib/fetch-home-data";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import styles from "./page.module.css";
import type { Metadata } from "next";

// Statically generated at build time, will error if any Dynamic APIs are used
export const dynamic = "error";

export const metadata: Metadata = {
  title: "About Carolyn",
  description:
    "Carolyn DiLoreto is a multi-media visual artist, dancer, and USC alumnus, with a Media Arts + Practice major and a double minor in Dance and Computer Programming.",
  keywords: [],
};

export default async function About() {
  const backgroundImage = await getBackgroundImage();
  const aboutData = await getAboutData();

  return (
    <div className={layoutStyles.container}>
      <Background fixed image={backgroundImage} />
      <div className={styles.container}>
        <div className={styles.info}>
          <ImageWrapper
            quality={50}
            className={styles.image}
            image={aboutData.profilePicture}
          />
          <span>{aboutData.location}</span>
          <span>{aboutData.email}</span>
        </div>
        <div className={styles.bioContainer}>
          {documentToReactComponents(aboutData.bio)}
        </div>
      </div>
    </div>
  );
}

import Background from "@/components/Background";
import layoutStyles from "@/components/commonStyles/layout.module.css";
import ImageWrapper from "@/components/ImageWrapper";
import { getAboutData } from "@/lib/fetch-about-data";
import { getBackgroundImage } from "@/lib/fetch-home-data";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import styles from "./page.module.css";

export default async function About() {
  const backgroundImage = await getBackgroundImage();
  const aboutData = await getAboutData();

  return (
    <div className={layoutStyles.container}>
      <Background fixed image={backgroundImage} />
      <div className={styles.container}>
        <div className={styles.info}>
          <ImageWrapper
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

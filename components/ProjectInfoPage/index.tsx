import LeftArrowIcon from "@/components/icons/LeftArrowIcon";
import ImageWrapper from "@/components/ImageWrapper";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import classNames from "classnames/bind";
import Link from "next/link";
import styles from "./projectPage.module.css";
import type { ProjectInfo } from "@/lib/types";

const cx = classNames.bind(styles);

const ProjectInfo = ({ projectInfo }: { projectInfo: ProjectInfo }) => {
  return (
    <div className={styles.container}>
      <Link aria-label="Go back" href="/projects" className={styles.goBack}>
        <LeftArrowIcon />
        Go Back
      </Link>
      <section
        className={cx({ header: true, videoHeader: !!projectInfo.videoLink })}
      >
        <div className={styles.info}>
          <h1>{projectInfo.title}</h1>
          {projectInfo.role && <h2>{projectInfo.role}</h2>}
        </div>
        {!projectInfo.videoLink ? (
          <div className={styles.image}>
            <ImageWrapper image={projectInfo.coverImage} />
          </div>
        ) : (
          <div className={styles.video}>
            <iframe
              src={projectInfo.videoLink}
              title="Video Player"
              // frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; fullscreen; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
      </section>
      <div className={styles.descriptionContainer}>
        {documentToReactComponents(projectInfo.description, {
          stripEmptyTrailingParagraph: true,
          renderNode: {
            [BLOCKS.TABLE]: () => null,
            [BLOCKS.EMBEDDED_ASSET]: (node) => {
              return <ImageWrapper sizes="100vw" image={node.data.image} />;
            },
          },
        })}
      </div>
      <Link
        aria-label="View more work"
        href="/projects"
        className={styles.viewMore}
      >
        View More Work
      </Link>
    </div>
  );
};

export default ProjectInfo;

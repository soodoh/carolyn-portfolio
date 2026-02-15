import LeftArrowIcon from "@/components/icons/LeftArrowIcon";
import ImageWrapper from "@/components/ImageWrapper";
import { cn } from "@/lib/utils";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import Link from "next/link";
import type { ProjectInfoPublic } from "@/lib/types";

const ProjectInfo = ({ projectInfo }: { projectInfo: ProjectInfoPublic }) => {
  return (
    <div className="max-w-[1000px] px-(--spacing-padding) py-8 mx-auto flex flex-col items-center">
      <Link
        aria-label="Go back"
        href="/projects"
        className="self-start transition-all duration-[250ms] ease-in-out bg-transparent border border-dark/50 text-dark inline-flex items-center no-underline px-4 py-2 text-[0.9rem] mb-12 hover:bg-dark/10 hover:border-dark [&_svg]:mr-3 [&_svg]:w-6 [&_svg]:fill-dark"
      >
        <LeftArrowIcon />
        Go Back
      </Link>
      <section
        className={cn(
          "w-full grid grid-cols-2 max-md:grid-cols-1",
          projectInfo.videoLink &&
            "grid-cols-1 [&_.project-info]:text-center [&_h2]:pb-8",
        )}
      >
        <div className="flex flex-col justify-center [&_h1]:m-0 [&_h1]:text-[3.8rem] [&_h2]:m-0 [&_h2]:font-body project-info">
          <h1>{projectInfo.title}</h1>
          {projectInfo.role && <h2>{projectInfo.role}</h2>}
        </div>
        {!projectInfo.videoLink ? (
          <div className="w-full max-md:row-start-1 max-md:mb-8">
            <ImageWrapper image={projectInfo.coverImage} />
          </div>
        ) : (
          <div className="relative pt-[56.25%] [&_iframe]:absolute [&_iframe]:top-0 [&_iframe]:w-full [&_iframe]:h-full">
            <iframe
              src={projectInfo.videoLink}
              title="Video Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; fullscreen; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
      </section>
      <div className="rich-text-container">
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
        className="bg-dark text-light-text no-underline mx-auto inline px-4 py-2 text-[0.9rem] transition-all duration-[250ms] ease-in-out hover:shadow-[0_0.2rem_0.3rem_var(--color-dark)]"
      >
        View More Work
      </Link>
    </div>
  );
};

export default ProjectInfo;

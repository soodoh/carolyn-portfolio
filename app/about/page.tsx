import Background from "@/components/Background";
import ImageWrapper from "@/components/ImageWrapper";
import { getAboutData } from "@/lib/fetch-about-data";
import { getBackgroundImage } from "@/lib/fetch-home-data";
import { containerClass } from "@/lib/utils";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
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
    <div className={containerClass}>
      <Background fixed image={backgroundImage} />
      <div className="grid grid-cols-[25%_1fr] gap-10 mt-14 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:grid-rows-[auto_auto]">
        <div className="flex flex-col items-center text-light text-base leading-6 max-md:mb-10">
          <ImageWrapper
            quality={50}
            className="w-full h-auto border-[1.5rem] border-light box-border mb-8"
            image={aboutData.profilePicture}
          />
          <span>{aboutData.location}</span>
          <span>{aboutData.email}</span>
        </div>
        <div className="grow text-light-text font-header text-xl leading-8 [&_a]:text-light [&_p]:mt-0 [&_p]:mb-8">
          {documentToReactComponents(aboutData.bio)}
        </div>
      </div>
    </div>
  );
}

import PhotographyContent from "@/components/PhotographyContent";
import { getAlbums } from "@/lib/fetch-photos";
import { containerClass } from "@/lib/utils";
import type { Metadata } from "next";

// Statically generated at build time, will error if any Dynamic APIs are used
export const dynamic = "error";

export const metadata: Metadata = {
  title: "CD Photography",
  description:
    "Carolyn DiLoreto's photography portfolio consists of dance, scenery and headshots. She is available for hire as a professional photographer in Los Angeles, CA.",
  keywords: [],
};

export default async function PhotographyPage() {
  const albums = await getAlbums();
  return (
    <div className={containerClass}>
      <PhotographyContent albums={albums} />
    </div>
  );
}

import layoutStyles from "@/components/commonStyles/layout.module.css";
import PhotographyContent from "@/components/PhotographyContent";
import { getAlbums } from "@/lib/fetch-photos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CD Photography",
  description:
    "Carolyn DiLoreto's photography portfolio consists of dance, scenery and headshots. She is available for hire as a professional photographer in Los Angeles, CA.",
  keywords: [],
};

export default async function PhotographyPage() {
  const albums = await getAlbums();
  return (
    <div className={layoutStyles.container}>
      <PhotographyContent albums={albums} />
    </div>
  );
}

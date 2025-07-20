import layoutStyles from "@/components/commonStyles/layout.module.css";
import PhotographyContent from "@/components/PhotographyContent";
import { getAlbums } from "@/lib/fetch-photos";

// <svelte:head>
// 	<title>CD Photography</title>
// 	<meta
// 		name="description"
// 		content="Carolyn DiLoreto's photography portfolio consists of dance, scenery and headshots. She is available for hire as a professional photographer in Los Angeles, CA."
// 	/>
// </svelte:head>

export default async function PhotographyPage() {
  const albums = await getAlbums();
  return (
    <div className={layoutStyles.container}>
      <PhotographyContent albums={albums} />
    </div>
  );
}

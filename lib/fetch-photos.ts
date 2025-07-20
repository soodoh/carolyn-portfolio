import pAll from "p-all";
import { client, formatImage } from "./contentful-utils";
import type { Album, ImageType } from "./types";
import type { Asset } from "contentful";

export async function getAlbums(): Promise<Album[]> {
  const photoData = await client.getEntries({
    content_type: "photos",
    order: ["fields.order"],
  });

  const albums: Album[] = await Promise.all(
    photoData.items.map(async (item) => {
      const imagePromises: (() => Promise<ImageType>)[] = Array.isArray(
        item.fields.photos,
      )
        ? item.fields.photos.map((photo) => () => formatImage(photo as Asset))
        : [];
      return {
        name: String(item.fields.album),
        photos: await pAll(imagePromises, { concurrency: 5 }),
      };
    }),
  );
  return albums;
}

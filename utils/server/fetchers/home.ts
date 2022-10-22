import { Entry } from "contentful";
import { formatImage, getClient } from "../contentful";
import type { HomeData } from "../../types";

const getHomeData: () => Promise<HomeData[]> = async () => {
  const response = await getClient().getEntries({
    content_type: "home",
    order: "fields.order",
  });

  const formattedResponse = await Promise.all(
    response.items.map(async (entry: Entry<any>) => {
      const images = await Promise.all(entry.fields?.images?.map(formatImage));
      return {
        id: entry.sys.id,
        mainSection: !!entry.fields.mainSection,
        title: entry.fields.title || null,
        subtitle: entry.fields.subtitle || null,
        description: entry.fields.description,
        buttonText: entry.fields.buttonText || null,
        buttonLink: entry.fields.buttonLink || null,
        images,
      };
    })
  );
  return formattedResponse;
};

export default getHomeData;

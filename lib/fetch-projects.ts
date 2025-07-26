import {
  client,
  formatImage,
  getImageAssetFromRichTextNode,
} from "@/lib/contentful-utils";
import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { BLOCKS } from "@contentful/rich-text-types";
import pAll from "p-all";
import type { Project, ProjectInfo, ProjectType } from "@/lib/types";
import type { Asset as ContentfulAsset } from "contentful";

function getLink(rawLink: unknown): string | null {
  if (!rawLink) return null;
  const link = String(rawLink);
  if (/vimeo/gi.test(link)) {
    return `${link}?title=0&byline=0&portrait=0`;
  }
  if (/youtu\.?be/gi.test(link)) {
    const videoId = link.match(/\w+$/)?.pop();
    return videoId ? `https://www.youtube.com/embed/${videoId}` : link;
  }
  return link;
}

export async function getProjects(): Promise<Project[]> {
  const projectData = await client.getEntries({
    content_type: "project",
    order: ["fields.order"],
  });

  const promises: (() => Promise<Project>)[] = projectData.items.map(
    (item) => async () => {
      const coverImage = await formatImage(
        item.fields.coverImage as ContentfulAsset,
      );
      return {
        id: String(item.sys.id),
        title: String(item.fields.title),
        summary: String(item.fields.summary),
        slug: String(item.fields.slug),
        coverImage: coverImage,
        projectType: item.fields.projectType as ProjectType[],
      };
    },
  );
  return pAll(promises, { concurrency: 10 });
}

export async function getProjectInfo(slug: string): Promise<ProjectInfo> {
  const projectQuery = await client.getEntries({
    content_type: "project",
    "fields.slug[match]": slug,
    include: 1,
  });
  const projectItem = projectQuery.items[0];
  const coverImage = await formatImage(
    projectItem.fields.coverImage as ContentfulAsset,
  );
  const descriptionDocument = await richTextFromMarkdown(
    String(projectItem.fields.description),
    async (node) => {
      const url = (node as unknown as { url: string }).url;
      const alt = (node as unknown as { alt: string }).alt;
      return {
        nodeType: BLOCKS.EMBEDDED_ASSET,
        content: [],
        data: {
          image: await getImageAssetFromRichTextNode(url, alt),
        },
      };
    },
  );

  return {
    id: String(projectItem.sys.id),
    title: String(projectItem.fields.title),
    summary: String(projectItem.fields.summary),
    slug: String(projectItem.fields.slug),
    coverImage: coverImage,
    projectType: projectItem.fields.projectType as ProjectType[],
    role: projectItem.fields.role ? String(projectItem.fields.role) : null,
    description: descriptionDocument,
    videoLink: getLink(projectItem.fields.videoLink),
    password: projectItem.fields.password
      ? String(projectItem.fields.password)
      : null,
  };
}

import type { Document } from "@contentful/rich-text-types";

export type Asset = {
  id: string;
  title: string;
  description: string;
  url: string;
};

export type ImagePlaceholder = `data:image/${string}`;

export type ImageType = Asset & {
  width: number;
  height: number;
  placeholder: ImagePlaceholder;
  dominantColor?: string;
};

export type Album = {
  name: string;
  photos: ImageType[];
};

export type IconType = "instagram" | "linkedin";
export type ProjectType =
  | "All"
  | "Design"
  | "Film"
  | "Interactive"
  | "Animation";

export type SocialMedia = {
  id: string;
  title: IconType;
  link: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  coverImage: ImageType;
  projectType: ProjectType[];
  summary: string;
};

export type ProjectInfo = {
  id: string;
  title: string;
  slug: string;
  coverImage: ImageType;
  projectType: ProjectType[];
  summary: string;
  role: string | null;
  description: Document;
  videoLink: string | null;
  password: string | null;
};

export type AboutData = {
  profilePicture: ImageType;
  bio: Document;
  location: string;
  email: string;
};

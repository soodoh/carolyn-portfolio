import type { Document } from "@contentful/rich-text-types";

export type Asset = {
	id: string;
	title: string;
	description: string;
	url: string;
};

export type ImagePlaceholder = string;

export type ImageType = Asset & {
	width: number;
	height: number;
	placeholder: ImagePlaceholder;
};

export type Album = {
	name: string;
	photos: ImageType[];
};

export type IconType = "instagram" | "linkedin";
export type ProjectType = "Design" | "Film" | "Interactive" | "Animation";
export type ProjectFilter = "All" | ProjectType;

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

export type ProjectInfo = Project & {
	role?: string;
	description: Document;
	videoLink?: string;
};

export type AboutData = {
	profilePicture: ImageType;
	bio: Document;
	location: string;
	email: string;
};

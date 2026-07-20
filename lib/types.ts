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

export const ICON_TYPES = ["instagram", "linkedin"] as const;
export type IconType = (typeof ICON_TYPES)[number];

export const PROJECT_TYPES = [
	"Design",
	"Film",
	"Interactive",
	"Animation",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];
export type ProjectFilter = "All" | ProjectType;

export function isIconType(value: unknown): value is IconType {
	return typeof value === "string" && ICON_TYPES.some((icon) => icon === value);
}

export function isProjectType(value: unknown): value is ProjectType {
	return (
		typeof value === "string" && PROJECT_TYPES.some((type) => type === value)
	);
}

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

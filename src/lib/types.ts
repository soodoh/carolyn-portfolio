export type Album = {
	name: string;
	photos: ImageType[];
};

export type Asset = {
	id: string;
	title: string;
	url: string;
};

export type ImageType = Asset & {
	width: number;
	height: number;
	placeholder: string;
	dominantColor?: string;
};

export type IconType = 'instagram' | 'linkedin';
export type ProjectType = 'All' | 'Design' | 'Film' | 'Interactive' | 'Animation';

export type SocialMedia = {
	id: string;
	title: IconType;
	link: string;
};

export type BaseProject = {
	id: string;
	title: string;
	slug: string;
	coverImage: ImageType;
	projectType: ProjectType[];
	summary: string;
};

export type Project = BaseProject & {
	role: string | null;
	description: string;
	videoLink: string | null;
	password: string | null;
};

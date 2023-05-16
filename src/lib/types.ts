export type Album = {
	name: string;
	photos: Asset[];
};

export type Asset = {
	id: string;
	title: string;
	url: string;
};

export type IconType = 'instagram' | 'linkedin';
export type ProjectType = 'All' | 'Design' | 'Film' | 'Interactive' | 'Animation';

export type SocialMedia = {
	id: string;
	title: IconType;
	link: string;
};

export type Project = {
	id: string;
	coverImage: Asset;
	title: string;
	description: string;
	role: string;
	link: string;
	summary: string;
	projectType: ProjectType[];
};

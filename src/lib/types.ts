export type Asset = {
	id: string;
	title: string;
	url: string;
};

export type IconType = 'instagram' | 'linkedin';

export type SocialMedia = {
	id: string;
	title: IconType;
	link: string;
};

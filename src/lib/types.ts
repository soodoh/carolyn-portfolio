export type Asset = {
	id: string;
	title: string;
	url: string;
};

export type SocialMedia = {
	id: string;
	title: string;
	link: string;
	icon: Asset;
};

export type LayoutData = {
	socialMedia: SocialMedia[];
	backgroundImage: Asset;
};

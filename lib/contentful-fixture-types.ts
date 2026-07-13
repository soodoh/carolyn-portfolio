import type {
	AboutData,
	Album,
	ImageType,
	Project,
	ProjectInfo,
	SocialMedia,
} from "@/lib/types";

export type ContentfulFixture = {
	backgroundImage: ImageType;
	socialMedia: SocialMedia[];
	about: AboutData;
	resumeUrl: string;
	projects: Project[];
	projectInfo: Record<string, ProjectInfo>;
	albums: Album[];
};

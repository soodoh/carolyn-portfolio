import type {
	AboutData,
	Album,
	ImageType,
	Project,
	ProjectInfo,
	SocialMedia,
} from "@/lib/types";

type FixtureProjectInfo = ProjectInfo & { password?: string };

export type ContentfulFixture = {
	backgroundImage: ImageType;
	socialMedia: SocialMedia[];
	about: AboutData;
	resumeUrl: string;
	projects: Project[];
	projectInfo: Record<string, FixtureProjectInfo>;
	albums: Album[];
};

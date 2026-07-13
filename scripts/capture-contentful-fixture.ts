import { mkdir, rm, writeFile } from "node:fs/promises";
import { getAboutData, getResumeUrl } from "@/lib/fetch-about-data";
import { getBackgroundImage, getSocialMedia } from "@/lib/fetch-home-data";
import getAlbums from "@/lib/fetch-photos";
import { getProjectInfo, getProjects } from "@/lib/fetch-projects";
import type { ImageType } from "@/lib/types";

const assetDirectory = new URL("../public/test-assets/", import.meta.url);

async function captureImage(image: ImageType): Promise<ImageType> {
	const url = new URL(image.url);
	url.searchParams.set("w", "1600");
	url.searchParams.set("q", "85");
	url.searchParams.set("fm", "jpg");
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Unable to capture ${image.id}: ${response.status}`);
	}

	const filename = `${image.id}.jpg`;
	await writeFile(
		new URL(filename, assetDirectory),
		Buffer.from(await response.arrayBuffer()),
	);
	return { ...image, url: `/test-assets/${filename}` };
}

async function main(): Promise<void> {
	await rm(assetDirectory, { recursive: true, force: true });
	await mkdir(assetDirectory, { recursive: true });

	const projects = await getProjects();
	const capturedCovers = new Map<string, ImageType>();
	const capturedProjects = await Promise.all(
		projects.map(async (project) => {
			const coverImage = await captureImage(project.coverImage);
			capturedCovers.set(coverImage.id, coverImage);
			return { ...project, coverImage };
		}),
	);
	const projectEntries = await Promise.all(
		projects.map(async (project) => {
			const projectInfo = await getProjectInfo(project.slug);
			const coverImage = capturedCovers.get(projectInfo.coverImage.id);
			if (!coverImage) {
				throw new Error(`Missing captured cover for ${project.slug}`);
			}
			return [
				project.slug,
				{
					...projectInfo,
					coverImage,
					password: projectInfo.password ? "playwright-password" : undefined,
				},
			];
		}),
	);
	const about = await getAboutData();
	const fixture = {
		backgroundImage: await captureImage(await getBackgroundImage()),
		socialMedia: await getSocialMedia(),
		about: {
			...about,
			profilePicture: await captureImage(about.profilePicture),
		},
		resumeUrl: await getResumeUrl(),
		projects: capturedProjects,
		projectInfo: Object.fromEntries(projectEntries),
		albums: await getAlbums(),
	};
	const output = `${JSON.stringify(fixture, null, "\t")}\n`;
	const outputPath = new URL(
		"../tests/fixtures/contentful.json",
		import.meta.url,
	);
	await writeFile(outputPath, output);
	process.stdout.write(
		`Contentful fixture written to ${outputPath.pathname}\n`,
	);
}

await main();

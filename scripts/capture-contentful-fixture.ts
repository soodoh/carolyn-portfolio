import { mkdir, rm, writeFile } from "node:fs/promises";
import type { Node as RichTextNode } from "@contentful/rich-text-types";
import pAll from "p-all";
import sharp from "sharp";
import { getAboutContent } from "@/lib/fetch-about-data";
import { getSocialMedia } from "@/lib/fetch-home-data";
import getAlbums from "@/lib/fetch-photos";
import { decodeImage } from "@/lib/image-type";
import type { ImageType } from "@/lib/types";
import { loadContentfulFixtureProjects } from "@/scripts/contentful-fixture-projects";
import {
	recoverFixtureOutputs,
	replaceFixtureOutputs,
	withFixtureOutputLock,
} from "@/scripts/fixture-output-transaction";

const assetDirectory = new URL("../public/test-assets/", import.meta.url);
const stagedAssetDirectory = new URL(
	"../public/.test-assets-staging/",
	import.meta.url,
);
const backupAssetDirectory = new URL(
	"../public/.test-assets-backup/",
	import.meta.url,
);
const outputPath = new URL(
	"../tests/fixtures/contentful.json",
	import.meta.url,
);
const stagedOutputPath = new URL(
	"../tests/fixtures/contentful.json.tmp",
	import.meta.url,
);
const backupOutputPath = new URL(
	"../tests/fixtures/contentful.json.backup",
	import.meta.url,
);
const commitMarkerPath = new URL(
	"../tests/fixtures/.contentful-fixture-commit",
	import.meta.url,
);
const fixtureLockPath = new URL(
	"../tests/fixtures/.contentful-fixture.lock",
	import.meta.url,
);
const fixtureOutputPaths = {
	assetDirectory,
	backupAssetDirectory,
	backupOutputPath,
	commitMarkerPath,
	outputPath,
	stagedAssetDirectory,
	stagedOutputPath,
};

function isRichTextNode(value: unknown): value is RichTextNode {
	return (
		typeof value === "object" &&
		value !== null &&
		"nodeType" in value &&
		typeof value.nodeType === "string" &&
		"data" in value &&
		typeof value.data === "object" &&
		value.data !== null
	);
}

function getRichTextImages(node: RichTextNode): ImageType[] {
	const images: ImageType[] = [];
	const image = decodeImage(node.data.image);
	if (image) {
		images.push(image);
	}
	if ("content" in node && Array.isArray(node.content)) {
		for (const child of node.content) {
			if (isRichTextNode(child)) {
				images.push(...getRichTextImages(child));
			}
		}
	}
	return images;
}

function replaceRichTextImages(
	node: RichTextNode,
	capturedImages: Map<string, ImageType>,
): void {
	const original = decodeImage(node.data.image);
	if (original) {
		const captured = capturedImages.get(original.id);
		if (!captured) {
			throw new Error(`Missing captured rich-text image ${original.id}`);
		}
		node.data.image = {
			...original,
			url: captured.url,
			placeholder: captured.placeholder,
		};
	}
	if ("content" in node && Array.isArray(node.content)) {
		for (const child of node.content) {
			if (isRichTextNode(child)) {
				replaceRichTextImages(child, capturedImages);
			}
		}
	}
}

async function captureImage(image: ImageType): Promise<ImageType> {
	const url = new URL(image.url);
	if (url.hostname === "downloads.contentful.com") {
		url.hostname = "images.ctfassets.net";
	}
	url.searchParams.set("w", "1600");
	url.searchParams.set("q", "85");
	url.searchParams.set("fm", "jpg");
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Unable to capture ${image.id}: ${response.status}`);
	}

	const safeId = image.id.replace(/[^a-zA-Z0-9_-]/g, "-");
	const filename = `${safeId}.jpg`;
	const imageBuffer = Buffer.from(await response.arrayBuffer());
	const placeholderBuffer = await sharp(imageBuffer)
		.resize(25)
		.blur()
		.jpeg()
		.toBuffer();
	await writeFile(new URL(filename, stagedAssetDirectory), imageBuffer);
	return {
		...image,
		url: `/test-assets/${filename}`,
		placeholder: `data:image/jpg;base64,${placeholderBuffer.toString("base64")}`,
	};
}

function requireCapturedImage(
	image: ImageType,
	capturedImages: Map<string, ImageType>,
): ImageType {
	const captured = capturedImages.get(image.id);
	if (!captured) {
		throw new Error(`Missing captured image ${image.id}`);
	}
	return captured;
}

async function main(): Promise<void> {
	try {
		await recoverFixtureOutputs(fixtureOutputPaths);
		await Promise.all([
			rm(stagedAssetDirectory, { recursive: true, force: true }),
			rm(stagedOutputPath, { force: true }),
		]);
		await mkdir(stagedAssetDirectory, { recursive: true });

		const [projectRecords, aboutContent, socialMedia, albums] =
			await Promise.all([
				loadContentfulFixtureProjects(),
				getAboutContent(),
				getSocialMedia(),
				getAlbums(),
			]);
		const { authProjects, projectInfos, projects } = projectRecords;
		const { aboutData: about, backgroundImage, resumeUrl } = aboutContent;

		const uniqueImages = new Map<string, ImageType>();
		const addImage = (image: ImageType) => {
			const existing = uniqueImages.get(image.id);
			if (existing && existing.url !== image.url) {
				throw new Error(`Image ID ${image.id} refers to multiple URLs.`);
			}
			uniqueImages.set(image.id, image);
		};
		addImage(backgroundImage);
		addImage(about.profilePicture);
		for (const project of projects) {
			addImage(project.coverImage);
		}
		for (const projectInfo of projectInfos) {
			for (const image of getRichTextImages(projectInfo.description)) {
				addImage(image);
			}
		}
		for (const album of albums) {
			for (const photo of album.photos) {
				addImage(photo);
			}
		}

		const captureTasks = [...uniqueImages.values()].map(
			(image) => async () => captureImage(image),
		);
		const capturedImages = new Map(
			(await pAll(captureTasks, { concurrency: 8 })).map((image) => [
				image.id,
				image,
			]),
		);
		for (const projectInfo of projectInfos) {
			replaceRichTextImages(projectInfo.description, capturedImages);
		}

		const protectedSlugs = new Set(
			authProjects
				.filter((project) => project.password)
				.map((project) => project.slug),
		);
		const capturedProjects = projects.map((project) => ({
			...project,
			coverImage: requireCapturedImage(project.coverImage, capturedImages),
		}));
		const projectEntries = projectInfos.map((projectInfo) => [
			projectInfo.slug,
			{
				...projectInfo,
				coverImage: requireCapturedImage(
					projectInfo.coverImage,
					capturedImages,
				),
				password: protectedSlugs.has(projectInfo.slug)
					? "playwright-password"
					: undefined,
			},
		]);
		const fixture = {
			backgroundImage: requireCapturedImage(backgroundImage, capturedImages),
			socialMedia,
			about: {
				...about,
				profilePicture: requireCapturedImage(
					about.profilePicture,
					capturedImages,
				),
			},
			resumeUrl,
			projects: capturedProjects,
			projectInfo: Object.fromEntries(projectEntries),
			albums: albums.map((album) => ({
				...album,
				photos: album.photos.map((photo) =>
					requireCapturedImage(photo, capturedImages),
				),
			})),
		};
		await writeFile(
			stagedOutputPath,
			`${JSON.stringify(fixture, null, "\t")}\n`,
		);

		await replaceFixtureOutputs(fixtureOutputPaths);

		process.stdout.write(
			`Contentful fixture written with ${capturedImages.size} local visual assets.\n`,
		);
	} finally {
		await Promise.all([
			rm(stagedAssetDirectory, { recursive: true, force: true }),
			rm(stagedOutputPath, { force: true }),
		]);
	}
}

await withFixtureOutputLock(fixtureLockPath, main);

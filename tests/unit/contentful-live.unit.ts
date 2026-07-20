import { describe, expect, test } from "bun:test";
import type {
	ContentfulDeliveryClient,
	ContentSourceLoader,
} from "@/lib/content-source";
import { getAboutContentFromSource } from "@/lib/fetch-about-data";
import { getBackgroundImage, getSocialMedia } from "@/lib/fetch-home-data";
import {
	getAlbumFromSource,
	getAlbumsFromSource,
	getInitialPhotographyDataFromSource,
} from "@/lib/fetch-photos";
import {
	getProjectAuthorizationSnapshotFromSource,
	getProjectInfoFromSource,
	getProjectPageSnapshotFromSource,
	getProjectsFromSource,
} from "@/lib/fetch-projects";
import { fetchContentfulAuthProjects } from "@/lib/project-auth-source";

function entry(id: string, fields: Record<string, unknown>): unknown {
	return { sys: { id }, fields };
}

function collection(items: unknown[], total = items.length): unknown {
	return { items, total };
}

function imageAsset(
	id: string,
	url = `//images.ctfassets.net/space/${id}/version/image.jpg`,
	dimensions: { width: unknown; height: unknown } = {
		width: 800,
		height: 600,
	},
): unknown {
	return entry(id, {
		title: `${id} title`,
		description: `${id} description`,
		file: {
			url,
			details: { image: dimensions },
		},
	});
}

function fileAsset(id: string, url: string): unknown {
	return entry(id, {
		title: `${id} title`,
		description: `${id} description`,
		file: { url },
	});
}

function createFakeClient(
	responses: unknown[],
	assetResponse?: unknown,
): {
	assetRequests: string[];
	client: ContentfulDeliveryClient;
	queries: unknown[];
} {
	const pendingResponses = [...responses];
	const assetRequests: string[] = [];
	const queries: unknown[] = [];
	const client: ContentfulDeliveryClient = {
		async getEntries(query) {
			queries.push(query);
			if (pendingResponses.length === 0) {
				throw new Error("Fake Contentful client has no queued response.");
			}
			return pendingResponses.shift();
		},
		async getAsset(assetId) {
			assetRequests.push(assetId);
			return assetResponse ?? imageAsset(assetId);
		},
	};
	return { assetRequests, client, queries };
}

function liveSource(client: ContentfulDeliveryClient): ContentSourceLoader {
	return async () => ({ kind: "live", client });
}

function requireQuery(value: unknown): Record<string, unknown> {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new Error("Expected a Contentful query object.");
	}
	return Object.fromEntries(Object.entries(value));
}

describe("live Contentful contracts", () => {
	test("maps the about branch and limits its query", async () => {
		const { client, queries } = createFakeClient([
			collection([
				entry("about", {
					bio: "Hello from Contentful",
					location: "Los Angeles",
					email: "hello@example.com",
					profilePicture: imageAsset("profile"),
					background: imageAsset("background"),
					resume: fileAsset(
						"resume",
						"//assets.ctfassets.net/space/resume.pdf",
					),
				}),
			]),
		]);

		const content = await getAboutContentFromSource(liveSource(client));
		expect(content.aboutData.location).toBe("Los Angeles");
		expect(content.aboutData.profilePicture.id).toBe("profile");
		expect(content.backgroundImage.id).toBe("background");
		expect(content.resumeUrl).toBe(
			"https://assets.ctfassets.net/space/resume.pdf",
		);
		expect(requireQuery(queries[0])).toEqual({
			content_type: "about",
			limit: 1,
		});
	});

	test("rejects duplicate About singletons in full and background queries", async () => {
		const aboutEntry = entry("about", {
			bio: "Hello from Contentful",
			location: "Los Angeles",
			email: "hello@example.com",
			profilePicture: imageAsset("profile"),
			background: imageAsset("background"),
			resume: fileAsset("resume", "//assets.ctfassets.net/space/resume.pdf"),
		});
		const { client: aboutClient } = createFakeClient([
			collection([aboutEntry], 2),
		]);
		await expect(
			getAboutContentFromSource(liveSource(aboutClient)),
		).rejects.toThrow("did not return exactly one entry");

		const { client: backgroundClient } = createFakeClient([
			collection([aboutEntry], 2),
		]);
		await expect(
			getBackgroundImage(liveSource(backgroundClient)),
		).rejects.toThrow("did not return exactly one entry");
	});

	test("rejects unapproved ordinary image hosts in every live image branch", async () => {
		const badImage = imageAsset("bad", "https://example.com/bad.jpg");
		const badAboutFields = {
			bio: "About",
			location: "Los Angeles",
			email: "hello@example.com",
			profilePicture: imageAsset("profile"),
			background: imageAsset("background"),
			resume: fileAsset("resume", "//assets.ctfassets.net/space/resume.pdf"),
		};

		const { client: backgroundClient } = createFakeClient([
			collection([entry("about", { ...badAboutFields, background: badImage })]),
		]);
		await expect(
			getAboutContentFromSource(liveSource(backgroundClient)),
		).rejects.toThrow("approved HTTPS host");

		const { client: profileClient } = createFakeClient([
			collection([
				entry("about", { ...badAboutFields, profilePicture: badImage }),
			]),
		]);
		await expect(
			getAboutContentFromSource(liveSource(profileClient)),
		).rejects.toThrow("approved HTTPS host");

		const projectFields = {
			title: "Project",
			slug: "project",
			summary: "Summary",
			coverImage: badImage,
			projectType: ["Design"],
		};
		const { client: coverClient } = createFakeClient([
			collection([entry("project", projectFields)]),
		]);
		await expect(
			getProjectsFromSource(liveSource(coverClient)),
		).rejects.toThrow("approved HTTPS host");

		const { client: detailClient } = createFakeClient(
			[
				collection([
					entry("project", {
						...projectFields,
						coverImage: imageAsset("cover"),
						description:
							"![Detail](https://images.ctfassets.net/space/bad/version/image.jpg)",
					}),
				]),
			],
			badImage,
		);
		await expect(
			getProjectInfoFromSource("project", liveSource(detailClient)),
		).rejects.toThrow("approved HTTPS host");

		const { client: albumClient } = createFakeClient([
			collection([entry("album", { album: "Dance", photos: [badImage] })]),
		]);
		await expect(getAlbumsFromSource(liveSource(albumClient))).rejects.toThrow(
			"approved HTTPS host",
		);
	});

	test("requires positive safe-integer dimensions in every live image", async () => {
		for (const invalidDimension of [
			1.5,
			Number.MAX_SAFE_INTEGER + 1,
			Number.POSITIVE_INFINITY,
			0,
			-1,
		]) {
			for (const dimensions of [
				{ width: invalidDimension, height: 600 },
				{ width: 800, height: invalidDimension },
			]) {
				const { client } = createFakeClient([
					collection([
						entry("album", {
							album: "Dance",
							photos: [imageAsset("invalid-dimensions", undefined, dimensions)],
						}),
					]),
				]);
				await expect(getAlbumsFromSource(liveSource(client))).rejects.toThrow(
					"missing dimensions",
				);
			}
		}

		const { client } = createFakeClient([
			collection([
				entry("album", {
					album: "Dance",
					photos: [
						imageAsset("safe-dimensions", undefined, {
							width: Number.MAX_SAFE_INTEGER,
							height: Number.MAX_SAFE_INTEGER,
						}),
					],
				}),
			]),
		]);
		const [album] = await getAlbumsFromSource(liveSource(client));
		expect(album.photos[0]).toMatchObject({
			width: Number.MAX_SAFE_INTEGER,
			height: Number.MAX_SAFE_INTEGER,
		});
	});

	test("maps ordered project summaries with an explicit page limit", async () => {
		const { client, queries } = createFakeClient([
			collection(
				[
					entry("project-id", {
						title: "Project title",
						slug: "project-slug",
						summary: "Project summary",
						coverImage: imageAsset("cover"),
						projectType: ["Design"],
					}),
				],
				2,
			),
			collection(
				[
					entry("second-project", {
						title: "Second project",
						slug: "second-project",
						summary: "Second summary",
						coverImage: imageAsset("second-cover"),
						projectType: ["Film"],
					}),
				],
				2,
			),
		]);

		const projects = await getProjectsFromSource(liveSource(client));
		expect(projects).toEqual([
			expect.objectContaining({
				id: "project-id",
				slug: "project-slug",
				projectType: ["Design"],
			}),
			expect.objectContaining({
				id: "second-project",
				slug: "second-project",
				projectType: ["Film"],
			}),
		]);
		expect(requireQuery(queries[0])).toMatchObject({
			content_type: "project",
			limit: 1000,
			skip: 0,
			order: ["fields.order"],
		});
		expect(requireQuery(queries[1])).toMatchObject({ skip: 1 });
	});

	test("queries only authorization fields before project detail", async () => {
		const { client, queries } = createFakeClient([
			collection([
				entry("project-authorization", {
					slug: "project-detail",
					password: "protected",
				}),
			]),
		]);

		await expect(
			getProjectAuthorizationSnapshotFromSource(
				"project-detail",
				liveSource(client),
			),
		).resolves.toEqual({ password: "protected" });
		expect(requireQuery(queries[0])).toEqual({
			content_type: "project",
			"fields.slug": "project-detail",
			limit: 2,
			select: ["fields.slug", "fields.password"],
		});
	});

	test("filters post-release projects before mapping list details", async () => {
		const releasedProject = entry("released", {
			title: "Released project",
			slug: "released",
			summary: "Released summary",
			coverImage: imageAsset("released-cover"),
			projectType: ["Design"],
		});
		const postReleaseMalformedProject = entry("post-release", {
			slug: "post-release",
		});
		const { client } = createFakeClient([
			collection([releasedProject, postReleaseMalformedProject]),
		]);

		await expect(
			getProjectsFromSource(liveSource(client), (slug) => slug === "released"),
		).resolves.toEqual([
			expect.objectContaining({ id: "released", slug: "released" }),
		]);
	});

	test("rejects duplicate released project slugs", async () => {
		const projectFields = {
			title: "Project title",
			slug: "duplicate",
			summary: "Project summary",
			coverImage: imageAsset("cover"),
			projectType: ["Design"],
		};
		const { client } = createFakeClient([
			collection([
				entry("first-project", projectFields),
				entry("second-project", projectFields),
			]),
		]);

		await expect(getProjectsFromSource(liveSource(client))).rejects.toThrow(
			"Duplicate released project slug: duplicate",
		);
	});

	test("maps a live project detail with an isolated authorization snapshot", async () => {
		const { client, queries } = createFakeClient([
			collection([
				entry("project-detail", {
					title: "Project detail",
					slug: "project-detail",
					summary: "Detail summary",
					coverImage: imageAsset("detail-cover"),
					projectType: ["Interactive"],
					role: "Designer",
					description: "Project description",
					videoLink: "https://youtu.be/video-id",
					password: "must-not-map",
				}),
			]),
		]);

		const snapshot = await getProjectPageSnapshotFromSource(
			"project-detail",
			liveSource(client),
		);
		expect(snapshot.password).toBe("must-not-map");
		expect(snapshot.projectInfo).toMatchObject({
			id: "project-detail",
			slug: "project-detail",
			role: "Designer",
			videoLink: "https://www.youtube.com/embed/video-id",
		});
		expect(snapshot.projectInfo).not.toHaveProperty("password");
		expect(requireQuery(queries[0])).toEqual({
			content_type: "project",
			"fields.slug": "project-detail",
			include: 1,
			limit: 2,
			select: [
				"fields.title",
				"fields.slug",
				"fields.summary",
				"fields.coverImage",
				"fields.projectType",
				"fields.role",
				"fields.description",
				"fields.videoLink",
				"fields.password",
			],
		});
	});

	test("fails closed when exact project queries are not singular", async () => {
		const duplicateItems = [
			entry("first", { slug: "duplicate" }),
			entry("second", { slug: "duplicate" }),
		];
		const { client: authorizationClient } = createFakeClient([
			collection(duplicateItems),
		]);
		await expect(
			getProjectAuthorizationSnapshotFromSource(
				"duplicate",
				liveSource(authorizationClient),
			),
		).rejects.toThrow("did not return exactly one project");

		const { client: detailClient } = createFakeClient([
			collection(duplicateItems),
		]);
		await expect(
			getProjectInfoFromSource("duplicate", liveSource(detailClient)),
		).rejects.toThrow("did not return exactly one project");

		const { client: inexactClient } = createFakeClient([
			collection([entry("other", { slug: "other" })]),
		]);
		await expect(
			getProjectAuthorizationSnapshotFromSource(
				"requested",
				liveSource(inexactClient),
			),
		).rejects.toThrow("did not return exactly one project");
	});

	test("accepts Contentful download-host images in project markdown", async () => {
		const imageUrl =
			"https://downloads.contentful.com/space/download-image/version/image.gif";
		const { assetRequests, client } = createFakeClient(
			[
				collection([
					entry("project-detail", {
						title: "Project detail",
						slug: "project-detail",
						summary: "Detail summary",
						coverImage: imageAsset("detail-cover"),
						projectType: ["Interactive"],
						description: `![Downloaded animation](${imageUrl})`,
					}),
				]),
			],
			imageAsset(
				"download-image",
				"//downloads.ctfassets.net/space/download-image/version/image.gif",
			),
		);

		const project = await getProjectInfoFromSource(
			"project-detail",
			liveSource(client),
		);
		expect(assetRequests).toEqual(["download-image"]);
		expect(JSON.stringify(project.description)).toContain(
			"https://downloads.ctfassets.net/space/download-image/version/image.gif",
		);
	});

	test("shares one retryable asset loader within each project detail fetch", async () => {
		const imageUrl =
			"https://images.ctfassets.net/space/repeated-image/version/image.jpg";
		const { assetRequests, client } = createFakeClient(
			[
				collection([
					entry("project-detail", {
						title: "Project detail",
						slug: "project-detail",
						summary: "Detail summary",
						coverImage: imageAsset("detail-cover"),
						projectType: ["Interactive"],
						description: `![First](${imageUrl})\n\n![Second](${imageUrl})`,
					}),
				]),
			],
			imageAsset("repeated-image"),
		);

		await getProjectInfoFromSource("project-detail", liveSource(client));
		expect(assetRequests).toEqual(["repeated-image"]);
	});

	test("rejects malformed authorization in a project detail snapshot", async () => {
		const { client } = createFakeClient([
			collection([
				entry("project-detail", {
					title: "Project detail",
					slug: "project-detail",
					summary: "Detail summary",
					coverImage: imageAsset("detail-cover"),
					projectType: ["Interactive"],
					description: "Project description",
					password: 42,
				}),
			]),
		]);
		await expect(
			getProjectInfoFromSource("project-detail", liveSource(client)),
		).rejects.toThrow("malformed password field");
	});

	test("loads initial album names without formatting every album", async () => {
		const { client, queries } = createFakeClient([
			collection([
				entry("dance-name", { album: "Dance" }),
				entry("portraits-name", { album: "Portraits" }),
			]),
			collection([
				entry("dance", {
					album: "Dance",
					photos: [imageAsset("dance-photo")],
				}),
			]),
		]);

		const initial = await getInitialPhotographyDataFromSource(
			liveSource(client),
		);
		expect(initial.albumNames).toEqual(["Dance", "Portraits"]);
		expect(initial.initialAlbum).toMatchObject({
			name: "Dance",
			photos: [expect.objectContaining({ id: "dance-photo" })],
		});
		expect(requireQuery(queries[0])).toEqual({
			content_type: "photos",
			limit: 1000,
			order: ["fields.order"],
			select: ["fields.album"],
			skip: 0,
		});
		expect(requireQuery(queries[1])).toEqual({
			content_type: "photos",
			limit: 1,
			order: ["fields.order"],
		});
	});

	test("maps album lists and exact album queries", async () => {
		const albumEntry = entry("album", {
			album: "Portraits",
			photos: [imageAsset("portrait")],
		});
		const { client, queries } = createFakeClient([
			collection([albumEntry]),
			collection([albumEntry]),
		]);
		const source = liveSource(client);

		expect(await getAlbumsFromSource(source)).toEqual([
			expect.objectContaining({ name: "Portraits" }),
		]);
		expect(await getAlbumFromSource("Portraits", source)).toMatchObject({
			name: "Portraits",
			photos: [expect.objectContaining({ id: "portrait" })],
		});
		expect(requireQuery(queries[0])).toMatchObject({
			content_type: "photos",
			limit: 1000,
			skip: 0,
			order: ["fields.order"],
		});
		expect(requireQuery(queries[1])).toEqual({
			content_type: "photos",
			"fields.album": "Portraits",
			limit: 2,
		});
	});

	test("rejects malformed and duplicate album names in every live query", async () => {
		for (const albumName of ["", " Padded", "Padded ", "x".repeat(101)]) {
			const { client } = createFakeClient([
				collection([entry("bad-name", { album: albumName })]),
			]);
			await expect(getAlbumsFromSource(liveSource(client))).rejects.toThrow(
				"malformed album name",
			);
		}

		const duplicateFields = {
			album: "Dance",
			photos: [imageAsset("dance")],
		};
		const duplicateEntry = entry("duplicate", duplicateFields);
		const secondDuplicateEntry = entry("second-duplicate", duplicateFields);
		const { client: namesClient } = createFakeClient([
			collection([
				entry("first", { album: "Dance" }),
				entry("second", { album: "Dance" }),
			]),
			collection([duplicateEntry]),
		]);
		await expect(
			getInitialPhotographyDataFromSource(liveSource(namesClient)),
		).rejects.toThrow("Duplicate photography album name: Dance");

		const { client: listClient } = createFakeClient([
			collection([duplicateEntry, secondDuplicateEntry]),
		]);
		await expect(getAlbumsFromSource(liveSource(listClient))).rejects.toThrow(
			"Duplicate photography album name: Dance",
		);

		const { client: exactClient } = createFakeClient([
			collection([duplicateEntry, secondDuplicateEntry]),
		]);
		await expect(
			getAlbumFromSource("Dance", liveSource(exactClient)),
		).rejects.toThrow("Duplicate photography album name: Dance");
	});

	test("rejects inconsistent initial album names after shared validation", async () => {
		const { client } = createFakeClient([
			collection([entry("dance-name", { album: "Dance" })]),
			collection([
				entry("portraits", {
					album: "Portraits",
					photos: [imageAsset("portrait")],
				}),
			]),
		]);
		await expect(
			getInitialPhotographyDataFromSource(liveSource(client)),
		).rejects.toThrow("inconsistent albums");
	});

	test("maps social entries through the injected live client", async () => {
		const { client, queries } = createFakeClient([
			collection([
				entry("instagram-entry", {
					title: "instagram",
					link: "https://instagram.com/example",
				}),
				entry("linkedin-entry", {
					title: "linkedin",
					link: "https://www.linkedin.com/in/example/",
				}),
			]),
		]);

		expect(await getSocialMedia(liveSource(client))).toEqual([
			{
				id: "instagram-entry",
				title: "instagram",
				link: "https://instagram.com/example",
			},
			{
				id: "linkedin-entry",
				title: "linkedin",
				link: "https://www.linkedin.com/in/example/",
			},
		]);
		expect(requireQuery(queries[0])).toEqual({
			content_type: "socialMedia",
			limit: 1000,
			skip: 0,
		});
	});

	test("rejects live social links with mismatched hosts or unsafe URLs", async () => {
		for (const [title, link] of [
			["instagram", "https://linkedin.com/in/example"],
			["linkedin", "https://instagram.com/example"],
			["instagram", "http://instagram.com/example"],
			["linkedin", "https://user@linkedin.com/in/example"],
			["instagram", "https://instagram.com:8443/example"],
			["linkedin", "not-a-url"],
		]) {
			const { client } = createFakeClient([
				collection([entry("invalid-social", { title, link })]),
			]);
			await expect(getSocialMedia(liveSource(client))).rejects.toThrow(
				"Social media link",
			);
		}
	});

	test("paginates and maps project authorization fields", async () => {
		const { client, queries } = createFakeClient([
			collection([entry("first", { slug: "first", password: "secret" })], 2),
			collection([entry("second", { slug: "second" })], 2),
		]);

		expect(await fetchContentfulAuthProjects(client)).toEqual([
			{ slug: "first", password: "secret" },
			{ slug: "second", password: undefined },
		]);
		expect(requireQuery(queries[0])).toMatchObject({
			content_type: "project",
			limit: 1000,
			skip: 0,
			select: ["fields.slug", "fields.password"],
		});
		expect(requireQuery(queries[1])).toMatchObject({ skip: 1 });
	});

	test("rejects malformed project passwords instead of making them public", async () => {
		for (const password of [null, 42, {}, [], true]) {
			const { client } = createFakeClient([
				collection([entry("malformed", { slug: "malformed", password })]),
			]);
			await expect(fetchContentfulAuthProjects(client)).rejects.toThrow(
				"malformed password field",
			);
		}
	});

	test("permits absent and explicitly empty project passwords", async () => {
		const { client } = createFakeClient([
			collection([
				entry("absent", { slug: "absent" }),
				entry("empty", { slug: "empty", password: "" }),
			]),
		]);
		expect(await fetchContentfulAuthProjects(client)).toEqual([
			{ slug: "absent", password: undefined },
			{ slug: "empty", password: undefined },
		]);
	});

	test("rejects malformed collection responses in every live branch", async () => {
		const malformedResponse = { items: "not-an-array", total: 1 };
		for (const load of [
			async () => {
				const { client } = createFakeClient([malformedResponse]);
				await getAboutContentFromSource(liveSource(client));
			},
			async () => {
				const { client } = createFakeClient([malformedResponse]);
				await getProjectsFromSource(liveSource(client));
			},
			async () => {
				const { client } = createFakeClient([malformedResponse]);
				await getAlbumsFromSource(liveSource(client));
			},
			async () => {
				const { client } = createFakeClient([malformedResponse]);
				await getSocialMedia(liveSource(client));
			},
			async () => {
				const { client } = createFakeClient([malformedResponse]);
				await fetchContentfulAuthProjects(client);
			},
		]) {
			await expect(load()).rejects.toThrow("malformed Contentful response");
		}
	});

	test("rejects incomplete auth pagination instead of looping", async () => {
		const { client } = createFakeClient([collection([], 1)]);
		await expect(fetchContentfulAuthProjects(client)).rejects.toThrow(
			"incomplete page",
		);
	});
});

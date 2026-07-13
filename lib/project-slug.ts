type ProjectSlugQuery = {
	content_type: "project";
	"fields.slug": string;
	include: 1;
};

export function buildProjectSlugQuery(slug: string): ProjectSlugQuery {
	return {
		content_type: "project",
		"fields.slug": slug,
		include: 1,
	};
}

export function findProjectByExactSlug<
	ProjectEntry extends { fields: { slug?: unknown } },
>(items: ProjectEntry[], slug: string): ProjectEntry | undefined {
	return items.find((item) => String(item.fields.slug) === slug);
}

const CONTENTFUL_IMAGE_HOSTS = new Set([
	"downloads.contentful.com",
	"downloads.ctfassets.net",
	"images.contentful.com",
	"images.ctfassets.net",
]);

function parseStandardHttpsUrl(value: string): URL | undefined {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return undefined;
	}
	if (
		url.protocol !== "https:" ||
		url.username !== "" ||
		url.password !== "" ||
		url.port !== ""
	) {
		return undefined;
	}
	return url;
}

export function isContentfulImageUrl(value: string): boolean {
	const url = parseStandardHttpsUrl(value);
	return url !== undefined && CONTENTFUL_IMAGE_HOSTS.has(url.hostname);
}

export function isContentfulAssetUrl(value: string): boolean {
	const url = parseStandardHttpsUrl(value);
	return (
		url !== undefined &&
		(url.hostname === "ctfassets.net" ||
			url.hostname.endsWith(".ctfassets.net"))
	);
}

export function requireContentfulImageUrl(value: string): URL {
	if (!isContentfulImageUrl(value)) {
		throw new Error("Contentful images must use an approved HTTPS host.");
	}
	return new URL(value);
}

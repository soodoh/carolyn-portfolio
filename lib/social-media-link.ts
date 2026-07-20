import type { IconType } from "@/lib/types";

const SOCIAL_MEDIA_HOSTS: Record<IconType, string> = {
	instagram: "instagram.com",
	linkedin: "linkedin.com",
};

export function parseSocialMediaLink(icon: IconType, value: unknown): string {
	if (typeof value !== "string") {
		throw new Error(`Social media link for ${icon} is malformed.`);
	}

	let url: URL;
	try {
		url = new URL(value);
	} catch {
		throw new Error(`Social media link for ${icon} is malformed.`);
	}

	const expectedHost = SOCIAL_MEDIA_HOSTS[icon];
	if (
		url.protocol !== "https:" ||
		url.username !== "" ||
		url.password !== "" ||
		url.port !== "" ||
		(url.hostname !== expectedHost &&
			!url.hostname.endsWith(`.${expectedHost}`))
	) {
		throw new Error(`Social media link for ${icon} must use its HTTPS host.`);
	}

	return url.toString();
}

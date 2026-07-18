import manifest from "@/lib/project-auth-manifest.json";

const projectAuth = new Map(Object.entries(manifest));

export function getProjectAuth(slug: string) {
	return projectAuth.get(slug);
}

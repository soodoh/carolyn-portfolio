import { createFileRoute, redirect } from "@tanstack/react-router";
import { getResumePageUrl } from "@/lib/server-functions";

export const Route = createFileRoute("/resume")({
	loader: async () => {
		const resumeUrl = await getResumePageUrl();
		throw redirect({ href: resumeUrl, statusCode: 308 });
	},
});

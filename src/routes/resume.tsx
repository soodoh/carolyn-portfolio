import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getResumeUrl } from "@/lib/fetch-about-data";

const getResumePageUrl = createServerFn().handler(getResumeUrl);

export const Route = createFileRoute("/resume")({
	loader: async () => {
		const resumeUrl = await getResumePageUrl();
		throw redirect({ href: resumeUrl, statusCode: 308 });
	},
});

import { permanentRedirect } from "next/navigation";
import { getResumeUrl } from "@/lib/fetch-about-data";

// Statically generated at build time, will error if any Dynamic APIs are used
export const dynamic = "error";

export default async function Resume(): Promise<never> {
	const resumeUrl = await getResumeUrl();
	permanentRedirect(resumeUrl);
}

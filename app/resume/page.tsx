import { getResumeUrl } from "@/lib/fetch-about-data";
import { permanentRedirect } from "next/navigation";

// Statically generated at build time, will error if any Dynamic APIs are used
export const dynamic = "error";

export default async function Resume() {
  const resumeUrl = await getResumeUrl();
  permanentRedirect(resumeUrl);
}

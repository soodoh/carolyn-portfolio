import { getResumeUrl } from "@/lib/fetch-about-data";
import { permanentRedirect } from "next/navigation";

export default async function Resume() {
  const resumeUrl = await getResumeUrl();
  permanentRedirect(resumeUrl);
}

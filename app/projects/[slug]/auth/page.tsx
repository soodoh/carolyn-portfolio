import PasswordForm from "@/components/PasswordForm";
import { getProjects } from "@/lib/fetch-projects";
import manifest from "@/lib/project-auth-manifest.json";
import { Metadata } from "next";

export const dynamic = "error";

const protectedSlugs = new Set(Object.keys(manifest));

export const metadata: Metadata = {
  title: "CD Projects - Password Protected",
  robots: "noindex, nofollow",
};

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects
    .filter((p) => protectedSlugs.has(p.slug))
    .map((p) => ({ slug: p.slug }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PasswordForm slug={slug} />;
}

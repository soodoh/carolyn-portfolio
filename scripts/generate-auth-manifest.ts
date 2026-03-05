import { hash } from "bcryptjs";
import type { EntryFieldTypes, EntrySkeletonType } from "contentful";
import { createClient } from "contentful";
import { writeFile } from "node:fs/promises";

type AuthProjectSkeleton = EntrySkeletonType<
  {
    slug: EntryFieldTypes.Text;
    password: EntryFieldTypes.Text;
  },
  "project"
>;

const BCRYPT_ROUNDS = 10;

async function main(): Promise<void> {
  const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
  if (!space || !accessToken) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONTENTFUL_SPACE_ID or NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN",
    );
  }

  const client = createClient({ space, accessToken });
  const entries = await client.getEntries<AuthProjectSkeleton>({
    content_type: "project",
    select: ["fields.slug", "fields.password"],
  });

  const manifest: Record<string, string> = {};
  for (const item of entries.items) {
    const password = item.fields.password;
    if (password) {
      const slug = String(item.fields.slug);
      const passwordHash = await hash(String(password), BCRYPT_ROUNDS);
      manifest[slug] = passwordHash;
    }
  }

  const outPath = new URL("../lib/project-auth-manifest.json", import.meta.url);
  await writeFile(outPath.pathname, `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(
    `Auth manifest written with ${Object.keys(manifest).length} protected project(s)\n`,
  );
}

await main();

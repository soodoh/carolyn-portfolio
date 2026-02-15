import bcrypt from "bcryptjs";
import { createClient } from "contentful";

const BCRYPT_ROUNDS = 10;

async function main() {
  const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
  if (!space || !accessToken) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONTENTFUL_SPACE_ID or NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN",
    );
  }

  const client = createClient({ space, accessToken });
  const entries = await client.getEntries({
    content_type: "project",
    select: ["fields.slug", "fields.password"],
  });

  const manifest: Record<string, string> = {};
  for (const item of entries.items) {
    const password = item.fields.password;
    if (password) {
      const slug = String(item.fields.slug);
      const hash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
      manifest[slug] = hash;
    }
  }

  const outPath = new URL("../lib/project-auth-manifest.json", import.meta.url);
  await Bun.write(outPath.pathname, JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `Auth manifest written with ${Object.keys(manifest).length} protected project(s)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

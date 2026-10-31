import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function getPosts() {
  const dir = join(process.cwd(), "content/blog");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const posts = files.map((file) => {
    const raw = JSON.parse(readFileSync(join(dir, file), "utf8"));
    return {
      ...raw,
      slug: raw.slug || file.replace(/\.json$/, ""),
    };
  });
  return posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function getPost(slug) {
  return getPosts().find((p) => p.slug === slug) || null;
}

export function slugifyTitle(title) {
  return (
    String(title || "post")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "post"
  );
}

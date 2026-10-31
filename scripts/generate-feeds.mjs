#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPosts } from "../content/blog/index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = (process.env.SITE_URL || "https://sterno874.github.io/mckey").replace(/\/$/, "");
const posts = loadPosts();

function escapeXml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const staticPaths = [
  "",
  "/blog",
  "/blog/connect-trendhopper",
  "/install",
  "/docs",
  "/security",
  "/app",
];


const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MCKey Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Agent credentials, MCP security, and shipping without pasting secrets into AI chats.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${posts
  .map(
    (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${siteUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.description)}</description>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPaths
  .map(
    (path) => `  <url>
    <loc>${siteUrl}${path === "" ? "" : path}</loc>
    <changefreq>${path.startsWith("/blog") ? "weekly" : "monthly"}</changefreq>
  </url>`
  )
  .join("\n")}
${posts
  .map(
    (p) => `  <url>
    <loc>${siteUrl}/blog/${p.slug}</loc>
    <lastmod>${p.date}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "rss.xml"), rss);
writeFileSync(join(publicDir, "sitemap.xml"), sitemap);
console.log(`Wrote rss.xml + sitemap.xml (${posts.length} posts) → ${siteUrl}`);

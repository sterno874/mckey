import { createHmac, timingSafeEqual } from "node:crypto";
import { slugifyTitle } from "../../../lib/posts";

export const runtime = "nodejs";

function verifySignature(secret, rawBody, header) {
  if (!secret || !header) return false;
  const parts = Object.fromEntries(
    String(header)
      .split(",")
      .map((p) => p.trim().split("="))
      .filter((p) => p.length === 2)
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const age = Math.abs(Date.now() / 1000 - Number(t));
  if (!Number.isFinite(age) || age > 60 * 5) return false;
  const expected = createHmac("sha256", secret).update(`${t}.`).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
}

async function commitPostFile({ slug, post }) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || "sterno874/mckey";
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token) {
    return { committed: false, reason: "GITHUB_TOKEN not set — accepted in-memory only" };
  }

  const path = `content/blog/${slug}.json`;
  const content = Buffer.from(`${JSON.stringify(post, null, 2)}\n`).toString("base64");
  const api = `https://api.github.com/repos/${repo}/contents/${path}`;

  let sha;
  const existing = await fetch(api, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (existing.ok) {
    const body = await existing.json();
    sha = body.sha;
  }

  const res = await fetch(api, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message: sha ? `Update blog post: ${post.title}` : `Add blog post: ${post.title}`,
      content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub commit failed (${res.status}): ${text.slice(0, 400)}`);
  }

  return { committed: true, path };
}

export async function POST(request) {
  const secret = process.env.TRENDHOPPER_WEBHOOK_SECRET || "";
  const rawBody = Buffer.from(await request.arrayBuffer());
  const event = request.headers.get("x-trendhopper-event") || "";
  const signature = request.headers.get("x-trendhopper-signature") || "";

  if (secret && !verifySignature(secret, rawBody, signature)) {
    return Response.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const kind = event || payload.event || "";
  if (kind === "ping") {
    return Response.json({ ok: true, pong: true });
  }

  if (kind !== "post.published" && kind !== "post.updated" && payload.status !== "published") {
    return Response.json({ ok: true, ignored: true, event: kind });
  }

  const title = payload.title || "Untitled";
  const html = payload.content || payload.html || "";
  if (!html || String(html).trim().length < 10) {
    return Response.json({ ok: false, error: "empty_content" }, { status: 422 });
  }

  const slugBase = slugifyTitle(title);
  const slug = payload.id != null ? `${slugBase}-${payload.id}` : slugBase;
  const post = {
    slug,
    title,
    description: payload.meta_description || payload.description || title,
    date: new Date().toISOString().slice(0, 10),
    author: "Trendhopper",
    tags: ["trendhopper"],
    feature_image: payload.feature_image || null,
    source_id: payload.id ?? null,
    html,
  };

  try {
    const result = await commitPostFile({ slug, post });
    return Response.json({
      ok: true,
      slug,
      url: `/blog/${slug}`,
      ...result,
    });
  } catch (err) {
    return Response.json({ ok: false, error: String(err.message || err) }, { status: 502 });
  }
}

export async function GET() {
  return Response.json({
    ok: true,
    service: "mckey-trendhopper-webhook",
    expect: "POST with X-Trendhopper-Event + X-Trendhopper-Signature",
  });
}

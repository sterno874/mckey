import Link from "next/link";
import MarketingNav from "../../components/MarketingNav";
import MarketingFooter from "../../components/MarketingFooter";
import { getPosts } from "../../lib/posts";

const asset = (path) => `${process.env.PAGES_BASE_PATH || ""}${path}`;

export const metadata = {
  title: "Blog · MCKey",
  description: "Agent credentials, MCP security, and publishing from Trendhopper into MCKey.",
};

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-slate-900">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">Blog</p>
        <h1 className="mt-2 text-4xl font-bold">Shipping notes &amp; security writing</h1>
        <p className="mt-3 text-lg text-slate-600">
          Hook Trendhopper to this blog via webhook — or subscribe to{" "}
          <a className="font-semibold text-orange-600 underline" href={asset("/rss.xml")}>
            RSS
          </a>
          .
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/blog/connect-trendhopper" className="font-semibold text-slate-800 underline">
            Connect Trendhopper →
          </Link>
          <a href={asset("/sitemap.xml")} className="text-slate-600 underline">
            Sitemap
          </a>
        </div>

        <ul className="mt-12 space-y-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300"
              >
                <time className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {post.date}
                </time>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{post.title}</h2>
                <p className="mt-2 text-slate-600">{post.description}</p>
                {post.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <MarketingFooter />
    </div>
  );
}

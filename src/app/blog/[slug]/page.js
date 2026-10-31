import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingNav from "../../../components/MarketingNav";
import MarketingFooter from "../../../components/MarketingFooter";
import { getPost, getPosts } from "../../../lib/posts";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const post = getPost(params.slug);
  if (!post) return { title: "Post · MCKey" };
  return {
    title: `${post.title} · MCKey`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default function BlogPostPage({ params }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-slate-900">
      <MarketingNav />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link href="/blog" className="text-sm font-semibold text-orange-600 hover:underline">
          ← Blog
        </Link>
        <time className="mt-6 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {post.date}
          {post.author ? ` · ${post.author}` : ""}
        </time>
        <h1 className="mt-3 text-4xl font-bold leading-tight">{post.title}</h1>
        <p className="mt-4 text-lg text-slate-600">{post.description}</p>
        {post.feature_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.feature_image}
            alt=""
            className="mt-8 w-full rounded-2xl border border-slate-200"
          />
        ) : null}
        <div
          className="blog-prose mt-10 space-y-4 text-base leading-relaxed text-slate-900 [&_a]:font-semibold [&_a]:text-orange-700 [&_a]:underline [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:space-y-1"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
      <MarketingFooter />
    </div>
  );
}

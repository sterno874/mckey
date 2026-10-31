import Link from "next/link";
import MarketingNav from "../../../components/MarketingNav";
import MarketingFooter from "../../../components/MarketingFooter";

export const metadata = {
  title: "Connect Trendhopper · MCKey Blog",
  description: "Point Trendhopper’s webhook at MCKey to publish posts into /blog with RSS and sitemap.",
};

export default function ConnectTrendhopperPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-slate-900">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link href="/blog" className="text-sm font-semibold text-orange-600 hover:underline">
          ← Blog
        </Link>
        <h1 className="mt-6 text-4xl font-bold">Connect Trendhopper</h1>
        <p className="mt-4 text-lg text-slate-600">
          MCKey accepts Trendhopper&apos;s signed webhook publish events and turns them into posts under{" "}
          <code className="rounded bg-slate-100 px-1">content/blog/</code>. RSS + sitemap regenerate on
          deploy.
        </p>

        <ol className="mt-10 list-decimal space-y-4 pl-5 text-slate-800">
          <li>
            <strong>Host the API on Vercel</strong> (GitHub Pages is static — no POST). Import{" "}
            <code className="rounded bg-slate-100 px-1">sterno874/mckey</code> or claim a deploy.
          </li>
          <li>
            In Trendhopper → <strong>Integrations → Webhook</strong>, set:
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">
              {`https://YOUR_VERCEL_DOMAIN/api/trendhopper`}
            </pre>
          </li>
          <li>
            Copy the webhook signing secret into Vercel env:
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">
              {`TRENDHOPPER_WEBHOOK_SECRET=…`}
            </pre>
          </li>
          <li>
            To auto-commit posts into git (so Pages + Vercel rebuild):
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">
              {`GITHUB_TOKEN=ghp_…   # contents:write on sterno874/mckey
GITHUB_REPO=sterno874/mckey
GITHUB_BRANCH=main`}
            </pre>
          </li>
          <li>
            Hit <strong>Test connection</strong> in Trendhopper (<code>ping</code> → HTTP 200), then publish a
            draft.
          </li>
        </ol>

        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p className="font-semibold">Feeds for SEO / discovery</p>
          <p className="mt-1">
            After publish + deploy:{" "}
            <a className="font-semibold underline" href="/rss.xml">
              /rss.xml
            </a>{" "}
            and{" "}
            <a className="font-semibold underline" href="/sitemap.xml">
              /sitemap.xml
            </a>
            . Point Search Console / Trendhopper site URL at the marketing origin.
          </p>
        </div>

        <Link href="/blog/connect-trendhopper-to-mckey" className="btn-primary mt-10">
          Read the full guide
        </Link>
      </main>
      <MarketingFooter />
    </div>
  );
}

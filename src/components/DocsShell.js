import Link from "next/link";
import MarketingNav from "./MarketingNav";
import MarketingFooter from "./MarketingFooter";

const NAV = [
  { href: "/docs", label: "Technical overview" },
  { href: "/security", label: "Security whitepaper" },
  { href: "/install", label: "Install (Cursor / Claude)" },
  { href: "/#pricing", label: "Pricing" },
];

// href="/#pricing" works with Next basePath via Link below


export default function DocsShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-slate-900">
      <MarketingNav />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[220px_1fr] sm:px-6">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">Docs</p>
          <nav className="mt-4 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/app"
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-900"
            >
              How it works
            </Link>
          </nav>
        </aside>
        <article className="min-w-0">
          <header className="border-b border-slate-200 pb-8">
            <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-3 max-w-2xl text-lg text-slate-600">{subtitle}</p> : null}
          </header>
          <div className="prose-mckey mt-10 space-y-8 text-slate-700">{children}</div>
        </article>
      </div>
      <MarketingFooter />
    </div>
  );
}

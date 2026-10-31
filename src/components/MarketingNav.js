import Link from "next/link";

export default function MarketingNav() {
  return (
    <header className="relative z-20 border-b border-line/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            MC
          </span>
          <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight">
            MCKey
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
          <Link href="/blog" className="hover:text-slate-900">
            Blog
          </Link>
          <Link href="/install" className="hover:text-slate-900">
            Install
          </Link>
          <Link href="/#pricing" className="hover:text-slate-900">
            Pricing
          </Link>
          <Link href="/app" className="hover:text-slate-900">
            How it works
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/#pricing" className="btn-secondary !px-4 !py-2 text-sm">
            Pricing
          </Link>
          <Link href="/install" className="btn-primary !px-4 !py-2 text-sm">
            Install free
          </Link>
        </div>
      </div>
    </header>
  );
}

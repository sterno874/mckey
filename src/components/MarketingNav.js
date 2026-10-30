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
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
          <a href="#how" className="hover:text-slate-900">
            How it works
          </a>
          <a href="#intercept" className="hover:text-slate-900">
            Intercept
          </a>
          <a href="#prototype" className="hover:text-slate-900">
            Prototype
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/app" className="btn-secondary !px-4 !py-2 text-sm">
            Open prototype
          </Link>
          <a href="#waitlist" className="btn-primary !px-4 !py-2 text-sm">
            Join waitlist
          </a>
        </div>
      </div>
    </header>
  );
}

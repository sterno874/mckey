import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
            MC
          </span>
          <div>
            <div className="font-[family-name:var(--font-display)] font-bold">MCKey</div>
            <div className="text-sm text-slate-500">Paste into the vault, never the agent</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-slate-600">
          <Link href="/install" className="hover:text-slate-900">
            Install
          </Link>
          <Link href="/docs" className="hover:text-slate-900">
            Docs
          </Link>
          <Link href="/security" className="hover:text-slate-900">
            Security
          </Link>
          <Link href="/app" className="hover:text-slate-900">
            How it works
          </Link>
          <a href="mailto:hello@mckey.io" className="hover:text-slate-900">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

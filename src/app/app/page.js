import Link from "next/link";
import Prototype from "../../components/Prototype";

export const metadata = {
  title: "Prototype · MCKey",
  description:
    "Paste into the vault, intercept secrets in fake agent chat, issue an MCKey, watch gateway injection.",
};

export default function AppPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
              MC
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold">MCKey</span>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
              prototype
            </span>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Marketing site
          </Link>
        </div>
      </header>
      <Prototype />
    </div>
  );
}

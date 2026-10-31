"use client";

export default function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-orange-400/20 via-pink-400/10 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Cursor · agent chat
          </div>
          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-orange-700">
            intercepted
          </span>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
              Before · what people do today
            </p>
            <p className="mt-2 font-mono text-sm leading-relaxed text-slate-900">
              here&apos;s the stripe key{" "}
              <span className="rounded bg-rose-100 px-1.5 py-0.5 font-semibold text-rose-950 line-through decoration-rose-700 decoration-2">
                sk_live_51Hq…
              </span>{" "}
              set up webhooks
            </p>
          </div>

          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
              After · MCKey
            </p>
            <p className="mt-2 font-mono text-sm leading-relaxed text-slate-900">
              set up stripe webhooks with{" "}
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-950">
                mckey://stripe
              </span>
            </p>
            <p className="mt-2 text-xs font-medium text-emerald-900">
              Secret sealed in vault · agent never saw the key · gateway injects on tool call
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Vault
              </p>
              <p className="mt-2 font-mono text-sm text-slate-900">STRIPE_SECRET_KEY</p>
              <p className="font-mono text-xs text-slate-500">sk_live_••••7f3c · sealed</p>
            </div>
            <div className="rounded-xl bg-slate-900 px-3 py-3 text-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Tool call
              </p>
              <p className="mt-2 font-mono text-sm text-orange-300">stripe.create_webhook</p>
              <p className="mt-1 text-xs text-slate-400">ALLOW · injected once · not in prompt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

const TOOLS = [
  { name: "github.create_issue", allow: true },
  { name: "stripe.refund", allow: false },
  { name: "notion.write_page", allow: true },
  { name: "slack.post_message", allow: true },
];

export default function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-orange-400/20 via-pink-400/10 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            agent · research-bot
          </div>
          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            live
          </span>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Issued MCKey
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-sm text-slate-800">
              mck_live_••••••••7f3c
            </div>
            <p className="mt-2 text-xs text-slate-500">Expires in 14m · 3 tools allowed</p>

            <div className="mt-5 space-y-2">
              {TOOLS.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
                >
                  <span className="font-mono text-slate-700">{tool.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      tool.allow ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {tool.allow ? "allow" : "deny"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 p-4 text-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vault</p>
            <div className="mt-3 space-y-3">
              {[
                ["GITHUB_TOKEN", "never leaves vault"],
                ["STRIPE_SECRET", "never leaves vault"],
                ["NOTION_KEY", "never leaves vault"],
              ].map(([k, note]) => (
                <div key={k}>
                  <div className="font-mono text-sm text-orange-300">{k}</div>
                  <div className="text-xs text-slate-400">{note}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-slate-300">
              Agent receives a short-lived MCKey. Master secrets stay sealed. Every tool call is
              checked against the allowlist.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

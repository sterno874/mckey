import Link from "next/link";

const TIERS = [
  {
    id: "free",
    name: "Local",
    price: "$0",
    period: "forever",
    blurb: "Stop pasting keys on your laptop. Open-source MCP vault.",
    cta: "Install free",
    href: "/install",
    featured: false,
    features: [
      "Local AES-256-GCM vault (~/.mckey)",
      "Cursor + Claude Code MCP gateway",
      "http_request injection + redaction",
      "Issue / revoke MCKeys on-box",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/mo",
    blurb: "Hosted vault for one builder who works across machines.",
    cta: "Join Pro waitlist",
    href: "/#waitlist",
    featured: false,
    features: [
      "Everything in Local",
      "Hosted vault sync (laptop ↔ CI)",
      "Web dashboard + audit history (90 days)",
      "Rotation reminders",
      "Email support",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "$39",
    period: "/seat/mo",
    note: "$29/seat billed yearly",
    blurb: "Shared agent credentials for the whole eng org — where we make money.",
    cta: "Join Team waitlist",
    href: "/#waitlist",
    featured: true,
    features: [
      "Everything in Pro",
      "Shared vault + per-agent MCKeys",
      "Allowlists, TTL, admin revoke",
      "Audit export (SIEM-ready JSON)",
      "1,000 agent tool calls / seat / day incl.",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    blurb: "SSO, private gateway, and the paperwork security asks for.",
    cta: "Talk to us",
    href: "mailto:hello@mckey.io?subject=MCKey%20Enterprise",
    featured: false,
    features: [
      "Everything in Team",
      "SAML SSO + SCIM",
      "Private / VPC gateway",
      "Custom retention & DPA",
      "Dedicated success + SLA",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="border-y border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">Pricing</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Local free. Hosted when the team shows up.</h2>
          <p className="mt-3 text-lg text-slate-600">
            We don&apos;t tax curiosity. Charge for sync, seats, and agent controls — not for every
            tool call on your laptop.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                tier.featured
                  ? "border-orange-300 bg-slate-900 text-white shadow-xl shadow-orange-500/10 lg:-mt-2 lg:mb-0"
                  : "border-slate-200 bg-slate-50 text-slate-900"
              }`}
            >
              {tier.featured ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  Most teams
                </span>
              ) : null}
              <div className={`text-sm font-semibold ${tier.featured ? "text-orange-300" : "text-slate-500"}`}>
                {tier.name}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
                  {tier.price}
                </span>
                {tier.period ? (
                  <span className={`text-sm ${tier.featured ? "text-slate-400" : "text-slate-500"}`}>
                    {tier.period}
                  </span>
                ) : null}
              </div>
              {tier.note ? (
                <p className={`mt-1 text-xs ${tier.featured ? "text-slate-400" : "text-slate-500"}`}>
                  {tier.note}
                </p>
              ) : (
                <p className="mt-1 text-xs opacity-0">.</p>
              )}
              <p className={`mt-4 text-sm leading-relaxed ${tier.featured ? "text-slate-300" : "text-slate-600"}`}>
                {tier.blurb}
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        tier.featured ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      ✓
                    </span>
                    <span className={tier.featured ? "text-slate-200" : "text-slate-700"}>{f}</span>
                  </li>
                ))}
              </ul>
              {tier.href.startsWith("mailto:") ? (
                <a
                  href={tier.href}
                  className={`mt-6 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    tier.featured
                      ? "bg-white text-slate-900"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {tier.cta}
                </a>
              ) : (
                <Link
                  href={tier.href}
                  className={`mt-6 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    tier.featured
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                      : tier.id === "free"
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 bg-white text-slate-900"
                  }`}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-900">How we price (and how we don&apos;t)</p>
          <p className="mt-2">
            Free Local forever — that&apos;s the habit loop. Pro is for one person who needs hosted sync
            ($19 sits under typical AI IDE spend). Team is the business: shared agent credentials at{" "}
            <strong className="text-slate-900">$39/seat/mo</strong> ($29 yearly) — closer to workflow tools
            than commodity password managers, because you&apos;re buying revoke, allowlists, and audit for
            agents, not just encrypted storage. We include a generous tool-call allowance on Team; we
            don&apos;t nickel-and-dime every <code className="rounded bg-white px-1">http_request</code> on
            your laptop.
          </p>
        </div>
      </div>
    </section>
  );
}

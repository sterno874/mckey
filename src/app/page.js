import Link from "next/link";
import MarketingNav from "../components/MarketingNav";
import MarketingFooter from "../components/MarketingFooter";
import HeroPreview from "../components/HeroPreview";

const STEPS = [
  {
    n: "01",
    title: "Paste into the vault — once",
    body: "Drop the Stripe, GitHub, or Notion key into MCKey. Naming is automatic when we recognize the shape. That’s the only paste that should ever happen.",
  },
  {
    n: "02",
    title: "Agent gets a handle, not the key",
    body: "Wire Cursor to the MCKey MCP gateway. The agent calls stripe.* tools with mckey://stripe. The model never sees sk_live_.",
  },
  {
    n: "03",
    title: "Gateway injects on the call",
    body: "When the tool runs, MCKey injects the real secret server-side, checks the allowlist, and logs it. No rotate-because-of-chat loop.",
  },
];

const FAQS = [
  {
    q: "Is chat intercept fully safe?",
    a: "No — and we’ll say so in-product. Intercept only helps if we catch the key before it hits the model. It’s better than pasting raw secrets to the AI, but it’s optional (toggle off anytime). The secure path is still vault → handle → gateway inject. If a key already went to the model, rotate it.",
  },
  {
    q: "Can I turn intercept off?",
    a: "Yes. Chat intercept is a toggleable safety net for the paste reflex. Some teams want it on by default; others prefer vault-only and will disable it.",
  },
  {
    q: "Does the agent ever see my Stripe or GitHub key?",
    a: "No. Master credentials stay in the vault. The agent only ever holds an MCKey / mckey:// handle. Injection happens on the tool call, outside the model context.",
  },
  {
    q: "Is this another secrets manager?",
    a: "It stores secrets, but the job is agent credentials: paste once, issue a scoped MCKey, inject on MCP calls. Less ceremony than enterprise vaults, built for builders moving fast.",
  },
  {
    q: "What is MCP?",
    a: "Model Context Protocol — how Cursor, Claude, and other clients connect tools. MCKey sits in front as the gateway that holds keys and enforces scope.",
  },
  {
    q: "Does this work in Cursor / Claude Code?",
    a: "Yes for the real path: local MCP gateway over stdio. npx mckey cursor-config --write / mckey claude-config. Chat intercept is optional and Cursor-shaped; Claude Code should seal via CLI. Read the security whitepaper for what’s safe vs at risk.",
  },
  {
    q: "Is this production-ready?",
    a: "v0.1 local vault + MCP is usable for test keys and careful workflows. Read /security before production secrets. Hosted multi-tenant gateway is later.",
  },
];


export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-slate-900">
      <MarketingNav />

      <main>
        <section className="relative overflow-hidden">
          <div className="hero-grid pointer-events-none absolute inset-0" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <div className="fade-up space-y-6 text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  New
                </span>
                Stop pasting keys into agents
              </p>
              <h1 className="text-4xl font-bold leading-[1.05] text-slate-900 sm:text-5xl lg:text-6xl">
                Paste secrets into{" "}
                <span className="gradient-text">MCKey</span>
                <span className="block mt-2">never into the agent.</span>
              </h1>
              <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-700 lg:mx-0">
                Builders dump API keys into chat because it&apos;s the fastest way to ship — then the
                agent says rotate. MCKey makes the safe path just as fast: vault once, give the
                agent a handle, inject on the tool call.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/install" className="btn-primary w-full sm:w-auto">
                  Install for Cursor / Claude
                  <span aria-hidden>→</span>
                </Link>
                <Link href="/security" className="btn-secondary w-full sm:w-auto">
                  Security whitepaper
                </Link>
              </div>
              <p className="text-sm text-slate-500">
                Real local MCP gateway + vault. Open source. Test keys first.
              </p>
            </div>
            <div className="fade-up" style={{ animationDelay: "120ms" }}>
              <HeroPreview />
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-slate-900 text-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-orange-300">
              The pain
            </p>
            <h2 className="mx-auto mt-3 max-w-3xl text-center text-2xl font-bold leading-snug sm:text-3xl">
              You&apos;re spinning up integrations. The agent needs Stripe. You paste the key.
              It works. It also means the model saw your secret — so now you should rotate.
              Again.
            </h2>
          </div>
        </section>

        <section id="how" className="border-b border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">As fast as pasting. Actually safe.</h2>
              <p className="mt-3 text-lg text-slate-600">
                Gateway first. Paste-intercept as the backup when someone forgets.
              </p>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.n} className="relative">
                  <div className="font-[family-name:var(--font-display)] text-sm font-bold tracking-widest text-orange-500">
                    {step.n}
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="intercept" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
                Optional safety net
              </p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                Chat intercept — on by default, toggle anytime.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                If a key-shaped string hits the agent input, MCKey can catch it before send, seal it
                in the vault, and rewrite to a handle. Turn it off if you only want vault + gateway.
              </p>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-relaxed text-amber-950">
                <p className="font-semibold">Not a guarantee — better than sharing with the AI.</p>
                <p className="mt-1 text-amber-900/90">
                  Intercept only helps if we stop the key <em>before</em> it reaches the model.
                  It won&apos;t un-expose a secret that already shipped in a prompt. Prefer paste into
                  the vault. If something slipped through, rotate.
                </p>
              </div>
              <ul className="mt-6 space-y-3 text-slate-700">
                {[
                  "Toggle intercept on/off per workspace",
                  "Detect sk_live_, ghp_, xoxb-, AIza… before send",
                  "Confirm → vault + mckey:// rewrite (or send raw anyway)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Chat secret intercept</div>
                  <div className="text-xs text-slate-500">Catch key pastes before the model sees them</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">On</span>
                  <span className="relative h-7 w-12 rounded-full bg-emerald-600">
                    <span className="absolute right-1 top-1 h-5 w-5 rounded-full bg-white shadow" />
                  </span>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-xl">
                <pre className="overflow-x-auto text-sm leading-relaxed text-slate-300">
{`# You paste into agent:
"use sk_live_51Hq…"

# Intercept (if enabled) rewrites:
"use mckey://stripe"

# Already sent to the model?
# → rotate. Intercept can't rewind.`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section id="docs" className="border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">Whitepapers & technical detail</h2>
              <p className="mt-3 text-lg text-slate-600">
                What&apos;s safe, what&apos;s still at risk, and how to install the real MCP gateway.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  href: "/security",
                  title: "Security whitepaper",
                  body: "Threat model, safe vs at-risk surfaces, intercept caveats, recommendations.",
                },
                {
                  href: "/docs",
                  title: "Technical overview",
                  body: "Vault crypto, MCP tools, what the model can see, trust boundaries.",
                },
                {
                  href: "/install",
                  title: "Install guide",
                  body: "Cursor mcp.json, Claude Code config, seal/issue CLI, agent instructions.",
                },
              ].map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-orange-300 hover:bg-white"
                >
                  <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-slate-600">{card.body}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-orange-600">Read →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">How it works + real CLI</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Click through vault, intercept, and inject in the browser — or run the real vault locally:{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">npx mckey init</code> then wire
                Cursor / Claude Code.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/install" className="btn-primary">
                  Install MCP
                </Link>
                <Link href="/app" className="btn-secondary">
                  How it works
                </Link>
              </div>
            </div>
            <div className="space-y-3 text-slate-700">
              {[
                "AES-256-GCM vault in ~/.mckey",
                "MCP tools: vault_list, vault_seal, http_request",
                "Optional MCKey allowlists + TTL + revoke",
                "Toggleable intercept preference (not a guarantee)",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                    →
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-[var(--bg)]">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
            <h2 className="text-center text-3xl font-bold sm:text-4xl">FAQ</h2>
            <div className="mt-10 divide-y divide-slate-200">
              {FAQS.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="cursor-pointer list-none font-[family-name:var(--font-display)] text-lg font-semibold text-slate-900 marker:content-none">
                    <span className="flex items-center justify-between gap-4">
                      {item.q}
                      <span className="text-slate-400 transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="waitlist" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600" />
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center text-white sm:px-6">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Make the safe way as fast as pasting.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
              Waitlist for hosted MCKey + Cursor install. We&apos;ll email when the gateway is ready.
            </p>
            <form
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              action="mailto:hello@mckey.io"
              method="get"
            >
              <input type="hidden" name="subject" value="MCKey waitlist" />
              <input
                type="email"
                name="body"
                required
                placeholder="you@company.com"
                className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-900 outline-none ring-2 ring-transparent focus:ring-white/60"
              />
              <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white">
                Join
              </button>
            </form>
            <Link
              href="/app"
              className="mt-6 inline-flex rounded-2xl border-2 border-white px-5 py-3 font-semibold text-white hover:bg-white/10"
            >
              How it works
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

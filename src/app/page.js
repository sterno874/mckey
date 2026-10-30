import Link from "next/link";
import MarketingNav from "../components/MarketingNav";
import MarketingFooter from "../components/MarketingFooter";
import HeroPreview from "../components/HeroPreview";

const STEPS = [
  {
    n: "01",
    title: "Store the real secrets",
    body: "Drop API keys into MCKey once. Agents never see them — not in prompts, logs, or MCP configs.",
  },
  {
    n: "02",
    title: "Pick tools per agent",
    body: "Allowlist the MCP tools each agent may call. Everything else is denied by default.",
  },
  {
    n: "03",
    title: "Issue an MCKey",
    body: "Hand the agent a short-lived, scoped key. When it expires or you revoke it, access stops.",
  },
];

const FAQS = [
  {
    q: "Is this another secrets manager?",
    a: "Partly. MCKey stores secrets, but the product is the issued key: scoped to tools, timed to expire, and checked on every MCP call.",
  },
  {
    q: "Do agents get my GitHub or Stripe credentials?",
    a: "No. Master credentials stay in the vault. Agents receive an MCKey that can only reach the tools you allowed.",
  },
  {
    q: "What is MCP?",
    a: "Model Context Protocol — how AI clients like Cursor and Claude connect to tools. MCKey sits in front of those tool servers.",
  },
  {
    q: "Is this production-ready?",
    a: "This is an early prototype for the waitlist. The vault UI works in-browser so you can feel the flow; the hosted gateway is next.",
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
                MCP-native agent credentials
              </p>
              <h1 className="text-4xl font-bold leading-[1.05] text-slate-900 sm:text-5xl lg:text-6xl">
                Give agents an{" "}
                <span className="gradient-text">MCKey</span>
                <span className="block mt-2">not your real secrets.</span>
              </h1>
              <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-700 lg:mx-0">
                MCKey is the simple vault for AI agents. Issue short-lived, scoped keys for MCP
                tools — so Cursor, Claude, and your bots never hold the master credentials.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/app" className="btn-primary w-full sm:w-auto">
                  Try the prototype
                  <span aria-hidden>→</span>
                </Link>
                <a href="#waitlist" className="btn-secondary w-full sm:w-auto">
                  Join the waitlist
                </a>
              </div>
              <p className="text-sm text-slate-500">No install. Browser prototype. Free while we build.</p>
            </div>
            <div className="fade-up" style={{ animationDelay: "120ms" }}>
              <HeroPreview />
            </div>
          </div>
        </section>

        <section id="how" className="border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">Three steps. Same idea as a keycard.</h2>
              <p className="mt-3 text-lg text-slate-600">
                Inspired by how simple products should feel — one job, obvious controls, nothing to
                configure until you need it.
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

        <section id="prototype" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Open the prototype.</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Create an agent, store a fake secret, allow a few tools, and mint an MCKey. It runs
                entirely in your browser — enough to feel the product before the hosted gateway
                ships.
              </p>
              <ul className="mt-6 space-y-3 text-slate-700">
                {[
                  "Per-agent tool allowlists",
                  "Masked vault secrets",
                  "Expiring MCKeys with revoke",
                  "Audit trail of grant / deny decisions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/app" className="btn-primary mt-8">
                Launch prototype
              </Link>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-xl">
              <pre className="overflow-x-auto text-sm leading-relaxed text-slate-300">
{`# Agent config points at MCKey — not Stripe
MCP_GATEWAY=https://gateway.mckey.io
MCKEY=mck_live_7f3c...

# Vault still holds:
# STRIPE_SECRET_KEY=sk_live_...
# GITHUB_TOKEN=ghp_...`}
              </pre>
              <p className="mt-4 text-sm text-slate-400">
                The agent authenticates with an MCKey. The gateway injects real secrets only for
                allowed tool calls.
              </p>
            </div>
          </div>
        </section>

        <section id="faq" className="border-y border-line bg-white">
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
            <h2 className="text-3xl font-bold sm:text-4xl">Stop pasting keys into agents.</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
              Join the waitlist for hosted MCKey. We&apos;ll email when the gateway is ready — no
              spam, just ship notes.
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
            <p className="mt-4 text-sm text-white/80">Or explore the prototype while you wait.</p>
            <Link
              href="/app"
              className="mt-4 inline-flex rounded-2xl border-2 border-white px-5 py-3 font-semibold text-white hover:bg-white/10"
            >
              Open prototype
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

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
    q: "Why not just intercept pastes into the agent?",
    a: "We do that as a safety net — if someone still pastes a key into chat, MCKey can catch it and swap in a handle. But the real fix is making paste-into-chat unnecessary: tools get credentials at the gateway.",
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
    q: "Is this production-ready?",
    a: "This is an early prototype. Try the paste → vault → intercept → inject flow in-browser. Hosted gateway + Cursor install comes next.",
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
                <Link href="/app" className="btn-primary w-full sm:w-auto">
                  Try paste → vault → inject
                  <span aria-hidden>→</span>
                </Link>
                <a href="#waitlist" className="btn-secondary w-full sm:w-auto">
                  Join the waitlist
                </a>
              </div>
              <p className="text-sm text-slate-500">
                Browser prototype. Intercept demo included. Free while we build.
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
                Safety net
              </p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                Still paste into chat? We catch it.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                If a key-shaped string hits the agent input, MCKey can intercept, seal it in the
                vault, and rewrite the message to a handle. Primary path should make that rare —
                intercept is for the days you&apos;re moving too fast.
              </p>
              <ul className="mt-6 space-y-3 text-slate-700">
                {[
                  "Detect sk_live_, ghp_, xoxb-, AIza… shapes on paste",
                  "One confirm → vaulted + swapped to mckey://…",
                  "Agent prompt never contains the raw secret",
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
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-xl">
              <pre className="overflow-x-auto text-sm leading-relaxed text-slate-300">
{`# You type / paste into agent:
"use sk_live_51Hq…"

# MCKey rewrites before send:
"use mckey://stripe"

# Gateway on stripe.create_webhook:
Authorization: Bearer sk_live_51Hq…
# ↑ injected here — never in the model`}
              </pre>
            </div>
          </div>
        </section>

        <section id="prototype" className="border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">Feel it in the prototype.</h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  Quick-paste a fake key into the vault, try dumping one into the fake agent chat
                  (we&apos;ll intercept), then run a tool call and watch injection — without the
                  secret ever sitting in the prompt.
                </p>
                <Link href="/app" className="btn-primary mt-8">
                  Launch prototype
                </Link>
              </div>
              <div className="space-y-3 text-slate-700">
                {[
                  "One-field vault paste with auto-naming",
                  "Chat intercept demo (paste a key-looking string)",
                  "mckey:// handles instead of raw secrets",
                  "Allow / deny + inject audit trail",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                      →
                    </span>
                    {item}
                  </div>
                ))}
              </div>
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
              Open prototype
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

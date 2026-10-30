import DocsShell from "../../components/DocsShell";

export const metadata = {
  title: "Security whitepaper · MCKey",
  description:
    "Threat model for MCKey: what is safe, what remains at risk, and how vault + MCP injection helps versus pasting secrets into AI chats.",
};

function Callout({ tone = "amber", title, children }) {
  const styles =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : tone === "rose"
        ? "border-rose-200 bg-rose-50 text-rose-950"
        : "border-amber-200 bg-amber-50 text-amber-950";
  return (
    <div className={`rounded-2xl border px-4 py-4 text-sm leading-relaxed ${styles}`}>
      <p className="font-semibold">{title}</p>
      <div className="mt-1 opacity-90">{children}</div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <DocsShell
      title="Security whitepaper"
      subtitle="MCKey v0.1 — local vault + MCP gateway. Honest about guarantees and gaps."
    >
      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">Abstract</p>
        <p className="mt-3 text-lg leading-relaxed">
          Builders paste API keys into AI agents because it is the fastest way to ship integrations. That puts
          secrets into model context, provider logs, and chat history — then everyone says “rotate.” MCKey makes
          the safe path as fast: seal once locally, give the agent handles and scoped tools, inject credentials
          only on the outbound tool hop.
        </p>
      </section>

      <Callout tone="amber" title="One-line guarantee">
        If a secret never enters the prompt (or tool arguments as plaintext), the model cannot “see” it. MCKey
        optimizes for that property. Anything already sent to an LLM should be rotated — we cannot rewind
        provider retention.
      </Callout>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">1. Goals</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Keep master secrets out of chat transcripts and model context.</li>
          <li>Let agents still call authenticated APIs (Stripe, GitHub, etc.) via MCP tools.</li>
          <li>Support short-lived, revocable agent credentials (MCKeys) with tool allowlists.</li>
          <li>Offer optional chat intercept as a seatbelt — toggleable, explicitly not a hard guarantee.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">2. Non-goals (v0.1)</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Protecting secrets from malware running as your OS user.</li>
          <li>Multi-tenant cloud isolation (hosted gateway is later).</li>
          <li>Recovering secrets that already reached an LLM API.</li>
          <li>Replacing enterprise KMS / HSM for regulated workloads (we complement, not replace).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">3. Architecture</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-5 text-sm leading-relaxed text-slate-200">
{`┌─────────────┐     templates only      ┌──────────────────┐
│ Cursor /    │  vault_list             │ MCKey MCP        │
│ Claude Code │  http_request           │ (stdio, local)   │
│   Agent     │  {{SECRET:NAME}}  ───►  │  decrypt + inject│
└─────────────┘                         └────────┬─────────┘
                                                 │ TLS
                                                 ▼
                                        ┌──────────────────┐
                                        │ Stripe / GitHub /│
                                        │ upstream APIs    │
                                        └──────────────────┘

Secrets at rest: ~/.mckey/vault.json  (AES-256-GCM)
Master key:      ~/.mckey/master.key  or MCKEY_MASTER_KEY`}
        </pre>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">4. What is comparatively safe</h2>
        <div className="mt-4 space-y-3">
          <Callout tone="emerald" title="Vault + http_request injection">
            The agent proposes <code>Authorization: Bearer {"{{SECRET:STRIPE_SECRET_KEY}}"}</code>. MCKey
            replaces the template in-process, sends the request, and redacts known shapes / injected values from
            the tool result. The chat never needed the raw key.
          </Callout>
          <Callout tone="emerald" title="No vault_reveal tool">
            There is intentionally no API for the model to dump plaintext secrets. <code>vault_list</code> returns
            names, handles, fingerprints only.
          </Callout>
          <Callout tone="emerald" title="MCKey allowlists + TTL + revoke">
            With <code>MCKEY=mck_live_…</code> set on the MCP process, tools outside the allowlist fail closed.
            Revoke stops further calls without rotating every upstream key.
          </Callout>
          <Callout tone="emerald" title="Audit without secret values">
            <code>audit.jsonl</code> records events, tool names, redacted URLs, fingerprints — not plaintext
            secrets.
          </Callout>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">5. What remains at risk</h2>
        <div className="mt-4 space-y-3">
          <Callout tone="rose" title="Anything already pasted into chat">
            If <code>sk_live_…</code> hit the model, assume compromise relative to that provider’s retention.
            Rotate. Intercept cannot un-send.
          </Callout>
          <Callout tone="rose" title="Chat intercept bypasses">
            Intercept (when shipped as a Cursor extension) only sees pastes in that input surface. Terminal
            heredocs, files the agent reads, alternate UIs, and “send raw anyway” bypass it. Toggle it off if you
            do not want that behavior — gateway still works.
          </Callout>
          <Callout tone="rose" title="Tool responses that echo secrets">
            If an upstream API returns your key in a body, redaction helps for known patterns but is not perfect.
            Prefer providers that do not echo secrets; treat unexpected echoes as incidents.
          </Callout>
          <Callout tone="rose" title="Over-broad allowlists">
            Allowing <code>http_request</code> to arbitrary URLs means a manipulated agent could exfiltrate data
            the tool can reach. Mitigate with human approval on sensitive calls, URL allowlists (roadmap), and
            least-privilege MCKeys.
          </Callout>
          <Callout tone="rose" title="Local process trust">
            A malicious MCP server or compromised machine can still read <code>~/.mckey</code>. Encrypting at rest
            stops casual file browsing and backups leakage better than plaintext <code>.env</code>, not a hostile
            root attacker.
          </Callout>
          <Callout tone="rose" title="vault_seal from the agent">
            Enabling agent-side seal is convenient (and better than leaving keys in chat) but means a confused
            agent could write attacker-supplied material into your vault. Disable via settings for stricter
            setups; seal only via CLI.
          </Callout>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">6. How this helps vs “just paste it”</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-4 py-3">Concern</th>
                <th className="px-4 py-3">Paste into agent</th>
                <th className="px-4 py-3">MCKey gateway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {[
                ["Model context", "Secret in prompt", "Handle / template only"],
                ["Provider chat logs", "Likely retained", "Not present if never pasted"],
                ["Rotate after every session", "Often needed", "Only if leaked elsewhere"],
                ["Revoke agent access", "Rotate upstream keys", "Revoke MCKey / TTL"],
                ["Friction", "Lowest short-term", "Comparable after one seal + MCP install"],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((cell) => (
                    <td key={cell} className="px-4 py-3 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">7. Chat intercept policy</h2>
        <p className="mt-3 leading-relaxed">
          Intercept is <strong>optional</strong> and default-on as a preference. Product copy must say:{" "}
          <em>better than sharing with the AI, not a guarantee</em>. It only helps before send. Users can
          toggle it off (<code>mckey intercept off</code> / in-app switch) and rely solely on vault + MCP.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">8. Recommendations</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5">
          <li>Seal secrets via CLI when possible; avoid pasting into any agent UI.</li>
          <li>Install MCKey MCP in Cursor and Claude Code; use <code>{"{{SECRET:NAME}}"}</code> templates.</li>
          <li>Issue MCKeys with minimal tool allowlists and short TTLs for untrusted agent sessions.</li>
          <li>Keep intercept on as a seatbelt in Cursor when available; never treat it as primary control.</li>
          <li>If a secret hits chat anyway — rotate upstream, seal the new value, revoke old MCKeys.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">9. Disclosure</h2>
        <p className="mt-3 leading-relaxed">
          This is early software. Report issues on the GitHub repo. Do not store production secrets you cannot
          rotate while evaluating. Prefer test keys until you have reviewed the threat model above.
        </p>
      </section>
    </DocsShell>
  );
}

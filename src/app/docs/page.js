import Link from "next/link";
import DocsShell from "../../components/DocsShell";

export const metadata = {
  title: "Technical overview · MCKey",
  description: "How MCKey’s local vault and MCP gateway keep secrets out of model context.",
};

export default function DocsPage() {
  return (
    <DocsShell
      title="Technical overview"
      subtitle="What ships today: a real local vault + MCP stdio server you can wire into Cursor and Claude Code."
    >
      <section>
        <h2 className="text-2xl font-bold text-slate-900">Components</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5">
          <li>
            <strong>Vault</strong> — AES-256-GCM encrypted secrets under <code>~/.mckey/</code>. Master key in{" "}
            <code>master.key</code> (or <code>MCKEY_MASTER_KEY</code>). Values never written to audit logs.
          </li>
          <li>
            <strong>CLI</strong> — <code>mckey seal / list / issue / revoke / mcp</code> for humans.
          </li>
          <li>
            <strong>MCP server</strong> — stdio tools: <code>vault_list</code>, <code>vault_seal</code>,{" "}
            <code>http_request</code>, <code>mckey_status</code>. Injection happens inside the tool handler.
          </li>
          <li>
            <strong>MCKey tokens</strong> — optional short-lived allowlists via <code>MCKEY=mck_live_…</code> in the
            MCP process env.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">Happy path</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-5 text-sm leading-relaxed text-slate-200">
{`# 1. Install deps + init vault
npm install
npx mckey init

# 2. Seal a secret (once)
npx mckey seal STRIPE_SECRET_KEY --value 'sk_test_…'

# 3. Wire Cursor / Claude Code MCP
npx mckey cursor-config --write
npx mckey claude-config

# 4. Agent calls tools with templates — never the raw key
http_request
  Authorization: Bearer {{SECRET:STRIPE_SECRET_KEY}}
  # or {{mckey://stripe}}`}
        </pre>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">What the model can see</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Artifact</th>
                <th className="px-4 py-3 font-semibold">Visible to model?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {[
                ["Vault plaintext", "No — sealed at rest; only decrypted in the MCP process"],
                ["Tool args with {{SECRET:…}}", "Yes — the template only, not the value"],
                ["Injected Authorization header", "No — added after the model proposes the call"],
                ["Tool response body", "Redacted for known secret shapes + injected values"],
                ["Chat transcript", "Safe if you never pasted; at risk if you did"],
                ["~/.mckey/audit.jsonl", "Fingerprints + events only, not secret values"],
              ].map(([a, b]) => (
                <tr key={a}>
                  <td className="px-4 py-3 font-medium text-slate-900">{a}</td>
                  <td className="px-4 py-3">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">Trust boundary</h2>
        <p className="mt-3 leading-relaxed">
          The MCP server runs as <em>you</em> on your machine. Cursor/Claude Code can invoke the tools you
          registered. MCKey’s job is to keep secret <em>values</em> out of prompts and tool results — not to
          sandbox a malicious local process that already has your OS user privileges. For multi-tenant hosted
          agents, you’d run the gateway as a remote service with stronger isolation (roadmap).
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">Chat intercept (optional)</h2>
        <p className="mt-3 leading-relaxed">
          Client-side paste catching (Cursor extension) is a separate, toggleable safety net. It is{" "}
          <strong>not</strong> required for the gateway model to work. See the{" "}
          <Link className="font-semibold text-orange-600 underline" href="/security">
            security whitepaper
          </Link>{" "}
          for what is safe vs at risk.
        </p>
      </section>
    </DocsShell>
  );
}

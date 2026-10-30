import Link from "next/link";
import DocsShell from "../../components/DocsShell";

export const metadata = {
  title: "Install · MCKey",
  description: "Install MCKey MCP for Cursor and Claude Code — seal secrets locally, inject on tool calls.",
};

export default function InstallPage() {
  return (
    <DocsShell
      title="Install for Cursor & Claude Code"
      subtitle="Real local MCP gateway. Works today over stdio — no hosted account required."
    >
      <section>
        <h2 className="text-2xl font-bold text-slate-900">1. Clone & install</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-5 text-sm text-slate-200">
{`git clone https://github.com/sterno874/mckey.git
cd mckey
npm install
npx mckey init`}
        </pre>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">2. Seal a secret</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-5 text-sm text-slate-200">
{`npx mckey seal STRIPE_SECRET_KEY --value 'sk_test_…'
npx mckey list`}
        </pre>
        <p className="mt-3 text-sm text-slate-600">
          Prefer test keys first. Values are encrypted under <code>~/.mckey/</code>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">3. Cursor</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-5 text-sm text-slate-200">
{`# Print JSON, or merge into ~/.cursor/mcp.json:
npx mckey cursor-config
npx mckey cursor-config --write

# Optional: constrain tools with an issued MCKey
npx mckey issue --agent cursor --tools vault_list,http_request,mckey_status --ttl 120
npx mckey cursor-config --write --mckey mck_live_…`}
        </pre>
        <p className="mt-3 leading-relaxed">
          Restart Cursor (or reload MCP). Ask the agent to call <code>mckey_status</code> then{" "}
          <code>http_request</code> with <code>{"{{mckey://stripe}}"}</code> in a header — not the raw key.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">4. Claude Code / Claude Desktop</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-5 text-sm text-slate-200">
{`npx mckey claude-config
# Paste into Claude Code MCP settings / claude_desktop_config.json`}
        </pre>
        <p className="mt-3 leading-relaxed">
          Claude Code is a strong fit for the <strong>gateway</strong> path. Terminal paste intercept is not
          reliable — seal via CLI (<code>mckey seal</code>) instead of pasting into the TTY.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">5. Agent instructions (suggested)</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-5 text-sm text-slate-200">
{`Never ask me to paste API keys into chat.
Use MCKey MCP:
- vault_list to see handles
- http_request with {{SECRET:NAME}} or {{mckey://…}}
- vault_seal only if I explicitly provide a new secret to store
If I paste a key anyway, call vault_seal and stop repeating the value.`}
        </pre>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">6. Intercept preference</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-5 text-sm text-slate-200">
{`npx mckey intercept on    # default preference
npx mckey intercept off   # gateway-only mindset`}
        </pre>
        <p className="mt-3 text-sm text-slate-600">
          Better than sharing with the AI — not a guarantee. See the{" "}
          <Link className="font-semibold text-orange-600 underline" href="/security">
            security whitepaper
          </Link>
          .
        </p>
      </section>
    </DocsShell>
  );
}

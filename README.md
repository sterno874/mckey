# MCKey

**Paste secrets into the vault — never into the agent.**

Local encrypted vault + MCP gateway for Cursor and Claude Code. Agents call tools with `{{SECRET:NAME}}` / `mckey://…` handles; MCKey injects credentials on the outbound request and redacts them from tool results.

## Quick start

```bash
npm install
npx mckey init
npx mckey seal STRIPE_SECRET_KEY --value 'sk_test_…'
npx mckey cursor-config --write   # or: npx mckey claude-config
```

Then ask the agent to use MCKey MCP `http_request` with templated headers — not raw keys.

## CLI

| Command | Purpose |
|---|---|
| `mckey init` | Create `~/.mckey` vault + master key |
| `mckey seal [NAME]` | Encrypt a secret into the vault |
| `mckey list` | Names + handles only |
| `mckey issue --agent …` | Mint allowlisted MCKey (`MCKEY=…`) |
| `mckey revoke mck_live_…` | Kill agent access |
| `mckey intercept on\|off` | Preference for optional chat intercept |
| `mckey mcp` | Stdio MCP server |
| `mckey doctor` | Paths + status |

## MCP tools

- `vault_list` — names / handles / fingerprints
- `vault_seal` — store a secret (no value echoed later)
- `http_request` — inject `{{SECRET:NAME}}` or `{{mckey://handle}}`, redact response
- `mckey_status` — policy + intercept caveat

## Site / docs

```bash
npm run dev
```

- Marketing: `/`
- Install: `/install`
- Technical overview: `/docs`
- Security whitepaper: `/security`
- How it works (interactive): `/app`

Live: [https://sterno874.github.io/mckey/](https://sterno874.github.io/mckey/)

## Security

Read **[Security whitepaper](./src/app/security/page.js)** (also `/security` on the site). Short version:

- **Safe-ish:** vault + MCP injection keeps values out of model context if you never paste them into chat.
- **At risk:** anything already sent to an LLM; intercept bypasses; over-broad `http_request`; local malware as your user.
- **Intercept:** optional, better than sharing with the AI, **not a guarantee**.

Use test keys until you accept the threat model.

## License

Private / all rights reserved until stated otherwise.

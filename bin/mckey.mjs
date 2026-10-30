#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output, argv, exit } from "node:process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  deleteSecret,
  ensureInitialized,
  getSettings,
  issueAgentKey,
  listSecrets,
  revokeAgentKey,
  sealSecret,
  setInterceptDefault,
} from "../server/vault.mjs";
import { mckeyDir, vaultPath, masterKeyPath, auditPath } from "../server/paths.mjs";
import { startStdioServer } from "../server/mcp-server.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MCP_ENTRY = resolve(ROOT, "bin/mckey.mjs");

const HELP = `
MCKey — local vault + MCP gateway so agents never see your secrets.

Usage:
  mckey init
  mckey seal [NAME]                 Seal a secret (prompt / --value / stdin)
  mckey list
  mckey delete NAME
  mckey issue --agent NAME [--tools a,b] [--ttl MIN]
  mckey revoke MCKEY
  mckey intercept on|off
  mckey doctor
  mckey cursor-config [--write]
  mckey claude-config
  mckey mcp                         Start MCP stdio server (Cursor / Claude Code)

Examples:
  mckey seal STRIPE_SECRET_KEY --value 'sk_test_…'
  echo 'ghp_…' | mckey seal GITHUB_TOKEN
  mckey issue --agent cursor --tools vault_list,http_request,vault_seal --ttl 120
`;

function parseArgs(args) {
  const out = { _: [], flags: {} };
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (!next || next.startsWith("--")) out.flags[key] = true;
      else {
        out.flags[key] = next;
        i += 1;
      }
    } else out._.push(a);
  }
  return out;
}

async function readSecretValue(flags) {
  if (flags.value != null) return String(flags.value);
  if (!input.isTTY) {
    const chunks = [];
    for await (const chunk of input) chunks.push(chunk);
    return Buffer.concat(chunks).toString("utf8").trim();
  }
  const rl = createInterface({ input, output });
  const value = await rl.question("Secret value (hidden in shell history if you paste carefully): ");
  rl.close();
  return value.trim();
}

function cursorConfigObject(mckeyEnv) {
  const cfg = {
    mcpServers: {
      mckey: {
        command: "node",
        args: [MCP_ENTRY, "mcp"],
        env: mckeyEnv ? { MCKEY: mckeyEnv } : {},
      },
    },
  };
  return cfg;
}

function printClaudeConfig(mckeyEnv) {
  const envLine = mckeyEnv ? `      "env": { "MCKEY": "${mckeyEnv}" }\n` : "";
  return `{
  "mcpServers": {
    "mckey": {
      "command": "node",
      "args": ["${MCP_ENTRY}", "mcp"]${mckeyEnv ? "," : ""}
${envLine}    }
  }
}`;
}

async function main() {
  const { _: pos, flags } = parseArgs(argv.slice(2));
  const cmd = pos[0];

  if (!cmd || cmd === "help" || flags.help) {
    console.log(HELP.trim());
    return;
  }

  if (cmd === "init") {
    ensureInitialized();
    console.log(`Initialized MCKey vault at ${mckeyDir()}`);
    console.log(`Master key: ${masterKeyPath()} (chmod 600)`);
    console.log(`Vault:      ${vaultPath()}`);
    return;
  }

  if (cmd === "mcp") {
    ensureInitialized();
    await startStdioServer();
    return;
  }

  if (cmd === "seal") {
    ensureInitialized();
    const name = pos[1];
    const value = await readSecretValue(flags);
    if (!value) {
      console.error("No secret value provided.");
      exit(1);
    }
    const sealed = sealSecret(name, value);
    console.log(JSON.stringify(sealed, null, 2));
    return;
  }

  if (cmd === "list") {
    ensureInitialized();
    console.log(JSON.stringify(listSecrets(), null, 2));
    return;
  }

  if (cmd === "delete") {
    const name = pos[1];
    if (!name) {
      console.error("Usage: mckey delete NAME");
      exit(1);
    }
    deleteSecret(name);
    console.log(`Deleted ${name.toUpperCase()}`);
    return;
  }

  if (cmd === "issue") {
    ensureInitialized();
    const agentName = flags.agent || "agent";
    const tools = String(flags.tools || "vault_list,http_request,mckey_status")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const ttl = Number(flags.ttl || 60);
    const issued = issueAgentKey({ agentName, allowedTools: tools, ttlMinutes: ttl });
    console.log(JSON.stringify(issued, null, 2));
    console.log("\nSet MCKEY in your MCP server env to enforce this allowlist.");
    return;
  }

  if (cmd === "revoke") {
    const token = pos[1];
    if (!token) {
      console.error("Usage: mckey revoke mck_live_…");
      exit(1);
    }
    revokeAgentKey(token);
    console.log("Revoked.");
    return;
  }

  if (cmd === "intercept") {
    const mode = pos[1];
    if (mode !== "on" && mode !== "off") {
      console.error("Usage: mckey intercept on|off");
      exit(1);
    }
    const settings = setInterceptDefault(mode === "on");
    console.log(JSON.stringify(settings, null, 2));
    console.log(
      "Note: intercept is a client-side safety net (Cursor extension TBD). Preference stored for docs/status; gateway path does not depend on it."
    );
    return;
  }

  if (cmd === "doctor") {
    ensureInitialized();
    const settings = getSettings();
    const secrets = listSecrets();
    console.log(
      JSON.stringify(
        {
          home: mckeyDir(),
          vault: vaultPath(),
          masterKey: existsSync(masterKeyPath()),
          auditLog: existsSync(auditPath()),
          secretCount: secrets.length,
          secrets,
          settings,
          mcpEntry: MCP_ENTRY,
          node: process.version,
        },
        null,
        2
      )
    );
    return;
  }

  if (cmd === "cursor-config") {
    ensureInitialized();
    const cfg = cursorConfigObject(flags.mckey || process.env.MCKEY || "");
    const json = JSON.stringify(cfg, null, 2);
    if (flags.write) {
      const path = join(homedir(), ".cursor", "mcp.json");
      mkdirSync(dirname(path), { recursive: true });
      let existing = {};
      if (existsSync(path)) {
        try {
          existing = JSON.parse(readFileSync(path, "utf8"));
        } catch {
          existing = {};
        }
      }
      existing.mcpServers = { ...(existing.mcpServers || {}), ...cfg.mcpServers };
      writeFileSync(path, `${JSON.stringify(existing, null, 2)}\n`);
      console.log(`Wrote mckey server into ${path}`);
    } else {
      console.log(json);
      console.log("\n# Merge into ~/.cursor/mcp.json or re-run with --write");
    }
    return;
  }

  if (cmd === "claude-config") {
    ensureInitialized();
    console.log(printClaudeConfig(flags.mckey || process.env.MCKEY || ""));
    console.log("\n# Add under Claude Code / Claude Desktop MCP settings");
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  console.log(HELP.trim());
  exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  exit(1);
});

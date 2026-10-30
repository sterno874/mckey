#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  assertToolAllowed,
  audit,
  getAgentPolicy,
  getSettings,
  listSecrets,
  resolveSecret,
  sealSecret,
} from "./vault.mjs";
import { redactText } from "./redact.mjs";

function activePolicy() {
  return getAgentPolicy(process.env.MCKEY || "");
}

function guard(toolName) {
  assertToolAllowed(activePolicy(), toolName);
}

function injectTemplates(input, usedSecrets) {
  let out = input;
  // {{SECRET:NAME}} or {{mckey://handle}}
  const re = /\{\{(?:SECRET:)?([^}]+)\}\}/g;
  out = out.replace(re, (_, ref) => {
    const resolved = resolveSecret(ref.trim());
    usedSecrets.push(resolved.value);
    return resolved.value;
  });
  return out;
}

function scrub(value, usedSecrets) {
  if (typeof value === "string") return redactText(value, usedSecrets);
  if (Array.isArray(value)) return value.map((v) => scrub(v, usedSecrets));
  if (value && typeof value === "object") {
    const next = {};
    for (const [k, v] of Object.entries(value)) next[k] = scrub(v, usedSecrets);
    return next;
  }
  return value;
}

export function createMcKeyServer() {
  const server = new McpServer({
    name: "mckey",
    version: "0.1.0",
  });

  server.registerTool(
    "vault_list",
    {
      description:
        "List sealed secret names and mckey:// handles. Never returns secret values. Prefer this over asking the user to paste keys into chat.",
      inputSchema: {},
    },
    async () => {
      guard("vault_list");
      const secrets = listSecrets();
      audit("tool.vault_list", { count: secrets.length });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ secrets, note: "Values are sealed. Use http_request with {{SECRET:NAME}} or {{mckey://…}}." }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "vault_seal",
    {
      description:
        "Seal a secret into the local MCKey vault. Returns only name, handle, and fingerprint — never echo the value back to the user in later messages.",
      inputSchema: {
        name: z.string().optional().describe("Optional env-style name, e.g. STRIPE_SECRET_KEY"),
        value: z.string().describe("The secret value to seal"),
      },
    },
    async ({ name, value }) => {
      guard("vault_seal");
      const settings = getSettings();
      if (!settings.allowVaultSealFromAgent) {
        throw new Error("vault_seal disabled in settings — seal via CLI: mckey seal");
      }
      const sealed = sealSecret(name, value);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                ok: true,
                ...sealed,
                reminder: "Do not repeat the secret value. Use the handle in http_request templates.",
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    "http_request",
    {
      description:
        "Make an authenticated HTTP request. Put secrets in headers/body/url as {{SECRET:NAME}} or {{mckey://handle}}. MCKey injects values locally; the model never receives them. Response bodies are redacted.",
      inputSchema: {
        method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
        url: z.string().url(),
        headers: z.record(z.string()).optional(),
        body: z.string().optional(),
        secret_refs_hint: z
          .string()
          .optional()
          .describe("Optional note for humans/agents about which vault refs this call needs"),
      },
    },
    async ({ method, url, headers = {}, body, secret_refs_hint }) => {
      guard("http_request");
      const usedSecrets = [];
      const finalUrl = injectTemplates(url, usedSecrets);
      const finalHeaders = {};
      for (const [k, v] of Object.entries(headers)) {
        finalHeaders[k] = injectTemplates(v, usedSecrets);
      }
      const finalBody = body != null ? injectTemplates(body, usedSecrets) : undefined;

      let responseText = "";
      let status = 0;
      try {
        const res = await fetch(finalUrl, {
          method,
          headers: finalHeaders,
          body: ["GET", "DELETE"].includes(method) ? undefined : finalBody,
        });
        status = res.status;
        responseText = await res.text();
      } catch (err) {
        audit("tool.http_request.error", { method, url: redactText(url, usedSecrets), error: String(err) });
        throw new Error(`Request failed: ${err.message}`);
      }

      const safeBody = redactText(responseText, usedSecrets);
      audit("tool.http_request", {
        method,
        url: redactText(url, usedSecrets),
        status,
        injected: usedSecrets.length > 0,
        hint: secret_refs_hint || null,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              scrub(
                {
                  status,
                  body: safeBody.slice(0, 50_000),
                  truncated: safeBody.length > 50_000,
                  injected_secret_count: usedSecrets.length,
                  note: "Secret values were injected by MCKey and redacted from this response.",
                },
                usedSecrets
              ),
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    "mckey_status",
    {
      description: "Show MCKey vault status, intercept default, and whether the current process MCKey is valid. Never returns secret values.",
      inputSchema: {},
    },
    async () => {
      // Status is always allowed so agents can discover policy without a chicken/egg.
      const secrets = listSecrets();
      const settings = getSettings();
      const policy = activePolicy();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                secret_count: secrets.length,
                secrets: secrets.map((s) => ({ name: s.name, handle: s.handle })),
                intercept_default: settings.interceptDefault,
                intercept_caveat:
                  "Chat intercept is optional and only helps before send. It is better than pasting to the model, not a guarantee. Prefer vault + http_request.",
                agent_policy: policy
                  ? {
                      valid: policy.valid,
                      reason: policy.reason || null,
                      agentName: policy.agentName,
                      allowedTools: policy.allowedTools,
                      expiresAt: policy.expiresAt,
                    }
                  : { mode: "trusted_local", note: "No MCKEY env set — tools unrestricted for local setup." },
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  return server;
}

export async function startStdioServer() {
  const server = createMcKeyServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

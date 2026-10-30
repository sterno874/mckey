import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync, appendFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { encrypt, decrypt, generateMasterKey, parseMasterKey } from "./crypto.mjs";
import { mckeyDir, vaultPath, masterKeyPath, auditPath } from "./paths.mjs";
import { mask } from "./redact.mjs";

function emptyVault() {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    secrets: {},
    agents: {},
    settings: {
      interceptDefault: true,
      allowVaultSealFromAgent: true,
    },
  };
}

export function ensureInitialized() {
  mkdirSync(mckeyDir(), { recursive: true });
  if (!existsSync(masterKeyPath())) {
    const key = generateMasterKey();
    writeFileSync(masterKeyPath(), `${key}\n`, { mode: 0o600 });
    try {
      chmodSync(masterKeyPath(), 0o600);
    } catch {
      /* windows */
    }
  }
  if (!existsSync(vaultPath())) {
    writeFileSync(vaultPath(), `${JSON.stringify(emptyVault(), null, 2)}\n`, { mode: 0o600 });
    try {
      chmodSync(vaultPath(), 0o600);
    } catch {
      /* windows */
    }
  }
  return JSON.parse(readFileSync(vaultPath(), "utf8"));
}

function loadMasterKey() {
  if (process.env.MCKEY_MASTER_KEY) {
    return parseMasterKey(process.env.MCKEY_MASTER_KEY.trim());
  }
  if (!existsSync(masterKeyPath())) {
    throw new Error("Vault not initialized. Run: mckey init");
  }
  return parseMasterKey(readFileSync(masterKeyPath(), "utf8").trim());
}

export function loadVault() {
  if (!existsSync(vaultPath()) || !existsSync(masterKeyPath())) {
    return ensureInitialized();
  }
  return JSON.parse(readFileSync(vaultPath(), "utf8"));
}

function saveVault(vault) {
  writeFileSync(vaultPath(), `${JSON.stringify(vault, null, 2)}\n`, { mode: 0o600 });
}

export function audit(event, detail = {}) {
  ensureInitialized();
  const line = JSON.stringify({
    at: new Date().toISOString(),
    event,
    ...detail,
  });
  appendFileSync(auditPath(), `${line}\n`);
}

function handleForName(name) {
  const slug = name
    .toLowerCase()
    .replace(/_secret_key$/i, "")
    .replace(/_token$/i, "")
    .replace(/_key$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `mckey://${slug || "secret"}`;
}

export function guessName(value) {
  if (/^sk_(live|test)_/i.test(value)) return "STRIPE_SECRET_KEY";
  if (/^ghp_/i.test(value)) return "GITHUB_TOKEN";
  if (/^github_pat_/i.test(value)) return "GITHUB_TOKEN";
  if (/^xox/i.test(value)) return "SLACK_BOT_TOKEN";
  if (/^AIza/i.test(value)) return "GOOGLE_API_KEY";
  if (/^nf?t_/i.test(value)) return "NOTION_TOKEN";
  return "API_SECRET";
}

export function sealSecret(name, value) {
  const vault = loadVault();
  const key = loadMasterKey();
  const n = (name || guessName(value)).toUpperCase().replace(/\s+/g, "_");
  const handle = handleForName(n);
  vault.secrets[n] = {
    ...encrypt(value, key),
    handle,
    updatedAt: new Date().toISOString(),
    fingerprint: mask(value),
  };
  saveVault(vault);
  audit("vault.seal", { name: n, handle, fingerprint: mask(value) });
  return { name: n, handle, fingerprint: mask(value) };
}

export function listSecrets() {
  const vault = loadVault();
  return Object.entries(vault.secrets).map(([name, meta]) => ({
    name,
    handle: meta.handle,
    fingerprint: meta.fingerprint,
    updatedAt: meta.updatedAt,
  }));
}

export function resolveSecret(nameOrHandle) {
  const vault = loadVault();
  const key = loadMasterKey();
  let entry = null;
  let name = null;

  if (vault.secrets[nameOrHandle]) {
    name = nameOrHandle;
    entry = vault.secrets[nameOrHandle];
  } else {
    const found = Object.entries(vault.secrets).find(([, meta]) => meta.handle === nameOrHandle);
    if (found) {
      name = found[0];
      entry = found[1];
    }
  }

  if (!entry) {
    throw new Error(`Secret not found: ${nameOrHandle}`);
  }

  return {
    name,
    handle: entry.handle,
    value: decrypt(entry, key),
  };
}

export function deleteSecret(name) {
  const vault = loadVault();
  const n = name.toUpperCase();
  if (!vault.secrets[n]) throw new Error(`Secret not found: ${n}`);
  delete vault.secrets[n];
  saveVault(vault);
  audit("vault.delete", { name: n });
}

export function issueAgentKey({ agentName, allowedTools, ttlMinutes = 60 }) {
  const vault = loadVault();
  const token = `mck_live_${randomBytes(8).toString("hex")}`;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
  vault.agents[token] = {
    agentName,
    allowedTools,
    expiresAt,
    revoked: false,
    createdAt: new Date().toISOString(),
  };
  saveVault(vault);
  audit("mckey.issue", { agentName, tokenFingerprint: mask(token), allowedTools, expiresAt });
  return { token, agentName, allowedTools, expiresAt };
}

export function revokeAgentKey(token) {
  const vault = loadVault();
  if (!vault.agents[token]) throw new Error("Unknown MCKey");
  vault.agents[token].revoked = true;
  saveVault(vault);
  audit("mckey.revoke", { tokenFingerprint: mask(token) });
}

export function getAgentPolicy(token) {
  if (!token) return null;
  const vault = loadVault();
  const policy = vault.agents[token];
  if (!policy) return { valid: false, reason: "unknown_mckey" };
  if (policy.revoked) return { valid: false, reason: "revoked", ...policy };
  if (new Date(policy.expiresAt) < new Date()) return { valid: false, reason: "expired", ...policy };
  return { valid: true, ...policy, token };
}

export function assertToolAllowed(policy, toolName) {
  if (!policy) return; // no MCKEY set → local trusted mode (CLI / first-run)
  if (!policy.valid) {
    throw new Error(`MCKey denied: ${policy.reason}`);
  }
  if (!policy.allowedTools.includes(toolName) && !policy.allowedTools.includes("*")) {
    throw new Error(`Tool not allowlisted for this MCKey: ${toolName}`);
  }
}

export function getSettings() {
  return loadVault().settings;
}

export function setInterceptDefault(enabled) {
  const vault = loadVault();
  vault.settings.interceptDefault = Boolean(enabled);
  saveVault(vault);
  audit("settings.intercept", { enabled: Boolean(enabled) });
  return vault.settings;
}

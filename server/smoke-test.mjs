import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "mckey-"));
process.env.MCKEY_HOME = dir;

const {
  ensureInitialized,
  sealSecret,
  listSecrets,
  resolveSecret,
  issueAgentKey,
  getAgentPolicy,
  assertToolAllowed,
  revokeAgentKey,
} = await import("./vault.mjs");
const { redactText } = await import("./redact.mjs");

ensureInitialized();
const sealed = sealSecret("STRIPE_SECRET_KEY", "sk_test_smokeSecretValue999");
if (sealed.handle !== "mckey://stripe") throw new Error(`bad handle ${sealed.handle}`);
if (listSecrets().length !== 1) throw new Error("list failed");
const resolved = resolveSecret("mckey://stripe");
if (resolved.value !== "sk_test_smokeSecretValue999") throw new Error("decrypt failed");

const issued = issueAgentKey({
  agentName: "test",
  allowedTools: ["http_request", "vault_list"],
  ttlMinutes: 5,
});
const policy = getAgentPolicy(issued.token);
assertToolAllowed(policy, "http_request");
let denied = false;
try {
  assertToolAllowed(policy, "vault_seal");
} catch {
  denied = true;
}
if (!denied) throw new Error("allowlist failed");

revokeAgentKey(issued.token);
const revoked = getAgentPolicy(issued.token);
if (revoked.valid) throw new Error("revoke failed");

const redacted = redactText("Bearer sk_test_smokeSecretValue999", [resolved.value]);
if (redacted.includes("sk_test_smokeSecretValue999")) throw new Error("redact failed");

rmSync(dir, { recursive: true, force: true });
console.log("smoke ok");

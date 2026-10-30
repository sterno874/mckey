import { homedir } from "node:os";
import { join } from "node:path";

export function mckeyDir() {
  return process.env.MCKEY_HOME || join(homedir(), ".mckey");
}

export function vaultPath() {
  return join(mckeyDir(), "vault.json");
}

export function masterKeyPath() {
  return join(mckeyDir(), "master.key");
}

export function auditPath() {
  return join(mckeyDir(), "audit.jsonl");
}

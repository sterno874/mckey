import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGO = "aes-256-gcm";

export function generateMasterKey() {
  return randomBytes(32).toString("base64");
}

export function masterKeyFromPassphrase(passphrase, salt) {
  const saltBuf = salt ? Buffer.from(salt, "base64") : randomBytes(16);
  const key = scryptSync(passphrase, saltBuf, 32);
  return { key, salt: saltBuf.toString("base64") };
}

export function parseMasterKey(base64Key) {
  const buf = Buffer.from(base64Key, "base64");
  if (buf.length !== 32) {
    throw new Error("MCKEY_MASTER_KEY must be 32 bytes (base64-encoded).");
  }
  return buf;
}

export function encrypt(plaintext, key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decrypt(payload, key) {
  const decipher = createDecipheriv(ALGO, key, Buffer.from(payload.iv, "base64"));
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

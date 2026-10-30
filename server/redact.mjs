const PATTERNS = [
  /\bsk_(?:live|test)_[A-Za-z0-9]+/g,
  /\bghp_[A-Za-z0-9]+/g,
  /\bxox[baprs]-[A-Za-z0-9-]+/g,
  /\bAIza[0-9A-Za-z\-_]{20,}/g,
  /\bnf?t_[A-Za-z0-9]{20,}/g,
  /\bmck_live_[A-Za-z0-9]+/g,
  /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
];

export function redactText(text, extraValues = []) {
  let out = String(text ?? "");
  for (const value of extraValues) {
    if (!value || value.length < 8) continue;
    out = out.split(value).join(mask(value));
  }
  for (const re of PATTERNS) {
    out = out.replace(new RegExp(re.source, re.flags), (m) => mask(m));
  }
  return out;
}

export function mask(value) {
  const s = String(value);
  if (s.length <= 8) return "••••••••";
  return `${s.slice(0, 4)}••••••••${s.slice(-4)}`;
}

export function looksLikeSecret(text) {
  return PATTERNS.some((re) => new RegExp(re.source, re.flags).test(text));
}

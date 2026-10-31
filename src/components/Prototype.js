"use client";

import { useMemo, useState } from "react";

const DEFAULT_SECRETS = [
  { id: "s1", name: "GITHUB_TOKEN", value: "ghp_demo_not_real_abc123", handle: "mckey://github" },
  { id: "s2", name: "STRIPE_SECRET_KEY", value: "sk_test_demo_xyz789", handle: "mckey://stripe" },
];

const DEFAULT_TOOLS = [
  { id: "github.list_issues", secret: "GITHUB_TOKEN" },
  { id: "github.create_issue", secret: "GITHUB_TOKEN" },
  { id: "stripe.create_refund", secret: "STRIPE_SECRET_KEY" },
  { id: "stripe.create_webhook", secret: "STRIPE_SECRET_KEY" },
  { id: "notion.append_block", secret: null },
  { id: "slack.post_message", secret: null },
];

const KEY_PATTERNS = [
  { re: /\bsk_(?:live|test)_[A-Za-z0-9]+/g, name: "STRIPE_SECRET_KEY", handle: "mckey://stripe" },
  { re: /\bghp_[A-Za-z0-9]+/g, name: "GITHUB_TOKEN", handle: "mckey://github" },
  { re: /\bxox[baprs]-[A-Za-z0-9-]+/g, name: "SLACK_BOT_TOKEN", handle: "mckey://slack" },
  { re: /\bAIza[0-9A-Za-z\-_]{20,}/g, name: "GOOGLE_API_KEY", handle: "mckey://google" },
  { re: /\bnf?t_[A-Za-z0-9]+/g, name: "NOTION_TOKEN", handle: "mckey://notion" },
  {
    re: /\b(?:secret|api[_-]?key|token)\s*[:=]\s*['"]?([A-Za-z0-9_\-]{16,})['"]?/gi,
    name: "GENERIC_SECRET",
    handle: "mckey://secret",
    group: 1,
  },
];

function mask(value) {
  if (!value) return "";
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
}

function mintKey() {
  const hex = Math.random().toString(16).slice(2, 10);
  return `mck_live_${hex}`;
}

function guessNameFromPaste(raw) {
  const v = raw.trim();
  if (/^sk_(live|test)_/i.test(v)) return { name: "STRIPE_SECRET_KEY", handle: "mckey://stripe" };
  if (/^ghp_/i.test(v)) return { name: "GITHUB_TOKEN", handle: "mckey://github" };
  if (/^xox/i.test(v)) return { name: "SLACK_BOT_TOKEN", handle: "mckey://slack" };
  if (/^AIza/i.test(v)) return { name: "GOOGLE_API_KEY", handle: "mckey://google" };
  if (/^nf?t_/i.test(v) || /^secret_/i.test(v)) return { name: "NOTION_TOKEN", handle: "mckey://notion" };
  return { name: "API_SECRET", handle: "mckey://secret" };
}

function findSecretsInText(text) {
  const hits = [];
  for (const pattern of KEY_PATTERNS) {
    const re = new RegExp(pattern.re.source, pattern.re.flags);
    let match;
    while ((match = re.exec(text)) !== null) {
      const value = pattern.group != null ? match[pattern.group] : match[0];
      if (!value || value.length < 12) continue;
      hits.push({
        value,
        name: pattern.name,
        handle: pattern.handle,
        start: match.index,
        end: match.index + match[0].length,
        full: match[0],
      });
    }
  }
  hits.sort((a, b) => a.start - b.start);
  return hits;
}

function rewriteWithHandles(text, hits) {
  let out = text;
  for (let i = hits.length - 1; i >= 0; i -= 1) {
    const hit = hits[i];
    out = `${out.slice(0, hit.start)}${hit.handle}${out.slice(hit.end)}`;
  }
  return out;
}

export default function Prototype() {
  const [secrets, setSecrets] = useState(DEFAULT_SECRETS);
  const [quickPaste, setQuickPaste] = useState("");
  const [agentName, setAgentName] = useState("research-bot");
  const [allowed, setAllowed] = useState([
    "github.list_issues",
    "github.create_issue",
    "stripe.create_webhook",
  ]);
  const [ttlMinutes, setTtlMinutes] = useState(30);
  const [issued, setIssued] = useState(null);
  const [chatDraft, setChatDraft] = useState(
    "here's the stripe key sk_live_51HqDemoDoNotUse123 set up webhooks"
  );
  const [interceptEnabled, setInterceptEnabled] = useState(true);
  const [pendingIntercept, setPendingIntercept] = useState(null);
  const [sentMessages, setSentMessages] = useState([]);
  const [log, setLog] = useState([
    {
      id: 1,
      at: "just now",
      text: "Loaded — paste into the vault. Chat intercept is on (toggle anytime).",
    },
  ]);

  const pushLog = (text) => {
    setLog((prev) => [{ id: Date.now() + Math.random(), at: "now", text }, ...prev].slice(0, 16));
  };

  const upsertSecret = (name, value, handle) => {
    setSecrets((prev) => {
      const existing = prev.find((s) => s.name === name);
      if (existing) {
        return prev.map((s) => (s.name === name ? { ...s, value, handle } : s));
      }
      return [...prev, { id: `s${Date.now()}`, name, value, handle }];
    });
  };

  const addQuickPaste = (event) => {
    event.preventDefault();
    const value = quickPaste.trim();
    if (!value) return;
    const { name, handle } = guessNameFromPaste(value);
    upsertSecret(name, value, handle);
    pushLog(`Vaulted ${name} → ${handle} (agent will never see the raw value)`);
    setQuickPaste("");
  };

  const toggleTool = (toolId) => {
    setAllowed((prev) => (prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]));
  };

  const issueKey = () => {
    const key = mintKey();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    setIssued({
      key,
      agentName,
      allowed: [...allowed],
      expiresAt: expiresAt.toISOString(),
      revoked: false,
    });
    pushLog(`Issued MCKey for ${agentName} · ${allowed.length} tools · TTL ${ttlMinutes}m`);
  };

  const revoke = () => {
    if (!issued) return;
    setIssued({ ...issued, revoked: true });
    pushLog(`Revoked ${issued.key} — agent access stopped.`);
  };

  const simulateCall = (tool) => {
    if (!issued || issued.revoked) {
      pushLog(`DENY ${tool.id} — no active MCKey`);
      return;
    }
    if (new Date(issued.expiresAt) < new Date()) {
      pushLog(`DENY ${tool.id} — MCKey expired`);
      return;
    }
    if (!issued.allowed.includes(tool.id)) {
      pushLog(`DENY ${tool.id} — not on allowlist for ${issued.agentName}`);
      return;
    }
    if (tool.secret) {
      const secret = secrets.find((s) => s.name === tool.secret);
      if (!secret) {
        pushLog(`DENY ${tool.id} — vault missing ${tool.secret}`);
        return;
      }
      pushLog(
        `ALLOW ${tool.id} — gateway injected ${secret.name} (${mask(secret.value)}) · model still only has ${secret.handle}`
      );
      return;
    }
    pushLog(`ALLOW ${tool.id} — no secret required`);
  };

  const scanChat = () => {
    const hits = findSecretsInText(chatDraft);
    if (!interceptEnabled) {
      setPendingIntercept(null);
      const dangerous = hits.length > 0;
      setSentMessages((prev) => [...prev, { role: "user", text: chatDraft, dangerous }]);
      if (dangerous) {
        pushLog(
          `WARN — intercept off; ${hits.length} secret-shaped string(s) may have gone to the agent. Rotate if real.`
        );
      } else {
        pushLog("Message sent — intercept off; no secret shapes detected.");
      }
      setChatDraft("");
      return;
    }
    if (!hits.length) {
      setPendingIntercept(null);
      setSentMessages((prev) => [...prev, { role: "user", text: chatDraft }]);
      pushLog("Message sent — no secret shapes detected.");
      setChatDraft("");
      return;
    }
    setPendingIntercept({
      original: chatDraft,
      hits,
      rewritten: rewriteWithHandles(chatDraft, hits),
    });
    pushLog(`INTERCEPT — caught ${hits.length} secret(s) before the agent could see them.`);
  };

  const confirmIntercept = () => {
    if (!pendingIntercept) return;
    pendingIntercept.hits.forEach((hit) => {
      upsertSecret(hit.name, hit.value, hit.handle);
    });
    setSentMessages((prev) => [
      ...prev,
      { role: "user", text: pendingIntercept.rewritten, intercepted: true },
    ]);
    pushLog(
      `Sealed ${pendingIntercept.hits.map((h) => h.name).join(", ")} · sent rewritten prompt with handles only.`
    );
    setPendingIntercept(null);
    setChatDraft("");
  };

  const sendRawAnyway = () => {
    if (!pendingIntercept) return;
    setSentMessages((prev) => [
      ...prev,
      { role: "user", text: pendingIntercept.original, dangerous: true },
    ]);
    pushLog("WARN — sent raw secret to agent (don't do this). Rotate that key.");
    setPendingIntercept(null);
    setChatDraft("");
  };

  const expiryLabel = useMemo(() => {
    if (!issued) return null;
    if (issued.revoked) return "revoked";
    const ms = new Date(issued.expiresAt) - Date.now();
    if (ms <= 0) return "expired";
    return `${Math.ceil(ms / 60000)}m left`;
  }, [issued]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] sm:px-6">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900">
            Vault — paste once
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            This is the only place secrets should go. We guess the name from the key shape.
          </p>
          <form onSubmit={addQuickPaste} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={quickPaste}
              onChange={(e) => setQuickPaste(e.target.value)}
              placeholder="Paste sk_live_… / ghp_… / xoxb-… here"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-orange-400"
            />
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
              Seal in vault
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {secrets.map((secret) => (
              <div
                key={secret.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
              >
                <div>
                  <div className="font-mono text-sm font-semibold text-slate-900">{secret.name}</div>
                  <div className="font-mono text-xs text-slate-500">{mask(secret.value)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-orange-800">
                    {secret.handle}
                  </span>
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    sealed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-orange-200 bg-orange-50/40 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-slate-900">
                Fake agent chat — intercept
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Optional safety net. Better than sharing with the AI — not a guarantee if the key
                already left your machine.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={interceptEnabled}
              onClick={() => {
                const next = !interceptEnabled;
                setInterceptEnabled(next);
                setPendingIntercept(null);
                pushLog(
                  next
                    ? "Chat intercept enabled — key pastes will be caught before send."
                    : "Chat intercept disabled — messages send as typed (vault + gateway still apply)."
                );
              }}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm"
            >
              <span className="text-xs uppercase tracking-wide text-slate-500">Intercept</span>
              <span
                className={`relative h-6 w-11 rounded-full transition ${
                  interceptEnabled ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    interceptEnabled ? "right-0.5" : "left-0.5"
                  }`}
                />
              </span>
              <span className={interceptEnabled ? "text-emerald-700" : "text-slate-500"}>
                {interceptEnabled ? "On" : "Off"}
              </span>
            </button>
          </div>
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
            Intercept only helps <strong>before</strong> send. It doesn&apos;t pull secrets out of
            chats the model already saw — rotate those. Prefer pasting into the vault above.
          </div>

          {sentMessages.length > 0 && (
            <div className="mt-4 max-h-40 space-y-2 overflow-y-auto">
              {sentMessages.map((msg, i) => (
                <div
                  key={`${msg.text}-${i}`}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    msg.dangerous
                      ? "border border-rose-200 bg-rose-50 text-rose-900"
                      : msg.intercepted
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <span className="mr-2 text-[10px] font-bold uppercase tracking-wide opacity-60">
                    you
                  </span>
                  <span className="font-mono">{msg.text}</span>
                </div>
              ))}
            </div>
          )}

          {pendingIntercept ? (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Secret detected — don&apos;t send this to the model
              </p>
              <p className="mt-2 font-mono text-xs text-amber-900/80 line-through">
                {pendingIntercept.original}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Rewritten for agent
              </p>
              <p className="mt-1 font-mono text-sm text-emerald-900">{pendingIntercept.rewritten}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={confirmIntercept}
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  Seal + send handles
                </button>
                <button
                  type="button"
                  onClick={sendRawAnyway}
                  className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
                >
                  Send raw anyway
                </button>
                <button
                  type="button"
                  onClick={() => setPendingIntercept(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <textarea
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-orange-400"
              />
              <button
                type="button"
                onClick={scanChat}
                disabled={!chatDraft.trim()}
                className="btn-primary disabled:opacity-40"
              >
                Send to agent
              </button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-slate-900">
            Agent permissions
          </h2>
          <label className="mt-3 block text-sm font-medium text-slate-700">
            Agent name
            <input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
            />
          </label>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {DEFAULT_TOOLS.map((tool) => {
              const on = allowed.includes(tool.id);
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => toggleTool(tool.id)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                    on
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <div className="font-mono">{tool.id}</div>
                  <div className="text-xs opacity-80">{on ? "allowed" : "denied"}</div>
                </button>
              );
            })}
          </div>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            TTL (minutes)
            <input
              type="number"
              min={5}
              max={240}
              value={ttlMinutes}
              onChange={(e) => setTtlMinutes(Number(e.target.value) || 30)}
              className="mt-1 w-32 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
            />
          </label>
          <button type="button" onClick={issueKey} className="btn-primary mt-5">
            Issue MCKey
          </button>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Issued MCKey</h2>
          {!issued ? (
            <p className="mt-3 text-sm text-slate-400">
              Allow tools, issue a key — this is what the agent holds instead of sk_live_.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 font-mono text-sm text-orange-200">
                {issued.key}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/10 px-2 py-1">{issued.agentName}</span>
                <span className="rounded-full bg-white/10 px-2 py-1">{issued.allowed.length} tools</span>
                <span
                  className={`rounded-full px-2 py-1 ${
                    issued.revoked || expiryLabel === "expired"
                      ? "bg-rose-500/20 text-rose-200"
                      : "bg-emerald-500/20 text-emerald-200"
                  }`}
                >
                  {expiryLabel}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={revoke}
                  disabled={issued.revoked}
                  className="rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  Revoke
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(issued.key);
                    pushLog("Copied MCKey to clipboard");
                  }}
                  className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-slate-900">
            Simulate tool calls
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Gateway injects vault secrets on allow — the model never receives them.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {DEFAULT_TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => simulateCall(tool)}
                className="rounded-full border border-slate-200 px-3 py-1.5 font-mono text-xs text-slate-700 hover:border-orange-300 hover:bg-orange-50"
              >
                {tool.id}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-slate-900">
            Audit log
          </h2>
          <ul className="mt-4 space-y-2">
            {log.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                <span className="mr-2 text-xs uppercase tracking-wide text-slate-400">{entry.at}</span>
                {entry.text}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

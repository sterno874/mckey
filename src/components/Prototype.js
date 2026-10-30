"use client";

import { useMemo, useState } from "react";

const DEFAULT_SECRETS = [
  { id: "s1", name: "GITHUB_TOKEN", value: "ghp_demo_not_real_abc123" },
  { id: "s2", name: "STRIPE_SECRET_KEY", value: "sk_test_demo_xyz" },
];

const DEFAULT_TOOLS = [
  "github.list_issues",
  "github.create_issue",
  "stripe.create_refund",
  "notion.append_block",
  "slack.post_message",
  "postgres.query",
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

export default function Prototype() {
  const [secrets, setSecrets] = useState(DEFAULT_SECRETS);
  const [secretName, setSecretName] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [agentName, setAgentName] = useState("research-bot");
  const [allowed, setAllowed] = useState(["github.list_issues", "github.create_issue", "notion.append_block"]);
  const [ttlMinutes, setTtlMinutes] = useState(30);
  const [issued, setIssued] = useState(null);
  const [log, setLog] = useState([
    { id: 1, at: "just now", text: "Prototype loaded — secrets stay in this browser tab only." },
  ]);

  const pushLog = (text) => {
    setLog((prev) => [{ id: Date.now(), at: "now", text }, ...prev].slice(0, 12));
  };

  const toggleTool = (tool) => {
    setAllowed((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]));
  };

  const addSecret = (event) => {
    event.preventDefault();
    if (!secretName.trim() || !secretValue.trim()) return;
    const id = `s${Date.now()}`;
    setSecrets((prev) => [...prev, { id, name: secretName.trim().toUpperCase(), value: secretValue.trim() }]);
    pushLog(`Stored secret ${secretName.trim().toUpperCase()} in the local vault.`);
    setSecretName("");
    setSecretValue("");
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
      pushLog(`DENY ${tool} — no active MCKey`);
      return;
    }
    if (new Date(issued.expiresAt) < new Date()) {
      pushLog(`DENY ${tool} — MCKey expired`);
      return;
    }
    if (!issued.allowed.includes(tool)) {
      pushLog(`DENY ${tool} — not on allowlist for ${issued.agentName}`);
      return;
    }
    pushLog(`ALLOW ${tool} — vault injected credentials for one call`);
  };

  const expiryLabel = useMemo(() => {
    if (!issued) return null;
    if (issued.revoked) return "revoked";
    const ms = new Date(issued.expiresAt) - Date.now();
    if (ms <= 0) return "expired";
    return `${Math.ceil(ms / 60000)}m left`;
  }, [issued]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr] sm:px-6">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900">
            Vault
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Master secrets never ship to the agent. Demo data lives only in this tab.
          </p>
          <div className="mt-4 space-y-2">
            {secrets.map((secret) => (
              <div
                key={secret.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
              >
                <div>
                  <div className="font-mono text-sm font-semibold text-slate-900">{secret.name}</div>
                  <div className="font-mono text-xs text-slate-500">{mask(secret.value)}</div>
                </div>
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  sealed
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={addSecret} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={secretName}
              onChange={(e) => setSecretName(e.target.value)}
              placeholder="NAME"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
            />
            <input
              value={secretValue}
              onChange={(e) => setSecretValue(e.target.value)}
              placeholder="value"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
            />
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Add
            </button>
          </form>
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
              const on = allowed.includes(tool);
              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                    on
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <div className="font-mono">{tool}</div>
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
            <p className="mt-3 text-sm text-slate-400">No key yet. Allow tools, then issue one.</p>
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
          <p className="mt-1 text-sm text-slate-600">See allow vs deny against the active MCKey.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {DEFAULT_TOOLS.map((tool) => (
              <button
                key={tool}
                type="button"
                onClick={() => simulateCall(tool)}
                className="rounded-full border border-slate-200 px-3 py-1.5 font-mono text-xs text-slate-700 hover:border-orange-300 hover:bg-orange-50"
              >
                {tool}
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
              <li key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
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

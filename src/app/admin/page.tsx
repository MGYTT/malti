// src/app/admin/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ContentData, ContentNotification, NotificationVariant } from "@/types/content";

type SaveState = "idle" | "saving" | "success" | "error";

// ── Paleta wariantów ──────────────────────────────────────
const VARIANT_OPTIONS: {
  value: NotificationVariant;
  label: string;
  color: string;
  bg:    string;
  icon:  string;
}[] = [
  { value: "stream",     label: "Stream",     color: "#a78bfa", bg: "rgba(108,99,255,0.15)", icon: "🎮" },
  { value: "info",       label: "Info",        color: "#60a5fa", bg: "rgba(59,130,246,0.15)", icon: "ℹ️" },
  { value: "alert",      label: "Ważne",       color: "#fbbf24", bg: "rgba(251,191,36,0.15)", icon: "⚠️" },
  { value: "success",    label: "Sukces",      color: "#4ade80", bg: "rgba(34,197,94,0.15)",  icon: "✅" },
  { value: "promo",      label: "Event",       color: "#f472b6", bg: "rgba(236,72,153,0.15)", icon: "🎉" },
  { value: "top-donate", label: "Top Donate",  color: "#fcd34d", bg: "rgba(251,191,36,0.18)", icon: "👑" },
];

const VARIANT_COLOR: Record<NotificationVariant, string> = {
  stream:      "#a78bfa",
  info:        "#60a5fa",
  alert:       "#fbbf24",
  success:     "#4ade80",
  promo:       "#f472b6",
  "top-donate":"#fcd34d",
};

// ── Globalne style ────────────────────────────────────────
const G = {
  bg:         "#07070f",
  surface:    "rgba(255,255,255,0.03)",
  surfaceHov: "rgba(255,255,255,0.055)",
  border:     "rgba(108,99,255,0.18)",
  borderHov:  "rgba(108,99,255,0.38)",
  accent:     "#a78bfa",
  accentDim:  "rgba(167,139,250,0.6)",
  text:       "#e2e8f0",
  textMuted:  "rgba(255,255,255,0.4)",
  textDim:    "rgba(255,255,255,0.18)",
  radius:     14,
  radiusSm:   9,
  font:       "'Inter', sans-serif",
} as const;

// ── Globalne CSS (wstrzykiwane raz) ───────────────────────
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.25); border-radius: 4px; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.5; } }
  @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }

  .adm-btn-ghost {
    background: none; border: none; cursor: pointer;
    font-family: ${G.font}; transition: all .2s ease;
  }
  .adm-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(108,99,255,0.25);
    border-radius: ${G.radiusSm}px;
    padding: 9px 12px;
    color: ${G.text};
    font-size: 13px;
    font-family: ${G.font};
    outline: none;
    width: 100%;
    transition: border-color .2s, background .2s, box-shadow .2s;
    -webkit-appearance: none;
  }
  .adm-input:focus {
    border-color: rgba(108,99,255,0.65);
    background: rgba(108,99,255,0.07);
    box-shadow: 0 0 0 3px rgba(108,99,255,0.12);
  }
  .adm-input::placeholder { color: rgba(255,255,255,0.2); }
  .adm-card {
    background: ${G.surface};
    border: 1px solid ${G.border};
    border-radius: ${G.radius}px;
    overflow: hidden;
    animation: fadeIn .3s ease;
  }
  .adm-section-header {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    user-select: none;
  }
  .adm-section-header:hover { background: rgba(255,255,255,0.02); }
  .adm-tag {
    display: inline-flex; align-items: center;
    font-size: 9px; font-weight: 800;
    letter-spacing: .14em; text-transform: uppercase;
    border-radius: 5px; padding: 2px 7px;
    white-space: nowrap;
  }

  /* Toast */
  .adm-toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(80px);
    transition: transform .4s cubic-bezier(.34,1.56,.64,1), opacity .3s ease;
    opacity: 0; pointer-events: none; z-index: 9999;
  }
  .adm-toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }

  /* Mobile sticky save bar */
  .adm-sticky-save {
    position: sticky; bottom: 0; z-index: 50;
    padding: 12px 16px;
    background: rgba(7,7,15,0.9);
    backdrop-filter: blur(16px);
    border-top: 1px solid rgba(108,99,255,0.2);
    display: none;
  }
  @media (max-width: 600px) {
    .adm-sticky-save { display: flex; gap: 8px; }
    .adm-desktop-save { display: none !important; }
    .adm-grid-stats { grid-template-columns: 1fr !important; }
    .adm-grid-url   { grid-template-columns: 1fr !important; }
    .adm-grid-emoji { grid-template-columns: 72px 1fr; }
    .adm-grid-link  { grid-template-columns: 1fr 1fr !important; }
    .adm-notif-actions { flex-wrap: wrap; }
  }
`;

// ── Field ─────────────────────────────────────────────────
function Field({
  label, value, onChange, type = "text", placeholder, hint,
}: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 6 }}>
        <label style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: focused ? G.accent : G.textMuted,
          transition: "color .2s ease",
        }}>
          {label}
        </label>
        {hint && <span style={{ fontSize: 9, color: G.textDim }}>{hint}</span>}
      </div>
      <input
        className="adm-input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

// ── AdminSection ──────────────────────────────────────────
function AdminSection({
  title, emoji, badge, children, collapsible = false, defaultOpen = true,
}: {
  title: string; emoji: string; badge?: string;
  children: React.ReactNode; collapsible?: boolean; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="adm-card">
      <div
        className="adm-section-header"
        onClick={collapsible ? () => setOpen((v) => !v) : undefined}
        style={{ cursor: collapsible ? "pointer" : "default", borderBottom: open ? `1px solid ${G.border}` : "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: "rgba(108,99,255,0.12)",
            border: "1px solid rgba(108,99,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15,
          }}>
            {emoji}
          </span>
          <h2 style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: "#fff" }}>
            {title}
          </h2>
          {badge && (
            <span className="adm-tag" style={{ background: "rgba(108,99,255,0.15)", color: G.accent, border: `1px solid rgba(108,99,255,0.25)` }}>
              {badge}
            </span>
          )}
        </div>
        {collapsible && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={G.accentDim} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform .25s ease", flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </div>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "18px 20px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── ToggleSwitch ──────────────────────────────────────────
function ToggleSwitch({ active, onClick, label }: { active: boolean; onClick: () => void; label?: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
      <div
        onClick={onClick}
        style={{
          width: 36, height: 20, borderRadius: 999, flexShrink: 0,
          background: active ? "linear-gradient(135deg,#6c63ff,#a855f7)" : "rgba(255,255,255,0.1)",
          border: `1px solid ${active ? "rgba(108,99,255,0.5)" : "rgba(255,255,255,0.15)"}`,
          position: "relative", cursor: "pointer",
          transition: "background .25s ease, border-color .25s ease",
          boxShadow: active ? "0 0 12px rgba(108,99,255,0.4)" : "none",
        }}
      >
        <div style={{
          position: "absolute", top: 2, left: active ? 17 : 2,
          width: 14, height: 14, borderRadius: "50%",
          background: active ? "#fff" : "rgba(255,255,255,0.4)",
          transition: "left .25s cubic-bezier(.34,1.56,.64,1)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}/>
      </div>
      {label && <span style={{ fontSize: 12, color: active ? G.text : G.textMuted, transition: "color .2s ease" }}>{label}</span>}
    </label>
  );
}

// ── SaveButton ────────────────────────────────────────────
function SaveButton({ state, onClick, hasUnsaved, fullWidth }: { state: SaveState; onClick: () => void; hasUnsaved: boolean; fullWidth?: boolean }) {
  const cfg = {
    idle:    { label: hasUnsaved ? "💾 Zapisz zmiany" : "💾 Zapisz", bg: "linear-gradient(135deg,#6c63ff,#a855f7)" },
    saving:  { label: "⏳ Zapisuję...",   bg: "linear-gradient(135deg,#6c63ff,#a855f7)" },
    success: { label: "✅ Zapisano!",     bg: "linear-gradient(135deg,#22c55e,#16a34a)" },
    error:   { label: "❌ Błąd zapisu",   bg: "linear-gradient(135deg,#ef4444,#dc2626)" },
  }[state];
  return (
    <button
      onClick={onClick}
      disabled={state === "saving"}
      style={{
        background: cfg.bg, border: "none", borderRadius: 10,
        padding: "11px 22px", color: "#fff", fontWeight: 800, fontSize: 12,
        cursor: state === "saving" ? "not-allowed" : "pointer",
        fontFamily: G.font, letterSpacing: "0.06em", textTransform: "uppercase",
        minWidth: fullWidth ? undefined : 150,
        width: fullWidth ? "100%" : undefined,
        transition: "background .3s ease, box-shadow .3s ease, transform .15s ease",
        boxShadow: hasUnsaved && state === "idle" ? "0 0 24px rgba(108,99,255,0.5)" : "none",
        animation: hasUnsaved && state === "idle" ? "pulse 2s ease infinite" : "none",
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e)   => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {cfg.label}
    </button>
  );
}

// ── Toast ─────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" | "info" }) {
  const colors = { success: "#4ade80", error: "#f87171", info: "#60a5fa" };
  return (
    <div style={{
      background: "rgba(15,15,25,0.95)", backdropFilter: "blur(20px)",
      border: `1px solid ${colors[type]}40`, borderRadius: 12,
      padding: "12px 20px", display: "flex", alignItems: "center", gap: 10,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${colors[type]}20`,
      whiteSpace: "nowrap",
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors[type], flexShrink: 0 }}/>
      <span style={{ fontSize: 12, fontWeight: 600, color: G.text, fontFamily: G.font }}>{message}</span>
    </div>
  );
}

// ── NotificationPreview ───────────────────────────────────
function NotificationPreview({ n }: { n: ContentNotification }) {
  const color   = VARIANT_COLOR[n.variant] ?? "#a78bfa";
  const isEmpty = !n.title && !n.message;
  const opt     = VARIANT_OPTIONS.find((v) => v.value === n.variant);

  return (
    <div style={{
      position: "relative", borderRadius: 12, overflow: "hidden",
      border: `1px solid ${color}45`,
      background: `linear-gradient(135deg, ${color}10, ${color}06)`,
      padding: "11px 13px",
      display: "flex", alignItems: "flex-start", gap: 10,
      opacity: isEmpty ? 0.35 : 1, transition: "opacity .2s ease",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${color},transparent)` }}/>
      <span style={{ fontSize: 18, flexShrink: 0, filter: `drop-shadow(0 0 8px ${color})` }}>
        {n.emoji || "🔔"}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
          <span className="adm-tag" style={{ background: `${color}20`, color, border: `1px solid ${color}35` }}>
            {opt?.label ?? "NOTIF"}
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
            {n.title || "Tytuł powiadomienia..."}
          </span>
        </div>
        {n.message && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", margin: "0 0 5px", lineHeight: 1.45 }}>{n.message}</p>}
        {n.url && n.urlLabel && (
          <span style={{ fontSize: 10, fontWeight: 700, color, opacity: .85 }}>{n.urlLabel} →</span>
        )}
      </div>
    </div>
  );
}

// ── NotificationEditor ────────────────────────────────────
function NotificationEditor({
  notification: n, index: i, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  notification: ContentNotification; index: number;
  onChange:  (i: number, updated: ContentNotification) => void;
  onDelete:  (i: number) => void;
  onMoveUp:  (i: number) => void;
  onMoveDown:(i: number) => void;
  isFirst: boolean; isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const up = (field: keyof ContentNotification, val: unknown) =>
    onChange(i, { ...n, [field]: val });

  const color = VARIANT_COLOR[n.variant] ?? "#a78bfa";

  return (
    <div style={{
      background: n.visible ? `${color}06` : "rgba(255,255,255,0.015)",
      border: `1px solid ${n.visible ? `${color}30` : "rgba(255,255,255,0.07)"}`,
      borderRadius: 12, overflow: "hidden",
      opacity: n.visible ? 1 : 0.55,
      transition: "all .25s ease",
    }}>
      {/* ── Nagłówek ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "10px 12px",
        background: n.visible ? `${color}0a` : "transparent",
        borderBottom: expanded ? "1px solid rgba(255,255,255,0.05)" : "none",
      }}>
        {/* Strzałki */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
          {[
            { disabled: isFirst,  onClick: () => onMoveUp(i),   sym: "▲" },
            { disabled: isLast,   onClick: () => onMoveDown(i), sym: "▼" },
          ].map(({ disabled, onClick, sym }) => (
            <button key={sym} onClick={onClick} disabled={disabled} className="adm-btn-ghost"
              style={{ color: disabled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.3)", fontSize: 9, padding: "2px 5px", borderRadius: 4 }}
              onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.color = G.accent; }}
              onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            >{sym}</button>
          ))}
        </div>

        {/* Tytuł — klik rozwija */}
        <button onClick={() => setExpanded((v) => !v)} className="adm-btn-ghost"
          style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, textAlign: "left", padding: "2px 0", minWidth: 0 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{n.emoji || "🔔"}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: n.visible ? color : G.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {n.title || <span style={{ opacity: .35 }}>Bez tytułu</span>}
          </span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expanded ? "rotate(0)" : "rotate(-90deg)", transition: "transform .2s ease", flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* Akcje */}
        <div className="adm-notif-actions" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <ToggleSwitch active={n.visible} onClick={() => up("visible", !n.visible)}/>
          <button onClick={() => onDelete(i)} className="adm-btn-ghost"
            style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171", fontSize: 13 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
          >🗑</button>
        </div>
      </div>

      {/* ── Formularz ── */}
      {expanded && (
        <div style={{ padding: "14px 12px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Podgląd */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: G.textDim, margin: "0 0 7px" }}>PODGLĄD LIVE</p>
            <NotificationPreview n={n} />
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }}/>

          {/* Wariant */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: G.textMuted, margin: "0 0 8px" }}>Wariant</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {VARIANT_OPTIONS.map((opt) => {
                const sel = n.variant === opt.value;
                return (
                  <button key={opt.value} onClick={() => up("variant", opt.value)} className="adm-btn-ghost"
                    style={{
                      background: sel ? opt.bg : "rgba(255,255,255,0.03)",
                      border: `1px solid ${sel ? opt.color : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 8, padding: "5px 11px",
                      color: sel ? opt.color : G.textMuted,
                      fontSize: 11, fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 5,
                      boxShadow: sel ? `0 0 12px ${opt.color}30` : "none",
                    }}
                  >
                    <span>{opt.icon}</span>{opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emoji + tytuł */}
          <div className="adm-grid-emoji" style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 8 }}>
            <Field label="Emoji" value={n.emoji} onChange={(v) => up("emoji", v)} placeholder="🎮"/>
            <Field label="Tytuł" value={n.title} onChange={(v) => up("title", v)} placeholder="np. Stream dziś o 23:00!"/>
          </div>

          {/* Opis */}
          <Field label="Opis" value={n.message} onChange={(v) => up("message", v)}
            placeholder="np. Wpadaj na live — gramy razem do białego rana" hint="opcjonalny"/>

          {/* URL + etykieta */}
          <div className="adm-grid-url" style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: 8 }}>
            <Field label="Link" value={n.url ?? ""} onChange={(v) => up("url", v || undefined)} type="url" placeholder="https://" hint="opcjonalny"/>
            <Field label="Etykieta" value={n.urlLabel ?? ""} onChange={(v) => up("urlLabel", v || undefined)} placeholder="Dołącz →"/>
          </div>

          {/* Opcje */}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <ToggleSwitch active={n.dismissible} onClick={() => up("dismissible", !n.dismissible)} label="Użytkownik może zamknąć"/>
          </div>

          {/* Wygaśnięcie */}
          <Field label="Wygasa automatycznie" value={n.expiresAt ?? ""}
            onChange={(v) => up("expiresAt", v || undefined)} type="datetime-local" hint="opcjonalnie"/>

          {/* ID */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 9, color: G.textDim, fontFamily: "monospace" }}>ID:</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", wordBreak: "break-all" }}>{n.id}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Główny komponent ──────────────────────────────────────
export default function AdminPage() {
  const [password,  setPassword]  = useState("");
  const [authed,    setAuthed]    = useState(false);
  const [authError, setAuthError] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [data,      setData]      = useState<ContentData | null>(null);
  const [original,  setOriginal]  = useState<ContentData | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [toast,     setToast]     = useState<{ msg: string; type: "success"|"error"|"info" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((msg: string, type: "success"|"error"|"info" = "info") => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const hasUnsaved =
    data !== null && original !== null &&
    JSON.stringify(data) !== JSON.stringify(original);

  // ── Wczytaj dane ─────────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    fetch("/api/content")
      .then((r) => r.json())
      .then((d: ContentData) => {
        if (!Array.isArray(d.notifications)) d.notifications = [];
        setData(d);
        setOriginal(structuredClone(d));
      })
      .catch(() => showToast("Błąd wczytywania danych", "error"));
  }, [authed, showToast]);

  // ── beforeunload ──────────────────────────────────────
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (!hasUnsaved) return;
      e.preventDefault(); e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [hasUnsaved]);

  // ── Logowanie ─────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(false); setLoading(true);
    try {
      const r = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({}),
      });
      if (r.ok) setAuthed(true);
      else { setAuthError(true); }
    } catch { setAuthError(true); }
    finally { setLoading(false); }
  }

  // ── Zapis ─────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaveState("saving");
    try {
      const r = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify(data),
      });
      if (r.ok) {
        setSaveState("success");
        setLastSaved(new Date().toLocaleTimeString("pl-PL"));
        setOriginal(structuredClone(data));
        showToast("Zmiany zapisane pomyślnie!", "success");
        setTimeout(() => setSaveState("idle"), 3000);
      } else {
        setSaveState("error");
        showToast("Błąd zapisu — spróbuj ponownie", "error");
        setTimeout(() => setSaveState("idle"), 3000);
      }
    } catch {
      setSaveState("error");
      showToast("Błąd sieci", "error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }, [data, password, showToast]);

  // ── Reset ─────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (!original || !hasUnsaved) return;
    if (!confirm("Cofnąć wszystkie niezapisane zmiany?")) return;
    setData(structuredClone(original));
    showToast("Zmiany cofnięte", "info");
  }, [original, hasUnsaved, showToast]);

  // ── Update helper ─────────────────────────────────────
  function update(path: string[], value: unknown) {
    setData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      let node: Record<string, unknown> = next as never;
      for (let i = 0; i < path.length - 1; i++) {
        node = node[path[i]] as Record<string, unknown>;
      }
      node[path[path.length - 1]] = value;
      return next;
    });
  }

  // ── Operacje na powiadomieniach ───────────────────────
  function notifChange(idx: number, updated: ContentNotification) {
    if (!data) return;
    const next = [...data.notifications];
    next[idx] = updated;
    update(["notifications"], next);
  }
  function notifDelete(idx: number) {
    if (!data) return;
    if (!confirm("Usunąć to powiadomienie?")) return;
    const next = [...data.notifications];
    next.splice(idx, 1);
    update(["notifications"], next);
    showToast("Powiadomienie usunięte", "info");
  }
  function notifMoveUp(idx: number) {
    if (!data || idx === 0) return;
    const next = [...data.notifications];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    update(["notifications"], next);
  }
  function notifMoveDown(idx: number) {
    if (!data || idx === data.notifications.length - 1) return;
    const next = [...data.notifications];
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    update(["notifications"], next);
  }
  function notifAdd() {
    if (!data) return;
    const n: ContentNotification = {
      id: `notif-${Date.now()}`, variant: "stream",
      emoji: "🎮", title: "", message: "",
      url: undefined, urlLabel: undefined,
      visible: true, dismissible: true, expiresAt: undefined,
    };
    update(["notifications"], [...data.notifications, n]);
    showToast("Nowe powiadomienie dodane", "info");
  }

  // ── Login ─────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: G.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: G.font, padding: 20 }}>
        <style>{GLOBAL_CSS}</style>

        {/* Glow bg */}
        <div aria-hidden="true" style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(108,99,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }}/>

        <form onSubmit={handleLogin} style={{
          position: "relative", zIndex: 1,
          background: "rgba(255,255,255,0.028)", backdropFilter: "blur(24px)",
          border: "1px solid rgba(108,99,255,0.22)", borderRadius: 20,
          padding: "36px 28px", width: "100%", maxWidth: 360,
          display: "flex", flexDirection: "column", gap: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16, margin: "0 auto 14px",
              background: "linear-gradient(135deg,rgba(108,99,255,0.3),rgba(168,85,247,0.2))",
              border: "1px solid rgba(108,99,255,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, boxShadow: "0 8px 32px rgba(108,99,255,0.25)",
            }}>🔐</div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.025em", margin: "0 0 6px" }}>Panel Admina</h1>
            <p style={{ fontSize: 12, color: G.textMuted, margin: 0 }}>MALTIXON — zarządzanie treścią</p>
          </div>

          <Field label="Hasło dostępu" value={password} onChange={setPassword} type="password" placeholder="••••••••••"/>

          {authError && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)",
              borderRadius: 9, padding: "10px 14px",
              animation: "fadeIn .3s ease",
            }}>
              <span style={{ fontSize: 15 }}>❌</span>
              <span style={{ fontSize: 12, color: "#fca5a5", fontWeight: 600 }}>Nieprawidłowe hasło</span>
            </div>
          )}

          <button type="submit" disabled={loading || !password.trim()} style={{
            background: loading || !password.trim() ? "rgba(108,99,255,0.3)" : "linear-gradient(135deg,#6c63ff,#a855f7)",
            border: "none", borderRadius: 11, padding: "13px 0",
            color: "#fff", fontWeight: 800, fontSize: 14,
            cursor: loading || !password.trim() ? "not-allowed" : "pointer",
            fontFamily: G.font, letterSpacing: "0.03em",
            transition: "background .2s ease, transform .15s ease",
            boxShadow: !loading && password.trim() ? "0 4px 20px rgba(108,99,255,0.4)" : "none",
          }}
            onMouseDown={(e) => { if (!loading && password.trim()) e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={(e)   => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {loading ? "⏳ Sprawdzam..." : "Zaloguj się →"}
          </button>
        </form>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────
  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: G.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: G.font }}>
        <style>{GLOBAL_CSS}</style>
        <div style={{ width: 36, height: 36, border: "2.5px solid rgba(108,99,255,0.15)", borderTop: "2.5px solid #6c63ff", borderRadius: "50%", animation: "spin .7s linear infinite" }}/>
        <span style={{ fontSize: 12, color: G.textMuted, letterSpacing: "0.06em" }}>Wczytywanie danych...</span>
      </div>
    );
  }

  const notifications = data.notifications ?? [];
  const activeCount   = notifications.filter((n) => n.visible).length;

  // ── Panel ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: G.font, color: G.text }}>
      <style>{GLOBAL_CSS}</style>

      {/* Ambient glow */}
      <div aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, right: 0, height: 300, background: "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(108,99,255,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }}/>

      {/* Toast */}
      <div className={`adm-toast${toast ? " show" : ""}`}>
        {toast && <Toast message={toast.msg} type={toast.type}/>}
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "clamp(20px,5vw,40px) clamp(14px,4vw,24px) 100px" }}>

        {/* ── Topbar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12, marginBottom: 28,
          paddingBottom: 20, borderBottom: `1px solid ${G.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg,rgba(108,99,255,0.25),rgba(168,85,247,0.15))",
              border: "1px solid rgba(108,99,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, boxShadow: "0 4px 20px rgba(108,99,255,0.2)",
            }}>⚙️</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 3px" }}>
                Panel Admina
              </h1>
              <p style={{ margin: 0, fontSize: 11 }}>
                {hasUnsaved
                  ? <span style={{ color: "#fbbf24", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#fbbf24", animation: "pulse 1.5s ease infinite" }}/>
                      Niezapisane zmiany
                    </span>
                  : lastSaved
                  ? <span style={{ color: G.textDim }}>✓ Zapisano o {lastSaved}</span>
                  : <span style={{ color: G.textDim }}>Wprowadź zmiany i zapisz</span>
                }
              </p>
            </div>
          </div>

          {/* Desktop save */}
          <div className="adm-desktop-save" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {hasUnsaved && (
              <button onClick={handleReset} className="adm-btn-ghost"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}`, borderRadius: 10, padding: "10px 16px", color: G.textMuted, fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = G.text; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = G.textMuted; e.currentTarget.style.borderColor = G.border; }}
              >↺ Cofnij</button>
            )}
            <SaveButton state={saveState} onClick={handleSave} hasUnsaved={hasUnsaved}/>
          </div>
        </div>

        {/* ── Sekcje ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* POWIADOMIENIA */}
          <AdminSection
            title="Powiadomienia"
            emoji="🔔"
            badge={activeCount > 0 ? `${activeCount} aktywne` : undefined}
          >
            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 36, opacity: .25 }}>🔕</span>
                <p style={{ fontSize: 12, color: G.textDim, margin: 0 }}>Brak powiadomień — kliknij poniżej aby dodać</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {notifications.map((n, i) => (
                  <NotificationEditor key={n.id} notification={n} index={i}
                    onChange={notifChange} onDelete={notifDelete}
                    onMoveUp={notifMoveUp} onMoveDown={notifMoveDown}
                    isFirst={i === 0} isLast={i === notifications.length - 1}
                  />
                ))}
              </div>
            )}
            <button onClick={notifAdd} className="adm-btn-ghost"
              style={{ background: "rgba(108,99,255,0.07)", border: "1.5px dashed rgba(108,99,255,0.28)", borderRadius: 10, padding: "13px", color: G.accentDim, fontSize: 12, fontWeight: 700, width: "100%", letterSpacing: "0.04em", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(108,99,255,0.14)"; e.currentTarget.style.borderColor = "rgba(108,99,255,0.5)"; e.currentTarget.style.color = G.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(108,99,255,0.07)"; e.currentTarget.style.borderColor = "rgba(108,99,255,0.28)"; e.currentTarget.style.color = G.accentDim; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Dodaj powiadomienie
            </button>
          </AdminSection>

          {/* STATUS */}
          <AdminSection title="Status" emoji="🟢" collapsible>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${G.border}` }}>
              <ToggleSwitch
                active={data.status.available}
                onClick={() => update(["status", "available"], !data.status.available)}
                label={data.status.available ? "Otwarty na współpracę" : "Niedostępny na współpracę"}
              />
            </div>
            <Field label="Tekst statusu" value={data.status.text} onChange={(v) => update(["status", "text"], v)} placeholder="np. Otwarty na współpracę"/>
            <Field label="Info o streamie" value={data.status.streamInfo} onChange={(v) => update(["status", "streamInfo"], v)} placeholder="np. Stream w każdy piątek 20:00"/>
          </AdminSection>

          {/* STATYSTYKI */}
          <AdminSection title="Statystyki" emoji="📊" collapsible defaultOpen={false}>
            {(["subscribers", "views", "followers"] as const).map((key) => {
              const labels = { subscribers: "YouTube — Subskrybenci", views: "Łącznie — Wyświetlenia", followers: "Instagram — Obserwujący" };
              return (
                <div key={key} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${G.border}` }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G.textDim, margin: "0 0 10px" }}>{labels[key]}</p>
                  <div className="adm-grid-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10 }}>
                    <Field label="Wartość" value={data.stats[key].value} onChange={(v) => update(["stats", key, "value"], Number(v))} type="number"/>
                    <Field label="Wyświetlane" value={data.stats[key].display} onChange={(v) => update(["stats", key, "display"], v)} placeholder="592K"/>
                    <Field label="Suffix" value={data.stats[key].suffix} onChange={(v) => update(["stats", key, "suffix"], v)} placeholder="K"/>
                  </div>
                </div>
              );
            })}
          </AdminSection>

          {/* LINKI */}
          <AdminSection title={`Linki`} emoji="🔗" badge={`${data.links.filter((l) => l.visible).length}/${data.links.length}`} collapsible defaultOpen={false}>
            {data.links.map((link, i) => (
              <div key={link.id} style={{
                background: link.visible ? "rgba(108,99,255,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${link.visible ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 10, padding: "12px 14px",
                display: "flex", flexDirection: "column", gap: 10,
                opacity: link.visible ? 1 : 0.45, transition: "all .2s ease",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: link.color, display: "flex", alignItems: "center", gap: 6 }}>
                    {link.emoji} {link.label}
                  </span>
                  <ToggleSwitch active={link.visible} onClick={() => update(["links", String(i), "visible"], !link.visible)}/>
                </div>
                <div className="adm-grid-link" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="Etykieta" value={link.label} onChange={(v) => update(["links", String(i), "label"], v)}/>
                  <Field label="Podtytuł" value={link.sub} onChange={(v) => update(["links", String(i), "sub"], v)}/>
                </div>
                <Field label="URL" value={link.url} onChange={(v) => update(["links", String(i), "url"], v)} type="url" placeholder="https://"/>
              </div>
            ))}
          </AdminSection>

          {/* PROFIL */}
          <AdminSection title="Profil" emoji="👤" collapsible defaultOpen={false}>
            <Field label="Nazwa" value={data.profile.name} onChange={(v) => update(["profile", "name"], v)}/>
            <Field label="Tagline" value={data.profile.tagline} onChange={(v) => update(["profile", "tagline"], v)} placeholder="np. Polski Streamer & Twórca"/>
            <Field label="Preferowany kontakt" value={data.profile.preferred} onChange={(v) => update(["profile", "preferred"], v)} placeholder="np. Discord"/>
          </AdminSection>
        </div>

        {/* ── Stopka ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 28, paddingTop: 18, borderTop: `1px solid ${G.border}` }}>
          <a href="/" style={{ fontSize: 11, color: "rgba(108,99,255,0.5)", fontWeight: 600, letterSpacing: "0.06em", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, transition: "color .2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = G.accentDim)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(108,99,255,0.5)")}
          >
            ← Strona główna
          </a>
          <span style={{ fontSize: 10, color: G.textDim, letterSpacing: "0.04em" }}>MALTIXON Admin v2.0</span>
        </div>
      </div>

      {/* ── Mobile sticky save bar ── */}
      <div className="adm-sticky-save">
        {hasUnsaved && (
          <button onClick={handleReset} className="adm-btn-ghost"
            style={{ flex: "none", background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}`, borderRadius: 10, padding: "11px 16px", color: G.textMuted, fontWeight: 700, fontSize: 12 }}
          >↺</button>
        )}
        <SaveButton state={saveState} onClick={handleSave} hasUnsaved={hasUnsaved} fullWidth/>
      </div>
    </div>
  );
}

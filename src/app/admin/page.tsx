// src/app/admin/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { ContentData } from "@/types/content";

type SaveState = "idle" | "saving" | "success" | "error";

// ── Field ─────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label:        string;
  value:        string | number;
  onChange:     (v: string) => void;
  type?:        string;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: focused ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.4)", transition: "color 0.2s ease" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background:   focused ? "rgba(108,99,255,0.06)" : "rgba(255,255,255,0.05)",
          border:       `1px solid ${focused ? "rgba(108,99,255,0.6)" : "rgba(108,99,255,0.25)"}`,
          borderRadius: 8,
          padding:      "8px 12px",
          color:        "#e2e8f0",
          fontSize:     13,
          fontFamily:   "'Inter', sans-serif",
          outline:      "none",
          width:        "100%",
          transition:   "border-color 0.2s ease, background 0.2s ease",
          boxSizing:    "border-box",
        }}
      />
    </div>
  );
}

// ── AdminSection ──────────────────────────────────────────
function AdminSection({
  title,
  emoji,
  children,
  collapsible = false,
}: {
  title:         string;
  emoji:         string;
  children:      React.ReactNode;
  collapsible?:  boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: 14, overflow: "hidden" }}>

      {/* Nagłówek sekcji */}
      <div
        onClick={collapsible ? () => setOpen((v) => !v) : undefined}
        style={{
          display:      "flex",
          alignItems:   "center",
          justifyContent: "space-between",
          padding:      "14px 20px",
          cursor:       collapsible ? "pointer" : "default",
          borderBottom: open ? "1px solid rgba(108,99,255,0.1)" : "none",
          transition:   "border-color 0.2s ease",
          userSelect:   "none",
        }}
      >
        <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a78bfa", display: "flex", alignItems: "center", gap: 7, margin: 0 }}>
          <span>{emoji}</span>
          {title}
        </h2>
        {collapsible && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.25s ease", flexShrink: 0 }} aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </div>

      {/* Zawartość */}
      <div style={{ display: open ? "flex" : "none", flexDirection: "column", gap: 14, padding: "18px 20px" }}>
        {children}
      </div>
    </div>
  );
}

// ── ToggleButton ──────────────────────────────────────────
function ToggleButton({
  active,
  onLabel,
  offLabel,
  onClick,
}: {
  active:   boolean;
  onLabel:  string;
  offLabel: string;
  onClick:  () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background:   active ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
        border:       `1px solid ${active ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
        borderRadius: 999,
        padding:      "5px 16px",
        color:        active ? "#4ade80" : "#f87171",
        fontSize:     11,
        fontWeight:   700,
        cursor:       "pointer",
        fontFamily:   "'Inter', sans-serif",
        transition:   "all 0.2s ease",
        whiteSpace:   "nowrap",
      }}
    >
      {active ? onLabel : offLabel}
    </button>
  );
}

// ── SaveButton ────────────────────────────────────────────
function SaveButton({
  state,
  onClick,
  hasUnsaved,
}: {
  state:      SaveState;
  onClick:    () => void;
  hasUnsaved: boolean;
}) {
  const label = {
    idle:    hasUnsaved ? "💾 Zapisz zmiany" : "💾 Zapisz",
    saving:  "⏳ Zapisuję...",
    success: "✅ Zapisano!",
    error:   "❌ Błąd zapisu",
  }[state];

  const bg = {
    idle:    "linear-gradient(135deg,#6c63ff,#a855f7)",
    saving:  "linear-gradient(135deg,#6c63ff,#a855f7)",
    success: "linear-gradient(135deg,#22c55e,#16a34a)",
    error:   "linear-gradient(135deg,#ef4444,#dc2626)",
  }[state];

  return (
    <button
      onClick={onClick}
      disabled={state === "saving"}
      style={{
        background:    bg,
        border:        hasUnsaved && state === "idle"
          ? "1px solid rgba(255,255,255,0.2)"
          : "none",
        borderRadius:  10,
        padding:       "10px 22px",
        color:         "#fff",
        fontWeight:    800,
        fontSize:      12,
        cursor:        state === "saving" ? "not-allowed" : "pointer",
        fontFamily:    "'Inter', sans-serif",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        minWidth:      140,
        transition:    "background 0.3s ease, box-shadow 0.3s ease",
        boxShadow:     hasUnsaved && state === "idle"
          ? "0 0 20px rgba(108,99,255,0.4)"
          : "none",
      }}
    >
      {label}
    </button>
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

  // Czy są niezapisane zmiany
  const hasUnsaved = data !== null &&
    original !== null &&
    JSON.stringify(data) !== JSON.stringify(original);

  // ── Wczytaj dane po zalogowaniu ───────────────────────
  useEffect(() => {
    if (!authed) return;
    fetch("/api/content")
      .then((r) => r.json())
      .then((d: ContentData) => {
        setData(d);
        setOriginal(structuredClone(d));
      })
      .catch(console.error);
  }, [authed]);

  // ── Ostrzeżenie o niezapisanych zmianach ──────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasUnsaved) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);

  // ── Logowanie ─────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(false);
    setLoading(true);

    try {
      const r = await fetch("/api/content", {
        method:  "POST",
        headers: {
          "Content-Type":     "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({}),
      });

      if (r.ok)              setAuthed(true);
      else                   setAuthError(true);
    } catch {
      setAuthError(true);
    } finally {
      setLoading(false);
    }
  }

  // ── Zapis ─────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaveState("saving");
    try {
      const r = await fetch("/api/content", {
        method:  "POST",
        headers: {
          "Content-Type":     "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(data),
      });

      if (r.ok) {
        setSaveState("success");
        setLastSaved(new Date().toLocaleTimeString("pl-PL"));
        setOriginal(structuredClone(data));   // ← reset "unsaved" tracker
        setTimeout(() => setSaveState("idle"), 3000);
      } else {
        setSaveState("error");
        setTimeout(() => setSaveState("idle"), 3000);
      }
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }, [data, password]);

  // ── Reset zmian ───────────────────────────────────────
  const handleReset = useCallback(() => {
    if (!original) return;
    if (!hasUnsaved) return;
    if (!confirm("Cofnąć wszystkie niezapisane zmiany?")) return;
    setData(structuredClone(original));
  }, [original, hasUnsaved]);

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

  // ── Login screen ──────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#07070f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: 20 }}>
        <form
          onSubmit={handleLogin}
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: 18, padding: "32px 28px", width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 18 }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>Panel Admina</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>MALTIXON — zarządzanie treścią</p>
          </div>

          <Field label="Hasło" value={password} onChange={setPassword} type="password" placeholder="Wpisz hasło dostępu"/>

          {authError && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 12px" }}>
              <span style={{ fontSize: 12 }}>❌</span>
              <span style={{ fontSize: 11, color: "#f87171", fontWeight: 600 }}>Nieprawidłowe hasło</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            style={{ background: loading ? "rgba(108,99,255,0.4)" : "linear-gradient(135deg,#6c63ff,#a855f7)", border: "none", borderRadius: 10, padding: "11px 0", color: "#fff", fontWeight: 800, fontSize: 13, cursor: loading || !password.trim() ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em", transition: "background 0.2s ease", opacity: loading || !password.trim() ? 0.7 : 1 }}
          >
            {loading ? "⏳ Sprawdzam..." : "Zaloguj się →"}
          </button>
        </form>
      </div>
    );
  }

  // ── Loading screen ────────────────────────────────────
  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "#07070f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(108,99,255,0.2)", borderTop: "2px solid #6c63ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>Wczytywanie danych...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Panel główny ──────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#07070f", fontFamily: "'Inter', sans-serif", color: "#e2e8f0", padding: "clamp(20px, 5vw, 40px) clamp(16px, 5vw, 24px)" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* ── Nagłówek ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: "#fff", margin: 0 }}>
              ⚙️ Panel Admina
            </h1>
            <p style={{ fontSize: 11, marginTop: 4, margin: "4px 0 0" }}>
              {hasUnsaved
                ? <span style={{ color: "#fbbf24", fontWeight: 600 }}>● Niezapisane zmiany</span>
                : lastSaved
                ? <span style={{ color: "rgba(255,255,255,0.28)" }}>✓ Zapisano o {lastSaved}</span>
                : <span style={{ color: "rgba(255,255,255,0.28)" }}>Wprowadź zmiany i kliknij Zapisz</span>
              }
            </p>
          </div>

          {/* Przyciski akcji */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Reset — tylko gdy są niezapisane zmiany */}
            {hasUnsaved && (
              <button
                onClick={handleReset}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 16px", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "'Inter', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", transition: "all 0.2s ease", whiteSpace: "nowrap" }}
              >
                ↺ Cofnij
              </button>
            )}
            <SaveButton state={saveState} onClick={handleSave} hasUnsaved={hasUnsaved}/>
          </div>
        </div>

        {/* ── Sekcje ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── STATUS ── */}
          <AdminSection title="Status" emoji="🟢">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Dostępny na współpracę:</span>
              <ToggleButton
                active={data.status.available}
                onLabel="✓ Otwarty"
                offLabel="✗ Niedostępny"
                onClick={() => update(["status", "available"], !data.status.available)}
              />
            </div>
            <Field
              label="Tekst statusu (widoczny na stronie)"
              value={data.status.text}
              onChange={(v) => update(["status", "text"], v)}
              placeholder="np. Otwarty na współpracę"
            />
            <Field
              label="Info o streamie"
              value={data.status.streamInfo}
              onChange={(v) => update(["status", "streamInfo"], v)}
              placeholder="np. Stream w każdy piątek 20:00"
            />
          </AdminSection>

          {/* ── STATYSTYKI ── */}
          <AdminSection title="Statystyki" emoji="📊" collapsible>
            {(["subscribers", "views", "followers"] as const).map((key) => {
              const labels = {
                subscribers: "YouTube — Subskrybenci",
                views:       "Łącznie — Wyświetlenia",
                followers:   "Instagram — Obserwujący",
              };
              return (
                <div key={key}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>
                    {labels[key]}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10 }}>
                    <Field
                      label="Wartość liczbowa"
                      value={data.stats[key].value}
                      onChange={(v) => update(["stats", key, "value"], Number(v))}
                      type="number"
                    />
                    <Field
                      label="Wyświetlane (np. 592K)"
                      value={data.stats[key].display}
                      onChange={(v) => update(["stats", key, "display"], v)}
                      placeholder="592K"
                    />
                    <Field
                      label="Suffix"
                      value={data.stats[key].suffix}
                      onChange={(v) => update(["stats", key, "suffix"], v)}
                      placeholder="K"
                    />
                  </div>
                </div>
              );
            })}
          </AdminSection>

          {/* ── LINKI ── */}
          <AdminSection title={`Linki (${data.links.filter((l) => l.visible).length}/${data.links.length} widocznych)`} emoji="🔗" collapsible>
            {data.links.map((link, i) => (
              <div
                key={link.id}
                style={{
                  background:    link.visible ? "rgba(108,99,255,0.04)" : "rgba(255,255,255,0.02)",
                  border:        `1px solid ${link.visible ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius:  10,
                  padding:       "14px",
                  display:       "flex",
                  flexDirection: "column",
                  gap:           10,
                  opacity:       link.visible ? 1 : 0.45,
                  transition:    "opacity 0.2s ease, border-color 0.2s ease, background 0.2s ease",
                }}
              >
                {/* Nagłówek linku */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: link.color, display: "flex", alignItems: "center", gap: 6 }}>
                    {link.emoji} {link.label}
                  </span>
                  <ToggleButton
                    active={link.visible}
                    onLabel="👁 Widoczny"
                    offLabel="🚫 Ukryty"
                    onClick={() => update(["links", String(i), "visible"], !link.visible)}
                  />
                </div>

                {/* Pola linku */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field
                    label="Etykieta"
                    value={link.label}
                    onChange={(v) => update(["links", String(i), "label"], v)}
                  />
                  <Field
                    label="Podtytuł"
                    value={link.sub}
                    onChange={(v) => update(["links", String(i), "sub"], v)}
                  />
                </div>
                <Field
                  label="URL"
                  value={link.url}
                  onChange={(v) => update(["links", String(i), "url"], v)}
                  type="url"
                  placeholder="https://"
                />
              </div>
            ))}
          </AdminSection>

          {/* ── PROFIL ── */}
          <AdminSection title="Profil" emoji="👤">
            <Field
              label="Nazwa (widoczna w nagłówku)"
              value={data.profile.name}
              onChange={(v) => update(["profile", "name"], v)}
            />
            <Field
              label="Tagline"
              value={data.profile.tagline}
              onChange={(v) => update(["profile", "tagline"], v)}
              placeholder="np. Polski Streamer & Twórca"
            />
            <Field
              label="Preferowany kontakt"
              value={data.profile.preferred}
              onChange={(v) => update(["profile", "preferred"], v)}
              placeholder="np. Discord"
            />
          </AdminSection>

        </div>

        {/* ── Stopka ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <a
            href="/"
            style={{ fontSize: 11, color: "rgba(108,99,255,0.55)", fontWeight: 600, letterSpacing: "0.06em", textDecoration: "none", transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(167,139,250,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(108,99,255,0.55)")}
          >
            ← Wróć do strony głównej
          </a>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.1)", fontWeight: 500, letterSpacing: "0.04em" }}>
            MALTIXON Admin Panel
          </span>
        </div>

      </div>
    </div>
  );
}

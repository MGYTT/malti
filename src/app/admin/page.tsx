"use client";

import { useState, useEffect, useCallback } from "react";

// ── Typy ─────────────────────────────────────────────────
type ContentData = {
  stats: {
    subscribers: { value: number; display: string; suffix: string };
    views:       { value: number; display: string; suffix: string };
    followers:   { value: number; display: string; suffix: string };
  };
  status: {
    available:  boolean;
    text:       string;
    streamInfo: string;
  };
  profile: {
    name:      string;
    tagline:   string;
    preferred: string;
  };
  links: Array<{
    id:      string;
    label:   string;
    sub:     string;
    url:     string;
    emoji:   string;
    color:   string;
    visible: boolean;
  }>;
};

type SaveState = "idle" | "saving" | "success" | "error";

// ── Komponent — input field ───────────────────────────────
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label:    string;
  value:    string | number;
  onChange: (v: string) => void;
  type?:    string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontSize:      10,
          fontWeight:    700,
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          color:         "rgba(255,255,255,0.4)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background:   "rgba(255,255,255,0.05)",
          border:       "1px solid rgba(108,99,255,0.25)",
          borderRadius: 8,
          padding:      "8px 12px",
          color:        "#e2e8f0",
          fontSize:     13,
          fontFamily:   "'Inter', sans-serif",
          outline:      "none",
          width:        "100%",
          transition:   "border-color 0.2s ease",
        }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(108,99,255,0.6)")}
        onBlur={(e)  => (e.target.style.borderColor = "rgba(108,99,255,0.25)")}
      />
    </div>
  );
}

// ── Komponent — sekcja panelu ─────────────────────────────
function AdminSection({
  title,
  emoji,
  children,
}: {
  title:    string;
  emoji:    string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background:   "rgba(255,255,255,0.03)",
        border:       "1px solid rgba(108,99,255,0.15)",
        borderRadius: 14,
        padding:      "18px 20px",
        display:      "flex",
        flexDirection:"column",
        gap:          14,
      }}
    >
      <h2
        style={{
          fontSize:      11,
          fontWeight:    800,
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
          color:         "#a78bfa",
          display:       "flex",
          alignItems:    "center",
          gap:           7,
        }}
      >
        <span>{emoji}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

// ── Główny panel ──────────────────────────────────────────
export default function AdminPage() {
  const [password,    setPassword]    = useState("");
  const [authed,      setAuthed]      = useState(false);
  const [authError,   setAuthError]   = useState(false);
  const [data,        setData]        = useState<ContentData | null>(null);
  const [saveState,   setSaveState]   = useState<SaveState>("idle");
  const [lastSaved,   setLastSaved]   = useState<string | null>(null);

  // ── Wczytaj dane po zalogowaniu ───────────────────────
  useEffect(() => {
    if (!authed) return;
    fetch("/api/content")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, [authed]);

  // ── Logowanie ─────────────────────────────────────────
  function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setAuthError(false);

  fetch("/api/content", {
    method:  "POST",
    headers: {
      "Content-Type":     "application/json",
      "x-admin-password": password,
    },
    body: JSON.stringify({}), // puste body = test hasła
  }).then(async (r) => {
    if (r.ok) {
      // 200 — hasło poprawne
      setAuthed(true);
    } else if (r.status === 401) {
      // 401 — złe hasło
      setAuthError(true);
    } else {
      setAuthError(true);
    }
  }).catch(() => setAuthError(true));
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

  // ── Update helper ─────────────────────────────────────
  function update(path: string[], value: unknown) {
    setData((prev) => {
      if (!prev) return prev;
      const next  = structuredClone(prev);
      let   node: Record<string, unknown> = next as never;
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
      <div
        style={{
          minHeight:      "100vh",
          background:     "#07070f",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontFamily:     "'Inter', sans-serif",
          padding:        20,
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background:   "rgba(255,255,255,0.03)",
            border:       "1px solid rgba(108,99,255,0.2)",
            borderRadius: 18,
            padding:      "32px 28px",
            width:        "100%",
            maxWidth:     340,
            display:      "flex",
            flexDirection:"column",
            gap:          18,
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔐</div>
            <h1
              style={{
                fontSize:      18,
                fontWeight:    900,
                color:         "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              Panel Admina
            </h1>
            <p
              style={{
                fontSize: 12,
                color:    "rgba(255,255,255,0.3)",
                marginTop: 4,
              }}
            >
              MALTIXON — zarządzanie treścią
            </p>
          </div>

          {/* Input hasła */}
          <Field
            label="Hasło"
            value={password}
            onChange={setPassword}
            type="password"
          />

          {/* Error */}
          {authError && (
            <p
              style={{
                fontSize:  11,
                color:     "#f87171",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              ❌ Nieprawidłowe hasło
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            style={{
              background:   "linear-gradient(135deg,#6c63ff,#a855f7)",
              border:       "none",
              borderRadius: 10,
              padding:      "11px 0",
              color:        "#fff",
              fontWeight:   800,
              fontSize:     13,
              cursor:       "pointer",
              fontFamily:   "'Inter', sans-serif",
              letterSpacing:"0.04em",
            }}
          >
            Zaloguj się
          </button>
        </form>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          minHeight:      "100vh",
          background:     "#07070f",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          color:          "rgba(255,255,255,0.4)",
          fontFamily:     "'Inter', sans-serif",
          fontSize:       13,
        }}
      >
        Ładowanie danych...
      </div>
    );
  }

  // ── Panel główny ──────────────────────────────────────
  return (
    <div
      style={{
        minHeight:   "100vh",
        background:  "#07070f",
        fontFamily:  "'Inter', sans-serif",
        color:       "#e2e8f0",
        padding:     "clamp(20px, 5vw, 40px) clamp(16px, 5vw, 24px)",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* ── Nagłówek ── */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            flexWrap:       "wrap",
            gap:            12,
            marginBottom:   28,
          }}
        >
          <div>
            <h1
              style={{
                fontSize:      22,
                fontWeight:    900,
                letterSpacing: "-0.02em",
                color:         "#fff",
              }}
            >
              ⚙️ Panel Admina
            </h1>
            <p
              style={{
                fontSize:  11,
                color:     "rgba(255,255,255,0.28)",
                marginTop: 3,
              }}
            >
              {lastSaved
                ? `Ostatni zapis: ${lastSaved}`
                : "Wprowadź zmiany i kliknij Zapisz"}
            </p>
          </div>

          {/* Przycisk zapisu */}
          <button
            onClick={handleSave}
            disabled={saveState === "saving"}
            style={{
              background:   saveState === "success"
                ? "linear-gradient(135deg,#22c55e,#16a34a)"
                : saveState === "error"
                ? "linear-gradient(135deg,#ef4444,#dc2626)"
                : "linear-gradient(135deg,#6c63ff,#a855f7)",
              border:       "none",
              borderRadius: 10,
              padding:      "10px 22px",
              color:        "#fff",
              fontWeight:   800,
              fontSize:     12,
              cursor:       saveState === "saving" ? "not-allowed" : "pointer",
              fontFamily:   "'Inter', sans-serif",
              letterSpacing:"0.06em",
              textTransform:"uppercase" as const,
              minWidth:     110,
              transition:   "background 0.3s ease",
            }}
          >
            {saveState === "saving"  ? "⏳ Zapisuję..." :
             saveState === "success" ? "✅ Zapisano!"   :
             saveState === "error"   ? "❌ Błąd!"       :
             "💾 Zapisz"}
          </button>
        </div>

        {/* ── Sekcje ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Status */}
          <AdminSection title="Status" emoji="🟢">
            <div
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        10,
              }}
            >
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                Dostępny na współpracę:
              </span>
              <button
                onClick={() => update(["status", "available"], !data.status.available)}
                style={{
                  background:   data.status.available
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(239,68,68,0.15)",
                  border:       `1px solid ${data.status.available
                    ? "rgba(34,197,94,0.4)"
                    : "rgba(239,68,68,0.4)"}`,
                  borderRadius: 999,
                  padding:      "4px 14px",
                  color:        data.status.available ? "#4ade80" : "#f87171",
                  fontSize:     11,
                  fontWeight:   700,
                  cursor:       "pointer",
                  fontFamily:   "'Inter', sans-serif",
                  transition:   "all 0.2s ease",
                }}
              >
                {data.status.available ? "✓ Otwarty" : "✗ Niedostępny"}
              </button>
            </div>
            <Field
              label="Tekst statusu"
              value={data.status.text}
              onChange={(v) => update(["status", "text"], v)}
            />
            <Field
              label="Info o streamie"
              value={data.status.streamInfo}
              onChange={(v) => update(["status", "streamInfo"], v)}
            />
          </AdminSection>

          {/* Statystyki */}
          <AdminSection title="Statystyki" emoji="📊">
            {(["subscribers", "views", "followers"] as const).map((key) => (
              <div
                key={key}
                style={{
                  display:             "grid",
                  gridTemplateColumns: "1fr 1fr 80px",
                  gap:                 10,
                }}
              >
                <Field
                  label={`${key} — wartość`}
                  value={data.stats[key].value}
                  onChange={(v) => update(["stats", key, "value"], Number(v))}
                  type="number"
                />
                <Field
                  label="Display (np. 592K)"
                  value={data.stats[key].display}
                  onChange={(v) => update(["stats", key, "display"], v)}
                />
                <Field
                  label="Suffix"
                  value={data.stats[key].suffix}
                  onChange={(v) => update(["stats", key, "suffix"], v)}
                />
              </div>
            ))}
          </AdminSection>

          {/* Linki */}
          <AdminSection title="Linki" emoji="🔗">
            {data.links.map((link, i) => (
              <div
                key={link.id}
                style={{
                  background:   "rgba(255,255,255,0.025)",
                  border:       `1px solid ${link.visible
                    ? "rgba(108,99,255,0.2)"
                    : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 10,
                  padding:      "14px 14px",
                  display:      "flex",
                  flexDirection:"column",
                  gap:          10,
                  opacity:      link.visible ? 1 : 0.5,
                  transition:   "opacity 0.2s ease, border-color 0.2s ease",
                }}
              >
                {/* Nagłówek linku */}
                <div
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize:  12,
                      fontWeight: 700,
                      color:     link.color,
                      display:   "flex",
                      gap:       6,
                    }}
                  >
                    {link.emoji} {link.label}
                  </span>

                  {/* Toggle widoczności */}
                  <button
                    onClick={() => update(["links", String(i), "visible"], !link.visible)}
                    style={{
                      background:   link.visible
                        ? "rgba(108,99,255,0.12)"
                        : "rgba(255,255,255,0.05)",
                      border:       "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6,
                      padding:      "3px 10px",
                      color:        link.visible
                        ? "#a78bfa"
                        : "rgba(255,255,255,0.3)",
                      fontSize:     10,
                      fontWeight:   700,
                      cursor:       "pointer",
                      fontFamily:   "'Inter', sans-serif",
                    }}
                  >
                    {link.visible ? "👁 Widoczny" : "🚫 Ukryty"}
                  </button>
                </div>

                {/* Pola linku */}
                <div
                  style={{
                    display:             "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap:                 8,
                  }}
                >
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
                />
              </div>
            ))}
          </AdminSection>

          {/* Profil */}
          <AdminSection title="Profil" emoji="👤">
            <Field
              label="Nazwa"
              value={data.profile.name}
              onChange={(v) => update(["profile", "name"], v)}
            />
            <Field
              label="Tagline"
              value={data.profile.tagline}
              onChange={(v) => update(["profile", "tagline"], v)}
            />
            <Field
              label="Preferowany kontakt"
              value={data.profile.preferred}
              onChange={(v) => update(["profile", "preferred"], v)}
            />
          </AdminSection>

        </div>

        {/* ── Link do strony ── */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a
            href="/"
            style={{
              fontSize:      11,
              color:         "rgba(108,99,255,0.55)",
              fontWeight:    600,
              letterSpacing: "0.06em",
              textDecoration:"none",
            }}
          >
            ← Wróć do strony głównej
          </a>
        </div>

      </div>
    </div>
  );
}

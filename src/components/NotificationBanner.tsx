// src/components/NotificationBanner.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import type { ContentNotification, NotificationVariant } from "@/types/content";

// ── Paleta kolorów per wariant ────────────────────────────
const VARIANTS: Record<NotificationVariant, {
  bg:      string;
  border:  string;
  glow:    string;
  accent:  string;
  badge:   string;
  badgeBg: string;
  dot:     string;
}> = {
  stream: {
    bg:      "linear-gradient(135deg,rgba(108,99,255,0.12),rgba(168,85,247,0.08))",
    border:  "rgba(108,99,255,0.35)",
    glow:    "rgba(108,99,255,0.2)",
    accent:  "#a78bfa",
    badge:   "NA ŻYWO",
    badgeBg: "rgba(108,99,255,0.2)",
    dot:     "#a78bfa",
  },
  info: {
    bg:      "linear-gradient(135deg,rgba(59,130,246,0.12),rgba(37,99,235,0.06))",
    border:  "rgba(59,130,246,0.3)",
    glow:    "rgba(59,130,246,0.15)",
    accent:  "#60a5fa",
    badge:   "INFO",
    badgeBg: "rgba(59,130,246,0.15)",
    dot:     "#60a5fa",
  },
  alert: {
    bg:      "linear-gradient(135deg,rgba(251,191,36,0.1),rgba(245,158,11,0.06))",
    border:  "rgba(251,191,36,0.35)",
    glow:    "rgba(251,191,36,0.15)",
    accent:  "#fbbf24",
    badge:   "WAŻNE",
    badgeBg: "rgba(251,191,36,0.15)",
    dot:     "#fbbf24",
  },
  success: {
    bg:      "linear-gradient(135deg,rgba(34,197,94,0.1),rgba(22,163,74,0.06))",
    border:  "rgba(34,197,94,0.3)",
    glow:    "rgba(34,197,94,0.15)",
    accent:  "#4ade80",
    badge:   "NOWE",
    badgeBg: "rgba(34,197,94,0.12)",
    dot:     "#4ade80",
  },
  promo: {
    bg:      "linear-gradient(135deg,rgba(236,72,153,0.1),rgba(168,85,247,0.08))",
    border:  "rgba(236,72,153,0.3)",
    glow:    "rgba(236,72,153,0.15)",
    accent:  "#f472b6",
    badge:   "EVENT",
    badgeBg: "rgba(236,72,153,0.12)",
    dot:     "#f472b6",
  },
};

// ── Hook — dismissed IDs z localStorage ──────────────────
function useDismissed() {
  const KEY = "maltixon:dismissed";
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [ready, setReady]         = useState(false);

  // Odczyt dopiero po montażu — unikamy hydration mismatch
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setDismissed(new Set<string>(parsed));
        }
      }
    } catch {
      // localStorage niedostępny (SSR, private mode) — ignoruj
    } finally {
      setReady(true);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set<string>(prev);
      next.add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignoruj
      }
      return next;
    });
  }, []);

  return { dismissed, dismiss, ready };
}

// ── Pojedynczy banner ─────────────────────────────────────
function Banner({
  notification: n,
  onDismiss,
  index,
}: {
  notification: ContentNotification;
  onDismiss:    (id: string) => void;
  index:        number;
}) {
  const v = VARIANTS[n.variant] ?? VARIANTS.info;

  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Wejście z opóźnieniem per index
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const handleDismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onDismiss(n.id), 380);
  }, [n.id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:     "relative",
        overflow:     "hidden",
        borderRadius: 14,
        background:   v.bg,
        border:       `1px solid ${v.border}`,
        boxShadow:    hovered
          ? `0 8px 32px ${v.glow}, 0 0 0 1px ${v.border}`
          : `0 4px 20px ${v.glow}`,
        opacity:   visible && !leaving ? 1 : 0,
        transform: visible && !leaving
          ? "translateY(0px) scale(1)"
          : leaving
          ? "translateY(-8px) scale(0.97)"
          : "translateY(12px) scale(0.98)",
        transition: leaving
          ? "opacity 0.35s ease, transform 0.35s ease, box-shadow 0.25s ease"
          : [
              `opacity   0.45s cubic-bezier(.22,1,.36,1) ${index * 60}ms`,
              `transform 0.45s cubic-bezier(.22,1,.36,1) ${index * 60}ms`,
              "box-shadow 0.25s ease",
            ].join(", "),
      }}
    >
      {/* Shimmer — linia na górze */}
      <div
        aria-hidden="true"
        style={{
          position:   "absolute",
          top:        0,
          left:       0,
          right:      0,
          height:     2,
          background: `linear-gradient(90deg, transparent, ${v.accent}, transparent)`,
          opacity:    hovered ? 1 : 0.5,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Zawartość */}
      <div style={{
        padding:     "12px 14px",
        display:     "flex",
        alignItems:  "flex-start",
        gap:         12,
      }}>

        {/* Emoji + pulsujący dot */}
        <div style={{ position: "relative", flexShrink: 0, marginTop: 1 }}>
          <span style={{
            fontSize:   20,
            lineHeight: 1,
            display:    "block",
            filter:     `drop-shadow(0 0 8px ${v.accent})`,
          }}>
            {n.emoji}
          </span>
          <span
            aria-hidden="true"
            style={{
              position:     "absolute",
              bottom:       -2,
              right:        -2,
              width:        7,
              height:       7,
              borderRadius: "50%",
              background:   v.dot,
              border:       "1.5px solid #07070f",
              display:      "block",
              animation:    "notifPulse 2.5s ease-out infinite",
            }}
          />
        </div>

        {/* Tekst */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Badge + tytuł */}
          <div style={{
            display:    "flex",
            alignItems: "center",
            flexWrap:   "wrap",
            gap:        8,
            marginBottom: n.message ? 4 : n.url ? 6 : 0,
          }}>
            <span style={{
              fontFamily:    "'Inter', sans-serif",
              fontSize:      "8px",
              fontWeight:    800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color:         v.accent,
              background:    v.badgeBg,
              border:        `1px solid ${v.border}`,
              borderRadius:  5,
              padding:       "2px 7px",
              flexShrink:    0,
              userSelect:    "none",
            }}>
              {v.badge}
            </span>
            <span style={{
              fontFamily:    "'Inter', sans-serif",
              fontSize:      "13px",
              fontWeight:    800,
              color:         "#ffffff",
              letterSpacing: "-0.01em",
              lineHeight:    1.2,
              wordBreak:     "break-word",
            }}>
              {n.title}
            </span>
          </div>

          {/* Wiadomość */}
          {!!n.message && (
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize:   "11px",
              color:      "rgba(255,255,255,0.5)",
              fontWeight: 400,
              lineHeight: 1.5,
              margin:     n.url ? "0 0 8px" : "0",
              wordBreak:  "break-word",
            }}>
              {n.message}
            </p>
          )}

          {/* Link CTA */}
          {!!n.url && !!n.urlLabel && (
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                gap:            5,
                fontFamily:     "'Inter', sans-serif",
                fontSize:       "11px",
                fontWeight:     700,
                color:          v.accent,
                textDecoration: "none",
                letterSpacing:  "0.02em",
                transition:     "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {n.urlLabel}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          )}
        </div>

        {/* Przycisk zamknięcia */}
        {n.dismissible && (
          <button
            onClick={handleDismiss}
            aria-label="Zamknij powiadomienie"
            style={{
              flexShrink:     0,
              width:          22,
              height:         22,
              borderRadius:   6,
              background:     "rgba(255,255,255,0.05)",
              border:         "1px solid rgba(255,255,255,0.08)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              cursor:         "pointer",
              color:          "rgba(255,255,255,0.3)",
              transition:     "all 0.2s ease",
              marginTop:      1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color      = "rgba(255,255,255,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color      = "rgba(255,255,255,0.3)";
            }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6"  x2="6"  y2="18"/>
              <line x1="6"  y1="6"  x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Główny komponent ──────────────────────────────────────
export default function NotificationBanner({
  notifications,
}: {
  notifications: ContentNotification[];
}) {
  const { dismissed, dismiss, ready } = useDismissed();

  // Nie renderuj nic dopóki localStorage nie jest odczytany
  // (unika hydration mismatch)
  if (!ready) return null;

  // Filtruj: tylko visible, nie-dismissed i nie-wygasłe
  const active = (notifications ?? []).filter((n) => {
    if (!n?.visible)          return false;
    if (dismissed.has(n.id))  return false;
    if (n.expiresAt) {
      try {
        const expires = new Date(n.expiresAt);
        if (!isNaN(expires.getTime()) && expires < new Date()) return false;
      } catch {
        // nieprawidłowa data — ignoruj
      }
    }
    return true;
  });

  if (active.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes notifPulse {
          0%   { box-shadow: 0 0 0 0px rgba(167,139,250,0.7); }
          70%  { box-shadow: 0 0 0 5px rgba(167,139,250,0);   }
          100% { box-shadow: 0 0 0 0px rgba(167,139,250,0);   }
        }
      `}</style>

      <div
        role="region"
        aria-label="Powiadomienia"
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        {active.map((n, i) => (
          <Banner
            key={n.id}
            notification={n}
            onDismiss={dismiss}
            index={i}
          />
        ))}
      </div>
    </>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";

// ── Typy ─────────────────────────────────────────────────
type ContactItem = {
  id:       string;
  type:     "discord" | "email";
  label:    string;
  value:    string;
  href:     string;
  icon:     React.ReactNode;
  hint:     string;
};

type CopyState = "idle" | "copying" | "success" | "error";

// ── Ikony SVG ─────────────────────────────────────────────
function DiscordIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#7289da">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0
               0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0
               0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0
               0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0
               0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.036.021.07
               .043.093a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0
               0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0
               0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0
               1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0
               1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0
               1 .078.01c.12.098.246.198.373.292a.077.077 0 0
               1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0
               0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0
               0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0
               0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0
               0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419
               0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157
               2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183
               0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419
               1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="rgba(167,139,250,0.9)" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="3"
         strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5"
         strokeLinecap="round"
         style={{ animation: "spin 0.7s linear infinite" }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83
               M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5"
         strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
}

// ── Dane kontaktowe ───────────────────────────────────────
const CONTACTS: ContactItem[] = [
  {
    id:    "discord",
    type:  "discord",
    label: "Discord",
    value: "maltixon69",
    href:  "https://discord.gg/FqAB4cB4pB",
    icon:  <DiscordIcon />,
    hint:  "Napisz DM lub dołącz do serwera",
  },
  {
    id:    "email",
    type:  "email",
    label: "E-mail",
    value: "premkamaltiego@gmail.com",
    href:  "mailto:premkamaltiego@gmail.com",
    icon:  <EmailIcon />,
    hint:  "Odpowiedź w ciągu 24–48h",
  },
];

// ── Konfiguracja stanów przycisku kopiowania ──────────────
const COPY_CONFIG: Record<
  CopyState,
  { icon: React.ReactNode; label: string; bg: string; border: string; color: string }
> = {
  idle: {
    icon:   <CopyIcon />,
    label:  "Kopiuj",
    bg:     "rgba(108,99,255,0.1)",
    border: "rgba(108,99,255,0.2)",
    color:  "rgba(255,255,255,0.38)",
  },
  copying: {
    icon:   <SpinnerIcon />,
    label:  "...",
    bg:     "rgba(108,99,255,0.12)",
    border: "rgba(108,99,255,0.25)",
    color:  "rgba(255,255,255,0.5)",
  },
  success: {
    icon:   <CheckIcon />,
    label:  "Skopiowano",
    bg:     "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.35)",
    color:  "#4ade80",
  },
  error: {
    icon:   <ErrorIcon />,
    label:  "Błąd",
    bg:     "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    color:  "#f87171",
  },
};

// ── Hook — kopiowanie do schowka ──────────────────────────
function useCopyToClipboard(value: string, fallbackHref: string) {
  const [state, setState] = useState<CopyState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  async function copy(e: React.MouseEvent) {
    e.preventDefault();
    if (state !== "idle") return;

    setState("copying");

    try {
      await navigator.clipboard.writeText(value);
      setState("success");
    } catch {
      // Fallback — selektywne kopiowanie przez input
      try {
        const input = document.createElement("input");
        input.value = value;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        setState("success");
      } catch {
        setState("error");
        // Otwórz href jako ostateczny fallback
        window.open(fallbackHref, "_blank");
      }
    }

    timerRef.current = setTimeout(() => setState("idle"), 2200);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { state, copy };
}

// ── Hook — animacja wejścia ───────────────────────────────
function useMounted(delay = 0) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return mounted;
}

// ── Pojedynczy wiersz kontaktu ────────────────────────────
function ContactRow({ item, index }: { item: ContactItem; index: number }) {
  const { state, copy } = useCopyToClipboard(item.value, item.href);
  const mounted         = useMounted(200 + index * 100);
  const cfg             = COPY_CONFIG[state];

  return (
    <div
      style={{
        opacity:    mounted ? 1 : 0,
        transform:  mounted ? "translateX(0)" : "translateX(-10px)",
        transition: `opacity 0.4s ease ${index * 0.08}s,
                     transform 0.4s ease ${index * 0.08}s`,
      }}
    >
      {/* Separator między wierszami */}
      {index > 0 && (
        <div
          className="mx-1 my-2.5"
          style={{ height: 1, background: "rgba(108,99,255,0.1)" }}
        />
      )}

      <div className="flex items-center gap-3">

        {/* Ikona platformy */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(108,99,255,0.12)",
            border:     "1px solid rgba(108,99,255,0.18)",
          }}
        >
          {item.icon}
        </div>

        {/* Tekst — klikalny link */}
        <a
          href={item.href}
          target={item.type === "email" ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="flex flex-col min-w-0 flex-1 group"
          style={{ textDecoration: "none" }}
        >
          {/* Label + hint */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              style={{
                fontSize:      "9px",
                fontWeight:    700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color:         "rgba(255,255,255,0.28)",
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontSize:  "9px",
                color:     "rgba(255,255,255,0.18)",
                fontWeight: 400,
              }}
            >
              • {item.hint}
            </span>
          </div>

          {/* Wartość */}
          <span
            className="truncate transition-colors duration-200
                       group-hover:text-white"
            style={{
              fontSize:  "12px",
              fontWeight: 600,
              color:     "#c4b5fd",
            }}
          >
            {item.value}
          </span>
        </a>

        {/* Przycisk kopiowania */}
        <button
          onClick={copy}
          disabled={state === "copying"}
          aria-label={`Kopiuj ${item.label}: ${item.value}`}
          title={cfg.label}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-xl
                     transition-all duration-200 cursor-pointer outline-none
                     focus-visible:ring-2 focus-visible:ring-violet-500"
          style={{
            padding:    "5px 10px",
            background: cfg.bg,
            border:     `1px solid ${cfg.border}`,
            color:      cfg.color,
          }}
        >
          {cfg.icon}
          <span style={{ fontSize: "10px", fontWeight: 700 }}>
            {cfg.label}
          </span>
        </button>

      </div>
    </div>
  );
}

// ── Status dot ────────────────────────────────────────────
function StatusDot() {
  return (
    <span className="ml-auto flex items-center gap-1.5">
      <span
        className="block w-1.5 h-1.5 rounded-full"
        style={{
          background: "#22c55e",
          boxShadow:  "0 0 6px rgba(34,197,94,0.8)",
          animation:  "pulseDot 2s ease-out infinite",
        }}
      />
      <span
        style={{
          fontSize:      "9px",
          fontWeight:    700,
          letterSpacing: "0.06em",
          color:         "#4ade80",
          textTransform: "uppercase",
        }}
      >
        Otwarty na współpracę
      </span>
    </span>
  );
}

// ── Główny komponent ──────────────────────────────────────
export default function CollabSection() {
  const mounted = useMounted(100);

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulseDot {
          0%  { box-shadow: 0 0 0 0   rgba(34,197,94,0.6); }
          70% { box-shadow: 0 0 0 6px rgba(34,197,94,0);   }
          100%{ box-shadow: 0 0 0 0   rgba(34,197,94,0);   }
        }
      `}</style>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.45s ease, transform 0.45s ease",
          background: "rgba(108,99,255,0.05)",
          border:     "1px solid rgba(108,99,255,0.14)",
        }}
      >

        {/* ── Nagłówek ── */}
        <div
          className="flex items-center gap-2.5 px-4 py-3"
          style={{
            borderBottom: "1px solid rgba(108,99,255,0.1)",
            background:   "rgba(108,99,255,0.05)",
          }}
        >
          {/* Ikona teczki */}
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center
                       text-xs flex-shrink-0"
            style={{ background: "rgba(108,99,255,0.18)" }}
          >
            💼
          </div>

          {/* Tytuł */}
          <span
            style={{
              fontSize:      "10px",
              fontWeight:    800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color:         "#a78bfa",
            }}
          >
            Współpraca biznesowa
          </span>

          {/* Status */}
          <StatusDot />
        </div>

        {/* ── Wiersze kontaktowe ── */}
        <div className="px-4 py-3 flex flex-col">
          {CONTACTS.map((item, i) => (
            <ContactRow key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* ── Stopka ── */}
        <div
          className="px-4 py-2.5 flex items-center gap-2"
          style={{
            borderTop:  "1px solid rgba(108,99,255,0.08)",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <svg
            width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.2)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span
            style={{
              fontSize: "10px",
              color:    "rgba(255,255,255,0.22)",
              fontWeight: 500,
            }}
          >
            Czas odpowiedzi: 24–48h
          </span>

          {/* Rozdzielacz */}
          <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 10 }}>•</span>

          {/* Preferowany kontakt */}
          <svg
            width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.2)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0
                     1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0
                     1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72
                     c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09
                     9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45
                     c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span
            style={{
              fontSize: "10px",
              color:    "rgba(255,255,255,0.22)",
              fontWeight: 500,
            }}
          >
            Preferowany: Discord
          </span>
        </div>

      </div>
    </>
  );
}

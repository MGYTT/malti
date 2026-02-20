"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ContentStatus } from "@/types/content";

// ── Typy ─────────────────────────────────────────────────
type ContactItem = {
  id:    string;
  type:  "discord" | "email";
  label: string;
  value: string;
  href:  string;
  hint:  string;
  color: string;
  glow:  string;
};

type CopyState = "idle" | "copying" | "success" | "error";

// ── Dane kontaktowe — statyczne (nie zmieniają się z admina) ──
const CONTACTS: ContactItem[] = [
  {
    id:    "discord",
    type:  "discord",
    label: "Discord",
    value: "maltixon69",
    href:  "https://discord.gg/FqAB4cB4pB",
    hint:  "Napisz DM lub dołącz do serwera",
    color: "#7289da",
    glow:  "rgba(114,137,218,0.25)",
  },
  {
    id:    "email",
    type:  "email",
    label: "E-mail",
    value: "premkamaltiego@gmail.com",
    href:  "mailto:premkamaltiego@gmail.com",
    hint:  "Odpowiedź w ciągu 24–48h",
    color: "#a78bfa",
    glow:  "rgba(167,139,250,0.25)",
  },
];

// ── Ikony SVG — bez zmian ─────────────────────────────────
function DiscordIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#7289da" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.036.021.07.043.093a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function EmailIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function CopyIcon()  { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>; }
function CheckIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>; }
function Spinner()   { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spinIcon 0.65s linear infinite", flexShrink: 0 }} aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>; }
function ClockIcon() { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function PhoneIcon() { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>; }

// ── Hook — kopiowanie ─────────────────────────────────────
function useCopyToClipboard(value: string, fallbackHref: string) {
  const [state, setState] = useState<CopyState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const copy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (state !== "idle") return;
    setState("copying");
    try {
      await navigator.clipboard.writeText(value);
      setState("success");
    } catch {
      try {
        const inp = document.createElement("input");
        inp.value = value;
        document.body.appendChild(inp);
        inp.select();
        document.execCommand("copy");
        document.body.removeChild(inp);
        setState("success");
      } catch {
        setState("error");
        window.open(fallbackHref, "_blank");
      }
    }
    timerRef.current = setTimeout(() => setState("idle"), 2400);
  }, [state, value, fallbackHref]);

  useEffect(() => () => clearTimeout(timerRef.current), []);
  return { state, copy };
}

function useMounted(delay = 0) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return mounted;
}

// ── Copy button — bez zmian ───────────────────────────────
function CopyButton({ value, href }: { value: string; href: string }) {
  const { state, copy } = useCopyToClipboard(value, href);

  const cfg = {
    idle:    { icon: <CopyIcon  />, label: "Kopiuj",      bg: "rgba(255,255,255,0.05)",   border: "rgba(255,255,255,0.1)",   color: "rgba(255,255,255,0.4)"  },
    copying: { icon: <Spinner   />, label: "...",          bg: "rgba(108,99,255,0.1)",     border: "rgba(108,99,255,0.25)",   color: "rgba(167,139,250,0.8)"  },
    success: { icon: <CheckIcon />, label: "Skopiowano!",  bg: "rgba(34,197,94,0.1)",      border: "rgba(34,197,94,0.3)",     color: "#4ade80"                },
    error:   { icon: <CopyIcon  />, label: "Błąd",         bg: "rgba(239,68,68,0.1)",      border: "rgba(239,68,68,0.25)",    color: "#f87171"                },
  }[state];

  return (
    <button onClick={copy} disabled={state === "copying"} aria-label={`Kopiuj: ${value}`} title={cfg.label} style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "7px 8px", minWidth: 32, borderRadius: 8, fontSize: "10px", fontWeight: 700, fontFamily: "'Inter', sans-serif", cursor: state === "copying" ? "not-allowed" : "pointer", border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color, transition: "all 0.22s ease", outline: "none", userSelect: "none", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      {cfg.icon}
      <span style={{ display: "none" }} className="copy-label">{cfg.label}</span>
    </button>
  );
}

// ── ContactRow — bez zmian ────────────────────────────────
function ContactRow({ item, index }: { item: ContactItem; index: number }) {
  const mounted   = useMounted(180 + index * 90);
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transition: `opacity 0.4s ease ${index * 0.07}s, transform 0.4s ease ${index * 0.07}s` }}>
      {index > 0 && <div style={{ height: 1, margin: "6px 8px", background: "rgba(255,255,255,0.05)" }}/>}
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, background: hovered ? `${item.color}09` : "transparent", border: `1px solid ${hovered ? `${item.color}22` : "transparent"}`, transition: "background 0.2s ease, border-color 0.2s ease" }}>
        <div style={{ width: 36, height: 36, minWidth: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${item.color}14`, border: `1px solid ${item.color}${hovered ? "35" : "20"}`, boxShadow: hovered ? `0 0 12px ${item.glow}` : "none", transition: "all 0.25s ease" }}>
          {item.type === "discord" ? <DiscordIcon size={16}/> : <EmailIcon size={16}/>}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "nowrap", minWidth: 0 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: item.color, userSelect: "none", flexShrink: 0 }}>{item.label}</span>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "8px", flexShrink: 0, userSelect: "none" }}>•</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "rgba(255,255,255,0.22)", fontWeight: 400, userSelect: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{item.hint}</span>
          </div>
          <a href={item.href} target={item.type === "email" ? undefined : "_blank"} rel="noopener noreferrer" style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(11px, 3vw, 13px)", fontWeight: 700, color: hovered ? "#ffffff" : "rgba(255,255,255,0.75)", transition: "color 0.2s ease", letterSpacing: "-0.01em", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", userSelect: "all", display: "block", minWidth: 0 }} title={item.value}>
            {item.value}
          </a>
        </div>
        <CopyButton value={item.value} href={item.href}/>
      </div>
    </div>
  );
}

// ── StatusBadge — przyjmuje props ─────────────────────────
function StatusBadge({ available, text }: { available: boolean; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto", flexShrink: 0 }}>
      <span style={{ display: "block", width: 6, height: 6, minWidth: 6, borderRadius: "50%", background: available ? "#22c55e" : "#ef4444", boxShadow: `0 0 0 0 ${available ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)"}`, animation: available ? "pulseGreen 2.2s ease-out infinite" : "pulseRed 2.2s ease-out infinite" }}/>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(8px, 2.2vw, 9px)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: available ? "#4ade80" : "#f87171", userSelect: "none", whiteSpace: "nowrap" }}>
        {/* Pełny tekst z content.json */}
        <span className="status-full">{text}</span>
        {/* Skrócony na mobile */}
        <span className="status-short">{available ? "Dostępny" : "Niedostępny"}</span>
      </span>
    </div>
  );
}

// ── FooterInfo — przyjmuje preferred ─────────────────────
function FooterInfo({ preferred }: { preferred: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "5px 12px", padding: "9px 14px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <ClockIcon/>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(9px, 2.5vw, 10px)", color: "rgba(255,255,255,0.25)", fontWeight: 500, userSelect: "none", whiteSpace: "nowrap" }}>
          Odpowiedź: 24–48h
        </span>
      </div>
      <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "10px", userSelect: "none" }}>•</span>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <PhoneIcon/>
        {/* Preferowany kontakt z content.json */}
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(9px, 2.5vw, 10px)", color: "rgba(255,255,255,0.25)", fontWeight: 500, userSelect: "none", whiteSpace: "nowrap" }}>
          Preferowany: {preferred}
        </span>
      </div>
    </div>
  );
}

// ── Główny komponent ──────────────────────────────────────
export default function CollabSection({
  status,
  preferred,
}: {
  status:    ContentStatus;
  preferred: string;
}) {
  const mounted = useMounted(80);

  return (
    <>
      <style>{`
        @keyframes spinIcon   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseGreen { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.7); } 70% { box-shadow: 0 0 0 7px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }
        @keyframes pulseRed   { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); } 70% { box-shadow: 0 0 0 7px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }

        .status-short { display: none; }
        .status-full  { display: inline; }
        @media (max-width: 400px) {
          .status-short { display: inline; }
          .status-full  { display: none; }
        }
        .copy-label { display: none; }
        @media (min-width: 420px) {
          .copy-label { display: inline; }
        }
      `}</style>

      <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(108,99,255,0.14)", background: "rgba(108,99,255,0.04)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.45s ease, transform 0.45s ease" }}>

        {/* Nagłówek */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid rgba(108,99,255,0.1)", background: "rgba(108,99,255,0.06)", minWidth: 0 }}>
          <div style={{ width: 26, height: 26, minWidth: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(108,99,255,0.18)", border: "1px solid rgba(108,99,255,0.25)", fontSize: "12px" }}>
            💼
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(9px, 2.5vw, 10px)", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a78bfa", userSelect: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
            Współpraca
          </span>

          {/* ← STATUS z content.json */}
          <StatusBadge available={status.available} text={status.text}/>
        </div>

        {/* Wiersze kontaktowe */}
        <div style={{ padding: "6px 6px" }}>
          {CONTACTS.map((item, i) => (
            <ContactRow key={item.id} item={item} index={i}/>
          ))}
        </div>

        {/* ← PREFERRED z content.json */}
        <FooterInfo preferred={preferred}/>
      </div>
    </>
  );
}

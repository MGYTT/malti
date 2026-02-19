"use client";

import { useState, useRef, useCallback } from "react";

// ── Typy ─────────────────────────────────────────────────
type SocialItem = {
  id:      string;
  href:    string;
  label:   string;
  icon:    React.ReactNode;
  color:   string;   // kolor akcentu na hover
  glow:    string;   // kolor box-shadow na hover
  tooltip: string;   // tekst tooltipa
  external: boolean;
};

// ── Ikony SVG ─────────────────────────────────────────────
function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136
               C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505
               A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0
               3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136
               c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505
               a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24
               12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818
               12l-6.273 3.568z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="ig-social" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#f09433"/>
          <stop offset="25%"  stopColor="#e6683c"/>
          <stop offset="50%"  stopColor="#dc2743"/>
          <stop offset="75%"  stopColor="#cc2366"/>
          <stop offset="100%" stopColor="#bc1888"/>
        </linearGradient>
      </defs>
      <path fill="url(#ig-social)" d="M12 2.163c3.204 0 3.584.012
        4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069
        1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225
        -1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204
        0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92
        -.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849
        .149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069
        4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2
        -6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0
        3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98
        1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072
        4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073
        -4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78
        -6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403
        0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759
        6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209
        0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791
        4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44
        1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074
               0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27
               0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0
               0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0
               0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.036
               .021.07.043.093a19.9 19.9 0 0 0 5.993 3.03.078.078 0
               0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076
               0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077
               0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0
               1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0
               0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0
               1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0
               0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0
               0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0
               0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061
               0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157
               -2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176
               1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975
               0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419
               2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333
               -.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67
               a2.89 2.89 0 1 1-2.88-2.5c.28 0 .54.04.79.1V9.74
               a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34
               6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34
               V8.69a8.18 8.18 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0
               1-1.02-.06z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2
               2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

// ── Dane social media ─────────────────────────────────────
const SOCIALS: SocialItem[] = [
  {
    id:       "youtube",
    href:     "https://www.youtube.com/@maltixon",
    label:    "YouTube",
    icon:     <YouTubeIcon />,
    color:    "#ff4444",
    glow:     "rgba(255,68,68,0.25)",
    tooltip:  "YouTube • 592K sub",
    external: true,
  },
  {
    id:       "instagram",
    href:     "https://www.instagram.com/maltixon/",
    label:    "Instagram",
    icon:     <InstagramIcon />,
    color:    "#e1306c",
    glow:     "rgba(225,48,108,0.25)",
    tooltip:  "Instagram • 40K follow",
    external: true,
  },
  {
    id:       "discord",
    href:     "https://discord.gg/FqAB4cB4pB",
    label:    "Discord",
    icon:     <DiscordIcon />,
    color:    "#7289da",
    glow:     "rgba(114,137,218,0.28)",
    tooltip:  "Discord • Serwer",
    external: true,
  },
  {
    id:       "tiktok",
    href:     "https://www.tiktok.com/@maltixon",
    label:    "TikTok",
    icon:     <TikTokIcon />,
    color:    "#ffffff",
    glow:     "rgba(255,255,255,0.18)",
    tooltip:  "TikTok • Klipy",
    external: true,
  },
  {
    id:       "email",
    href:     "mailto:premkamaltiego@gmail.com",
    label:    "E-mail",
    icon:     <EmailIcon />,
    color:    "#a78bfa",
    glow:     "rgba(167,139,250,0.25)",
    tooltip:  "E-mail • Kontakt",
    external: false,
  },
];

// ── Tooltip komponent ─────────────────────────────────────
function Tooltip({
  label,
  visible,
}: {
  label:   string;
  visible: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position:      "absolute",
        bottom:        "calc(100% + 10px)",
        left:          "50%",
        transform:     `translateX(-50%) translateY(${visible ? 0 : 4}px)`,
        opacity:       visible ? 1 : 0,
        pointerEvents: "none",
        transition:    "opacity 0.18s ease, transform 0.18s ease",
        whiteSpace:    "nowrap",
        zIndex:        50,
      }}
    >
      {/* Tekst */}
      <span
        className="block px-2.5 py-1 rounded-lg"
        style={{
          fontSize:   "10px",
          fontWeight: 600,
          color:      "rgba(255,255,255,0.85)",
          background: "rgba(15,15,25,0.95)",
          border:     "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(8px)",
          letterSpacing:  "0.02em",
        }}
      >
        {label}
      </span>
      {/* Strzałka tooltipa */}
      <span
        style={{
          position:    "absolute",
          bottom:      -4,
          left:        "50%",
          transform:   "translateX(-50%) rotate(45deg)",
          width:       8,
          height:      8,
          background:  "rgba(15,15,25,0.95)",
          border:      "1px solid rgba(255,255,255,0.1)",
          borderTop:   "none",
          borderLeft:  "none",
        }}
      />
    </div>
  );
}

// ── Pojedyncza ikona social media ─────────────────────────
function SocialButton({ item, index }: { item: SocialItem; index: number }) {
  const [hovered,  setHovered]  = useState(false);
  const [pressed,  setPressed]  = useState(false);
  const [mounted,  setMounted]  = useState(false);

  // Animacja wejścia
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const refEl    = useRef<HTMLAnchorElement>(null);

  // Staggered mount
  useState(() => {
    timerRef.current = setTimeout(
      () => setMounted(true),
      150 + index * 60
    );
  });

  return (
    <div className="relative" style={{ display: "inline-flex" }}>
      <a
        ref={refEl}
        href={item.href}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        aria-label={item.label}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="social-icon focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-violet-500"
        style={{
          // Animacja wejścia
          opacity:   mounted ? 1 : 0,
          transform: mounted
            ? pressed
              ? "translateY(1px) scale(0.93)"
              : hovered
              ? "translateY(-4px) scale(1.08)"
              : "translateY(0px) scale(1)"
            : "translateY(10px) scale(0.85)",
          transition: mounted
            ? pressed
              ? "transform 0.08s ease"
              : "transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.35s ease, box-shadow 0.25s ease, border-color 0.25s ease, color 0.25s ease"
            : `opacity 0.4s ease ${index * 0.06}s, transform 0.4s ease ${index * 0.06}s`,

          // Kolor + glow na hover
          color: hovered ? item.color : "rgba(255,255,255,0.4)",
          ...(hovered
            ? {
                background:   `${item.glow.replace("0.2", "0.12").replace("0.28", "0.1").replace("0.18", "0.08").replace("0.25", "0.1")}`,
                borderColor:  item.color.replace(")", ",0.4)").replace("rgb", "rgba"),
                boxShadow:    `0 4px 20px ${item.glow}, 0 0 0 1px ${item.glow}`,
              }
            : {}),
        }}
      >
        {item.icon}
      </a>

      {/* Tooltip */}
      <Tooltip label={item.tooltip} visible={hovered} />
    </div>
  );
}

// ── Główny komponent ──────────────────────────────────────
export default function SocialIcons() {
  return (
    <>
      <style>{`
        .social-icon {
          position: relative;
        }
      `}</style>

      <div
        className="flex items-center gap-2.5 mb-5"
        role="list"
        aria-label="Profile w mediach społecznościowych"
      >
        {SOCIALS.map((item, i) => (
          <div key={item.id} role="listitem">
            <SocialButton item={item} index={i} />
          </div>
        ))}
      </div>
    </>
  );
}

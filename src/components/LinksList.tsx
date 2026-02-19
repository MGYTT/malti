"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Typy ─────────────────────────────────────────────────
type LinkCategory = "support" | "community" | "social" | "content";

type LinkItem = {
  id:        string;
  href:      string;
  iconBg:    string;
  icon:      React.ReactNode;
  title:     string;
  sub:       string;
  badge?:    { label: string; color: string; bg: string; border: string };
  category:  LinkCategory;
  external:  boolean;
  highlight?: boolean; // czy link ma specjalny glow
};

// ── Ikony SVG ─────────────────────────────────────────────
function DonateSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="#fbbf24" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}

function CryptoSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="#fb923c" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894
               m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97
               m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893
               m-1.215 6.893L3.52 9.219m8.188 1.978-.468-2.654
               m2.168 9.435-.32 1.814"/>
    </svg>
  );
}

function DiscordSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#7289da">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074
               0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27
               0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0
               0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0
               0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.036.021
               .07.043.093a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0
               .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0
               0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0
               1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1
               .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0
               1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006
               .127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041
               .107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084
               .028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0
               .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0
               0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419
               0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157
               2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183
               0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419
               1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157
               2.418z"/>
    </svg>
  );
}

function InstagramSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="ig-v2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#f09433"/>
          <stop offset="25%"  stopColor="#e6683c"/>
          <stop offset="50%"  stopColor="#dc2743"/>
          <stop offset="75%"  stopColor="#cc2366"/>
          <stop offset="100%" stopColor="#bc1888"/>
        </linearGradient>
      </defs>
      <path fill="url(#ig-v2)" d="M12 2.163c3.204 0 3.584.012 4.85.07
        3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849
        0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919
        4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07
        -3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07
        -4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771
        4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259
        0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059
        1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2
        4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072
        3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618
        6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667
        -.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059
        -1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162
        6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163
        c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79
        -4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4
        4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44
        1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TikTokSVG() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67
               a2.89 2.89 0 1 1-2.88-2.5c.28 0 .54.04.79.1V9.74
               a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34
               6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34
               V8.69a8.18 8.18 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0
               1-1.02-.06z"/>
    </svg>
  );
}

function YouTubeSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff4444">
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

// ── Dane linków ───────────────────────────────────────────
const LINKS: LinkItem[] = [
  {
    id:        "donate",
    href:      "https://tipply.pl/@Malti",
    iconBg:    "linear-gradient(135deg,rgba(251,191,36,.2),rgba(245,158,11,.08))",
    icon:      <DonateSVG />,
    title:     "Donate",
    sub:       "Tipply — wesprzyj twórcę",
    badge:     {
      label:  "💛 Wsparcie",
      color:  "rgba(251,191,36,0.9)",
      bg:     "rgba(251,191,36,0.08)",
      border: "rgba(251,191,36,0.2)",
    },
    category:  "support",
    external:  true,
    highlight: true,
  },
  {
    id:       "crypto",
    href:     "https://donation.streamiverse.io/maltixon",
    iconBg:   "linear-gradient(135deg,rgba(251,146,60,.2),rgba(234,88,12,.08))",
    icon:     <CryptoSVG />,
    title:    "Donate Krypto",
    sub:      "Bitcoin, Ethereum i więcej",
    badge:    {
      label:  "₿ Crypto",
      color:  "rgba(251,146,60,0.9)",
      bg:     "rgba(251,146,60,0.08)",
      border: "rgba(251,146,60,0.2)",
    },
    category: "support",
    external: true,
  },
  {
    id:       "discord",
    href:     "https://discord.gg/FqAB4cB4pB",
    iconBg:   "linear-gradient(135deg,rgba(88,101,242,.25),rgba(88,101,242,.08))",
    icon:     <DiscordSVG />,
    title:    "Discord",
    sub:      "Dołącz do społeczności",
    badge:    {
      label:  "💜 Społeczność",
      color:  "rgba(114,137,218,0.9)",
      bg:     "rgba(88,101,242,0.1)",
      border: "rgba(88,101,242,0.25)",
    },
    category: "community",
    external: true,
  },
  {
    id:       "instagram",
    href:     "https://www.instagram.com/maltixon/",
    iconBg:   "linear-gradient(135deg,rgba(225,48,108,.2),rgba(131,58,180,.1))",
    icon:     <InstagramSVG />,
    title:    "Instagram",
    sub:      "@maltixon • 40K obserwujących",
    category: "social",
    external: true,
  },
  {
    id:       "tiktok",
    href:     "https://www.tiktok.com/@maltixon",
    iconBg:   "linear-gradient(135deg,rgba(255,255,255,.1),rgba(0,0,0,.25))",
    icon:     <TikTokSVG />,
    title:    "TikTok",
    sub:      "@maltixon — krótkie klipy",
    badge:    {
      label:  "🎵 Nowe",
      color:  "rgba(255,255,255,0.55)",
      bg:     "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.12)",
    },
    category: "social",
    external: true,
  },
  {
    id:       "youtube",
    href:     "https://www.youtube.com/@maltixon",
    iconBg:   "linear-gradient(135deg,rgba(255,0,0,.22),rgba(180,0,0,.1))",
    icon:     <YouTubeSVG />,
    title:    "YouTube",
    sub:      "@maltixon • 592K subskrybentów",
    badge:    {
      label:  "🔴 Na żywo",
      color:  "rgba(255,100,100,0.9)",
      bg:     "rgba(255,0,0,0.08)",
      border: "rgba(255,0,0,0.2)",
    },
    category: "content",
    external: true,
  },
];

// ── Hook — Intersection Observer (reveal on scroll) ───────
function useReveal(index: number) {
  const ref     = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Startowy delay przed obserwacją
    const init = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShow(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, index * 70);

    return () => clearTimeout(init);
  }, [index]);

  return { ref, show };
}

// ── Hook — hover glow effect ──────────────────────────────
function useHoverGlow() {
  const ref       = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return { ref, pos, hovered, setHovered, onMouseMove };
}

// ── Pojedynczy przycisk linku ─────────────────────────────
function LinkButton({ link, index }: { link: LinkItem; index: number }) {
  const { ref: revealRef, show }        = useReveal(index);
  const { ref, pos, hovered, setHovered, onMouseMove } = useHoverGlow();
  const [pressed, setPressed]           = useState(false);

  return (
    <div
      ref={revealRef}
      style={{
        opacity:    show ? 1 : 0,
        transform:  show
          ? "translateY(0px) scale(1)"
          : "translateY(16px) scale(0.97)",
        transition: `
          opacity   0.5s cubic-bezier(.22,1,.36,1) ${index * 0.065}s,
          transform 0.5s cubic-bezier(.22,1,.36,1) ${index * 0.065}s
        `,
      }}
    >
      <a
        ref={ref}
        href={link.href}
        target={link.external ? "_blank" : undefined}
        rel={link.external ? "noopener noreferrer" : undefined}
        aria-label={link.title}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseMove={onMouseMove}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        className="link-btn"
        style={{
          transform: pressed
            ? "scale(0.982) translateY(1px)"
            : "scale(1) translateY(0px)",
          transition: pressed
            ? "transform 0.1s ease"
            : "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",

          // Highlight glow na hover
          ...(link.highlight && hovered
            ? {
                borderColor: "rgba(251,191,36,0.35)",
                boxShadow:   "0 8px 30px rgba(251,191,36,0.12)",
              }
            : hovered
            ? {
                borderColor: "rgba(108,99,255,0.4)",
                boxShadow:   "0 8px 28px rgba(108,99,255,0.15)",
              }
            : {}),
        }}
      >
        {/* Mouse-follow gradient spotlight */}
        {hovered && (
          <div
            aria-hidden="true"
            style={{
              position:     "absolute",
              pointerEvents:"none",
              borderRadius: "inherit",
              inset:        0,
              background:   `radial-gradient(
                140px circle at ${pos.x}px ${pos.y}px,
                rgba(108,99,255,0.1),
                transparent 80%
              )`,
              transition: "opacity 0.15s ease",
            }}
          />
        )}

        {/* Ikona */}
        <div
          className="link-icon flex-shrink-0"
          style={{ background: link.iconBg }}
          aria-hidden="true"
        >
          {link.icon}
        </div>

        {/* Tekst */}
        <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="link-text-title">{link.title}</span>
            {link.badge && (
              <span
                className="flex-shrink-0 px-1.5 py-0.5 rounded-md leading-none"
                style={{
                  fontSize:      "9px",
                  fontWeight:    700,
                  letterSpacing: "0.04em",
                  color:         link.badge.color,
                  background:    link.badge.bg,
                  border:        `1px solid ${link.badge.border}`,
                }}
              >
                {link.badge.label}
              </span>
            )}
          </div>
          <span className="link-text-sub truncate">{link.sub}</span>
        </div>

        {/* Strzałka */}
        <svg
          className="arrow flex-shrink-0"
          width="15" height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            transition: "transform 0.22s ease, color 0.22s ease",
            transform:  hovered ? "translateX(3px)" : "translateX(0)",
            color:      hovered
              ? "rgba(255,255,255,0.55)"
              : "rgba(255,255,255,0.2)",
          }}
        >
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>
  );
}

// ── Separator kategorii ───────────────────────────────────
function CategoryDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <div
        style={{
          flex:       1,
          height:     1,
          background: "linear-gradient(90deg,rgba(108,99,255,0.15),transparent)",
        }}
      />
      <span
        style={{
          fontSize:      "9px",
          fontWeight:    700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color:         "rgba(255,255,255,0.18)",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex:       1,
          height:     1,
          background: "linear-gradient(90deg,transparent,rgba(108,99,255,0.15))",
        }}
      />
    </div>
  );
}

// ── Grupowanie linków po kategorii ───────────────────────
const CATEGORY_LABELS: Record<LinkCategory, string> = {
  support:   "Wesprzyj",
  community: "Społeczność",
  social:    "Social Media",
  content:   "Treści",
};

// ── Główny komponent ──────────────────────────────────────
export default function LinksList() {
  // Pogrupuj linki po kategorii zachowując kolejność
  const grouped = LINKS.reduce<
    { category: LinkCategory; items: LinkItem[] }[]
  >((acc, link) => {
    const last = acc[acc.length - 1];
    if (last && last.category === link.category) {
      last.items.push(link);
    } else {
      acc.push({ category: link.category, items: [link] });
    }
    return acc;
  }, []);

  let globalIndex = 0;

  return (
    <div
      className="flex flex-col gap-1.5"
      role="list"
      aria-label="Linki do profili i wsparcia"
    >
      {grouped.map(({ category, items }, groupIdx) => (
        <div key={category} role="group" aria-label={CATEGORY_LABELS[category]}>

          {/* Separator między grupami */}
          {groupIdx > 0 && (
            <CategoryDivider label={CATEGORY_LABELS[category]} />
          )}

          <div className="flex flex-col gap-1.5">
            {items.map((link) => {
              const idx = globalIndex++;
              return (
                <div key={link.id} role="listitem">
                  <LinkButton link={link} index={idx} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

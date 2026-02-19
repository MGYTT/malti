"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// ── Typy ─────────────────────────────────────────────────
type Platform = {
  label: string;
  color: string;
  dot:   string;
};

// ── Platformy w rotacji ───────────────────────────────────
const PLATFORMS: Platform[] = [
  { label: "Twitch Streamer",  color: "#a78bfa", dot: "#9146ff" },
  { label: "YouTube Creator",  color: "#f87171", dot: "#ff0000" },
  { label: "Content Creator",  color: "#67e8f9", dot: "#06b6d4" },
  { label: "TikTok Creator",   color: "#f9a8d4", dot: "#ff0050" },
];

// ── Hook — rotacja tekstu ─────────────────────────────────
function useRotatingText(items: Platform[], interval = 2800) {
  const [index,   setIndex]   = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setVisible(true);
      }, 350);
    }, interval);
    return () => clearInterval(id);
  }, [items.length, interval]);

  return { current: items[index], visible };
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

// ── Avatar ze zdjęciem ────────────────────────────────────
function AvatarImage() {
  const [loaded,  setLoaded]  = useState(false);
  const [error,   setError]   = useState(false);

  return (
    <div className="relative flex-shrink-0">

      {/* Obracający się gradient ring */}
      <div
        aria-hidden="true"
        style={{
          position:     "absolute",
          inset:        -2,
          borderRadius: "50%",
          background:   "conic-gradient(from 0deg,#6c63ff,#a855f7,#3b82f6,#a855f7,#6c63ff)",
          animation:    "spinRing 6s linear infinite",
          opacity:      0.85,
        }}
      />

      {/* Statyczny gradient ring (głębia) */}
      <div
        style={{
          position:     "absolute",
          inset:        -2,
          borderRadius: "50%",
          background:   "linear-gradient(135deg,#6c63ff,#a855f7,#3b82f6)",
          opacity:      0.3,
        }}
        aria-hidden="true"
      />

      {/* Kontener zdjęcia */}
      <div
        style={{
          position:     "relative",
          width:         92,
          height:        92,
          borderRadius: "50%",
          overflow:      "hidden",
          border:        "3px solid #0d0d1a",
          background:    "linear-gradient(135deg,rgba(108,99,255,0.2),rgba(168,85,247,0.1))",
          zIndex:        1,
        }}
      >
        {/* Skeleton — widoczny dopóki zdjęcie się nie załaduje */}
        {!loaded && !error && (
          <div
            aria-hidden="true"
            style={{
              position:   "absolute",
              inset:      0,
              background: "linear-gradient(135deg,rgba(108,99,255,0.15),rgba(168,85,247,0.08))",
              animation:  "skeletonPulse 1.6s ease-in-out infinite",
            }}
          />
        )}

        {/* Fallback — litera M gdy brak zdjęcia */}
        {error && (
          <div
            style={{
              position:        "absolute",
              inset:           0,
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              background:      "linear-gradient(135deg,rgba(108,99,255,0.2),rgba(168,85,247,0.1))",
            }}
          >
            <span
              style={{
                fontFamily:  "'Inter', sans-serif",
                fontSize:    "32px",
                fontWeight:  900,
                color:       "white",
                textShadow:  "0 0 20px rgba(108,99,255,0.6)",
                lineHeight:  1,
                userSelect:  "none",
              }}
            >
              M
            </span>
          </div>
        )}

        {/* Zdjęcie profilowe */}
        {!error && (
          <Image
            src="/avatar.jpg"
            alt="MALTIXON — zdjęcie profilowe"
            fill
            sizes="92px"
            priority
            quality={90}
            style={{
              objectFit:  "cover",
              borderRadius: "50%",
              opacity:    loaded ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}

        {/* Subtelna winietka wewnętrzna */}
        <div
          aria-hidden="true"
          style={{
            position:      "absolute",
            inset:         0,
            borderRadius:  "50%",
            boxShadow:     "inset 0 0 12px rgba(0,0,0,0.35)",
            pointerEvents: "none",
            zIndex:        2,
          }}
        />
      </div>

      {/* Status online — zielona kropka */}
      <div
        aria-label="Status: Online"
        title="Online"
        style={{
          position:     "absolute",
          bottom:       4,
          right:        4,
          zIndex:       10,
          width:        14,
          height:       14,
          borderRadius: "50%",
          background:   "#22c55e",
          border:       "2.5px solid #0d0d1a",
          boxShadow:    "0 0 0 0 rgba(34,197,94,0.6)",
          animation:    "pulseDotGreen 2.2s ease-out infinite",
        }}
      />
    </div>
  );
}

// ── Badge komponent ───────────────────────────────────────
function Badge({
  children,
  variant = "purple",
}: {
  children: React.ReactNode;
  variant?: "purple" | "green" | "blue";
}) {
  const styles = {
    purple: {
      background: "rgba(108,99,255,0.15)",
      border:     "1px solid rgba(108,99,255,0.3)",
      color:      "#a78bfa",
    },
    green: {
      background: "rgba(34,197,94,0.1)",
      border:     "1px solid rgba(34,197,94,0.3)",
      color:      "#4ade80",
    },
    blue: {
      background: "rgba(59,130,246,0.12)",
      border:     "1px solid rgba(59,130,246,0.3)",
      color:      "#93c5fd",
    },
  } as const;

  return (
    <span
      style={{
        display:       "inline-flex",
        alignItems:    "center",
        gap:           4,
        padding:       "3px 10px",
        borderRadius:  9999,
        fontSize:      "9px",
        fontWeight:    700,
        letterSpacing: "0.1em",
        textTransform: "uppercase" as const,
        userSelect:    "none",
        whiteSpace:    "nowrap" as const,
        ...styles[variant],
      }}
    >
      {children}
    </span>
  );
}

// ── Główny komponent ──────────────────────────────────────
export default function AvatarHeader() {
  const { current, visible } = useRotatingText(PLATFORMS);
  const mounted              = useMounted(120);

  return (
    <>
      <style>{`
        @keyframes spinRing {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulseDotGreen {
          0%   { box-shadow: 0 0 0 0   rgba(34,197,94,0.6); }
          70%  { box-shadow: 0 0 0 7px rgba(34,197,94,0);   }
          100% { box-shadow: 0 0 0 0   rgba(34,197,94,0);   }
        }
        @keyframes skeletonPulse {
          0%,100% { opacity: 1;   }
          50%     { opacity: 0.4; }
        }
      `}</style>

      <div
        style={{
          display:    "flex",
          alignItems: "center",
          gap:        "clamp(14px, 4vw, 20px)",
          marginBottom: 20,
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* Avatar */}
        <AvatarImage />

        {/* Prawa strona — tekst */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            gap:           8,
            minWidth:      0,
          }}
        >
          {/* Nazwa */}
          <h1
            style={{
              fontFamily:    "'Inter', sans-serif",
              fontSize:      "clamp(20px, 5.5vw, 26px)",
              fontWeight:    900,
              color:         "#ffffff",
              letterSpacing: "-0.025em",
              lineHeight:    1,
              margin:        0,
              textShadow:    "0 0 30px rgba(108,99,255,0.3)",
              userSelect:    "none",
            }}
          >
            MALTIXON
          </h1>

          {/* Rotujący tytuł platformy */}
          <div
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        7,
              height:     18,
            }}
          >
            {/* Kolorowa kropka platformy */}
            <span
              style={{
                display:      "block",
                width:        6,
                height:       6,
                borderRadius: "50%",
                flexShrink:   0,
                background:   current.dot,
                boxShadow:    `0 0 6px ${current.dot}`,
                transition:   "background 0.4s ease, box-shadow 0.4s ease",
              }}
            />

            {/* Tekst platformy */}
            <span
              style={{
                fontFamily:    "'Inter', sans-serif",
                fontSize:      "12px",
                fontWeight:    600,
                letterSpacing: "0.01em",
                color:         current.color,
                opacity:       visible ? 1 : 0,
                transform:     visible
                  ? "translateY(0px)"
                  : "translateY(-5px)",
                transition:
                  "opacity 0.3s ease, transform 0.3s ease, color 0.4s ease",
                userSelect:    "none",
              }}
            >
              {current.label}
            </span>
          </div>

          {/* Badges */}
          <div
            style={{
              display:   "flex",
              gap:       6,
              flexWrap:  "wrap" as const,
            }}
          >
            <Badge variant="purple">🎮 Streamer</Badge>
            <Badge variant="green">🇵🇱 Polska</Badge>
            <Badge variant="blue">⚡ V2</Badge>
          </div>
        </div>
      </div>
    </>
  );
}

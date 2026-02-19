"use client";

import { useEffect, useState } from "react";

// ── Typy ─────────────────────────────────────────────────
type Platform = {
  label: string;
  color: string;
  dot:   string;
};

// ── Platformy wyświetlane w rotacji ──────────────────────
const PLATFORMS: Platform[] = [
  { label: "YouTube Creator", color: "#f87171", dot: "#ff0000" },
  { label: "Content Creator", color: "#67e8f9", dot: "#06b6d4" },
  { label: "TikTok Creator",  color: "#f9a8d4", dot: "#ff0050" },
];

// ── Hook — rotacja tekstu ────────────────────────────────
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

// ── Hook — licznik wejścia (mount animation) ─────────────
function useMounted(delay = 0) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return mounted;
}

// ── Animowany ring avatara ───────────────────────────────
function AvatarRing() {
  return (
    <div className="relative flex-shrink-0">
      {/* Zewnętrzny obracający się pierścień */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #6c63ff, #a855f7, #3b82f6, #6c63ff)",
          padding: 2,
          borderRadius: "50%",
          animation: "spinRing 6s linear infinite",
          opacity: 0.7,
        }}
      />

      {/* Gradient ring statyczny (fallback + głębia) */}
      <div
        className="relative rounded-full p-[3px]"
        style={{
          background:
            "linear-gradient(135deg,#6c63ff 0%,#a855f7 50%,#3b82f6 100%)",
          zIndex: 1,
        }}
      >
        {/* Tło avatara */}
        <div
          className="w-[88px] h-[88px] rounded-full flex items-center
                     justify-center relative overflow-hidden select-none"
          style={{ background: "#0d0d1a" }}
        >
          {/* Subtelny gradient wewnętrzny */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(108,99,255,0.25), transparent 65%)",
            }}
          />

          {/* Inicjał */}
          <span
            className="relative z-10 text-[34px] font-black text-white
                       tracking-tighter leading-none"
            style={{ textShadow: "0 0 20px rgba(108,99,255,0.6)" }}
          >
            M
          </span>
        </div>
      </div>

      {/* Pulsująca zielona kropka — status online */}
      <div
        className="absolute bottom-1 right-1 z-20"
        title="Online"
        aria-label="Status: Online"
      >
        <span
          className="block w-3.5 h-3.5 rounded-full"
          style={{
            background:  "#22c55e",
            border:      "2px solid #0d0d1a",
            boxShadow:   "0 0 0 0 rgba(34,197,94,0.6)",
            animation:   "pulse 2.2s ease-out infinite",
          }}
        />
      </div>
    </div>
  );
}

// ── Badge komponent ──────────────────────────────────────
function Badge({
  children,
  variant = "purple",
}: {
  children: React.ReactNode;
  variant?: "purple" | "green" | "blue";
}) {
  const styles = {
    purple: {
      background:  "rgba(108,99,255,0.15)",
      border:      "1px solid rgba(108,99,255,0.3)",
      color:       "#a78bfa",
    },
    green: {
      background:  "rgba(34,197,94,0.1)",
      border:      "1px solid rgba(34,197,94,0.3)",
      color:       "#4ade80",
    },
    blue: {
      background:  "rgba(59,130,246,0.12)",
      border:      "1px solid rgba(59,130,246,0.3)",
      color:       "#93c5fd",
    },
  } as const;

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                 text-[10px] font-bold tracking-widest uppercase"
      style={styles[variant]}
    >
      {children}
    </span>
  );
}

// ── Główny komponent ─────────────────────────────────────
export default function AvatarHeader() {
  const { current, visible } = useRotatingText(PLATFORMS);
  const mounted = useMounted(100);

  return (
    <>
      {/* Keyframes — inline w <style> */}
      <style>{`
        @keyframes spinRing {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0   rgba(34,197,94,0.55); }
          70%  { box-shadow: 0 0 0 7px rgba(34,197,94,0);    }
          100% { box-shadow: 0 0 0 0   rgba(34,197,94,0);    }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      <div
        className="flex items-center gap-5 mb-5"
        style={{
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* Avatar */}
        <AvatarRing />

        {/* Prawa strona */}
        <div className="flex flex-col gap-2 min-w-0">

          {/* Nazwa */}
          <h1
            className="text-[23px] font-black text-white tracking-tight
                       leading-none m-0"
            style={{ textShadow: "0 0 30px rgba(108,99,255,0.3)" }}
          >
            MALTIXON
          </h1>

          {/* Rotujący tytuł */}
          <div className="flex items-center gap-2 h-5">
            {/* Kolorowa kropka platformy */}
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300"
              style={{ background: current.dot }}
            />
            <span
              className="text-[12px] font-semibold transition-all duration-300"
              style={{
                color:    current.color,
                opacity:  visible ? 1 : 0,
                transform: visible
                  ? "translateY(0px)"
                  : "translateY(-5px)",
                transition:
                  "opacity 0.3s ease, transform 0.3s ease, color 0.4s ease",
              }}
            >
              {current.label}
            </span>
          </div>

          {/* Badges */}
          <div className="flex gap-1.5 flex-wrap">
            <Badge variant="purple">🎮 Streamer</Badge>
            <Badge variant="green">🇵🇱 Polska</Badge>
          </div>
        </div>
      </div>
    </>
  );
}

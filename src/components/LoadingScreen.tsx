"use client";

import { useEffect, useRef, useState } from "react";

// ── Typy ─────────────────────────────────────────────────
type LoadStep = {
  id:      string;
  label:   string;
  delay:   number;
  icon:    string;
};

// ── Kroki ładowania ───────────────────────────────────────
const LOAD_STEPS: LoadStep[] = [
  { id: "assets",    label: "Ładowanie zasobów...",        delay: 0,    icon: "⬡" },
  { id: "profile",   label: "Pobieranie profilu...",       delay: 380,  icon: "◉" },
  { id: "socials",   label: "Łączenie z social media...",  delay: 760,  icon: "⬡" },
  { id: "links",     label: "Konfiguracja linków...",      delay: 1100, icon: "◈" },
  { id: "rendering", label: "Renderowanie strony...",      delay: 1440, icon: "✦" },
  { id: "ready",     label: "Gotowe!",                     delay: 1780, icon: "◉" },
];

// ── Hook — sekwencja kroków ───────────────────────────────
function useLoadSteps() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [current,   setCurrent]   = useState<string | null>(null);
  const [progress,  setProgress]  = useState(0);
  const [done,      setDone]      = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    LOAD_STEPS.forEach((step, i) => {
      // Aktywuj krok
      const t1 = setTimeout(() => {
        setCurrent(step.id);
      }, step.delay);

      // Ukończ krok + progress
      const t2 = setTimeout(() => {
        setCompleted((prev) => [...prev, step.id]);
        setProgress(Math.round(((i + 1) / LOAD_STEPS.length) * 100));

        if (i === LOAD_STEPS.length - 1) {
          setCurrent(null);
          setTimeout(() => setDone(true), 220);
        }
      }, step.delay + 340);

      timers.push(t1, t2);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return { completed, current, progress, done };
}

// ── Hook — licznik progress (płynny) ─────────────────────
function useSmoothProgress(target: number) {
  const [display, setDisplay] = useState(0);
  const rafRef   = useRef<number>(0);
  const current  = useRef(0);

  useEffect(() => {
    function animate() {
      const diff = target - current.current;
      if (Math.abs(diff) < 0.5) {
        current.current = target;
        setDisplay(target);
        return;
      }
      current.current += diff * 0.1;
      setDisplay(Math.round(current.current));
      rafRef.current = requestAnimationFrame(animate);
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return display;
}

// ── Logo animowane ────────────────────────────────────────
function AnimatedLogo({ visible }: { visible: boolean }) {
  const letters = "MALTIXON".split("");

  return (
    <div
      className="flex items-end justify-center gap-[2px]"
      aria-label="MALTIXON"
      role="heading"
      aria-level={1}
    >
      {letters.map((char, i) => (
        <span
          key={i}
          style={{
            display:       "inline-block",
            fontFamily:    "'Inter', sans-serif",
            fontSize:      "clamp(28px, 8vw, 42px)",
            fontWeight:    900,
            letterSpacing: "-0.02em",
            lineHeight:    1,
            color:         "#ffffff",
            opacity:       visible ? 1 : 0,
            transform:     visible ? "translateY(0)" : "translateY(16px)",
            transition:    `
              opacity   0.5s cubic-bezier(.22,1,.36,1) ${i * 45}ms,
              transform 0.5s cubic-bezier(.22,1,.36,1) ${i * 45}ms
            `,
            textShadow:    "0 0 40px rgba(108,99,255,0.4)",
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

// ── Tagline ───────────────────────────────────────────────
function Tagline({ visible }: { visible: boolean }) {
  return (
    <div
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.5s ease 0.42s, transform 0.5s ease 0.42s",
        display:    "flex",
        alignItems: "center",
        gap:        "10px",
        justifyContent: "center",
        marginTop:  "10px",
      }}
    >
      {/* Linia */}
      <div
        style={{
          width:      40,
          height:     1,
          background: "linear-gradient(90deg,transparent,rgba(108,99,255,0.6))",
        }}
      />
      <span
        style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      "10px",
          fontWeight:    600,
          letterSpacing: "0.22em",
          textTransform: "uppercase" as const,
          color:         "rgba(255,255,255,0.35)",
          userSelect:    "none",
        }}
      >
        Polski Streamer & Twórca
      </span>
      <div
        style={{
          width:      40,
          height:     1,
          background: "linear-gradient(90deg,rgba(108,99,255,0.6),transparent)",
        }}
      />
    </div>
  );
}

// ── Circular progress ring ────────────────────────────────
function ProgressRing({
  progress,
  size = 90,
}: {
  progress: number;
  size?:    number;
}) {
  const stroke    = 2.5;
  const radius    = (size - stroke * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset    = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      {/* Fill */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ring-grad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.35s ease" }}
      />
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#6c63ff"/>
          <stop offset="50%"  stopColor="#a855f7"/>
          <stop offset="100%" stopColor="#3b82f6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Avatar placeholder ────────────────────────────────────
function AvatarRing({
  visible,
  progress,
}: {
  visible:  boolean;
  progress: number;
}) {
  return (
    <div
      style={{
        position:   "relative",
        width:      90,
        height:     90,
        opacity:    visible ? 1 : 0,
        transform:  visible ? "scale(1)" : "scale(0.85)",
        transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      {/* Progress ring */}
      <div style={{ position: "absolute", inset: 0 }}>
        <ProgressRing progress={progress} size={90} />
      </div>

      {/* Inicjał */}
      <div
        style={{
          position:        "absolute",
          inset:           6,
          borderRadius:    "50%",
          background:      "linear-gradient(135deg,rgba(108,99,255,0.25),rgba(168,85,247,0.15))",
          border:          "1px solid rgba(108,99,255,0.2)",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
        }}
      >
        <span
          style={{
            fontFamily:  "'Inter', sans-serif",
            fontSize:    28,
            fontWeight:  900,
            color:       "white",
            textShadow:  "0 0 20px rgba(108,99,255,0.6)",
            userSelect:  "none",
            lineHeight:  1,
          }}
        >
          M
        </span>
      </div>
    </div>
  );
}

// ── Progress bar liniowy ──────────────────────────────────
function LinearProgress({ progress }: { progress: number }) {
  return (
    <div style={{ width: "100%", maxWidth: 280 }}>
      {/* Bar */}
      <div
        style={{
          height:       2,
          background:   "rgba(255,255,255,0.06)",
          borderRadius: 999,
          overflow:     "hidden",
          position:     "relative",
        }}
      >
        {/* Fill */}
        <div
          style={{
            position:     "absolute",
            top:          0,
            left:         0,
            height:       "100%",
            width:        `${progress}%`,
            background:   "linear-gradient(90deg,#6c63ff,#a855f7,#3b82f6)",
            borderRadius: 999,
            transition:   "width 0.4s ease",
            boxShadow:    "0 0 8px rgba(108,99,255,0.6)",
          }}
        />

        {/* Shimmer */}
        <div
          style={{
            position:   "absolute",
            top:        0,
            left:       0,
            height:     "100%",
            width:      "100%",
            background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.15) 50%,transparent 100%)",
            backgroundSize: "200% 100%",
            animation:  progress < 100
              ? "shimmerBar 1.5s ease-in-out infinite"
              : "none",
          }}
        />
      </div>
    </div>
  );
}

// ── Step list ─────────────────────────────────────────────
function StepList({
  completed,
  current,
}: {
  completed: string[];
  current:   string | null;
}) {
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        gap:            6,
        width:          "100%",
        maxWidth:       260,
      }}
      aria-live="polite"
      aria-label="Status ładowania"
    >
      {LOAD_STEPS.map((step) => {
        const isDone    = completed.includes(step.id);
        const isActive  = current === step.id;
        const isPending = !isDone && !isActive;

        return (
          <div
            key={step.id}
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        8,
              opacity:    isPending ? 0.25 : 1,
              transform:  isActive
                ? "translateX(4px)"
                : "translateX(0)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            {/* Indicator */}
            <div
              style={{
                width:        16,
                height:       16,
                borderRadius: "50%",
                flexShrink:   0,
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                background:   isDone
                  ? "linear-gradient(135deg,#6c63ff,#a855f7)"
                  : isActive
                  ? "rgba(108,99,255,0.2)"
                  : "rgba(255,255,255,0.06)",
                border:       isActive
                  ? "1px solid rgba(108,99,255,0.5)"
                  : "none",
                transition:   "all 0.3s ease",
                boxShadow:    isActive
                  ? "0 0 8px rgba(108,99,255,0.4)"
                  : isDone
                  ? "0 0 6px rgba(108,99,255,0.3)"
                  : "none",
              }}
            >
              {isDone ? (
                // Checkmark
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <polyline
                    points="1.5,5 4,7.5 8.5,2.5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : isActive ? (
                // Spinning dot
                <div
                  style={{
                    width:        5,
                    height:       5,
                    borderRadius: "50%",
                    background:   "#a78bfa",
                    animation:    "pulseDot 1s ease-in-out infinite",
                  }}
                />
              ) : null}
            </div>

            {/* Label */}
            <span
              style={{
                fontFamily:  "'Inter', sans-serif",
                fontSize:    "11px",
                fontWeight:  isActive ? 600 : 400,
                color:       isDone
                  ? "rgba(255,255,255,0.55)"
                  : isActive
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.3)",
                transition:  "all 0.3s ease",
                userSelect:  "none",
                letterSpacing: "0.01em",
              }}
            >
              {step.label}
            </span>

            {/* Tick na ukończony */}
            {isDone && (
              <span
                style={{
                  marginLeft:  "auto",
                  fontSize:    "9px",
                  color:       "rgba(108,99,255,0.5)",
                  fontFamily:  "'Inter', sans-serif",
                  fontWeight:  600,
                  userSelect:  "none",
                }}
              >
                ✓
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Główny komponent ──────────────────────────────────────
export default function LoadingScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const { completed, current, progress, done } = useLoadSteps();
  const displayProgress = useSmoothProgress(progress);
  const [logoVisible,   setLogoVisible]   = useState(false);
  const [leaving,       setLeaving]       = useState(false);
  const doneRef = useRef(false);

  // Logo wejście
  useEffect(() => {
    const t = setTimeout(() => setLogoVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Wyjście po ukończeniu
  useEffect(() => {
    if (!done || doneRef.current) return;
    doneRef.current = true;

    const t = setTimeout(() => {
      setLeaving(true);
      setTimeout(onComplete, 650);
    }, 500);

    return () => clearTimeout(t);
  }, [done, onComplete]);

  return (
    <>
      <style>{`
        @keyframes shimmerBar {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes pulseDot {
          0%,100% { opacity: 1;   transform: scale(1);    }
          50%     { opacity: 0.5; transform: scale(0.75); }
        }
        @keyframes floatOrb {
          0%,100% { transform: translateY(0px)   scale(1);    }
          50%     { transform: translateY(-18px)  scale(1.04); }
        }
      `}</style>

      <div
        role="status"
        aria-label="Ładowanie strony MALTIXON"
        aria-live="polite"
        style={{
          position:       "fixed",
          inset:          0,
          zIndex:         9999,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          gap:            "clamp(24px, 4vh, 36px)",
          background:     "#07070f",
          opacity:        leaving ? 0 : 1,
          transform:      leaving ? "scale(1.03)" : "scale(1)",
          transition:     "opacity 0.6s ease, transform 0.6s ease",
          overflow:       "hidden",
          padding:        "24px",
        }}
      >

        {/* ── Orby tła ── */}
        <div aria-hidden="true">
          {[
            { w: 500, h: 500, top: "-15%", left: "-10%",  color: "#6c63ff", dur: "11s", delay: "0s"    },
            { w: 380, h: 380, top: "55%",  left: "65%",   color: "#a855f7", dur: "14s", delay: "-4s"   },
            { w: 260, h: 260, top: "30%",  left: "-5%",   color: "#3b82f6", dur: "9s",  delay: "-2s"   },
          ].map((orb, i) => (
            <div
              key={i}
              style={{
                position:     "fixed",
                top:          orb.top,
                left:         orb.left,
                width:        orb.w,
                height:       orb.h,
                borderRadius: "50%",
                background:   `radial-gradient(circle,${orb.color}18 0%,transparent 70%)`,
                filter:       "blur(60px)",
                animation:    `floatOrb ${orb.dur} ease-in-out infinite ${orb.delay}`,
                pointerEvents:"none",
              }}
            />
          ))}
        </div>

        {/* ── Avatar + progress ring ── */}
        <AvatarRing
          visible={logoVisible}
          progress={displayProgress}
        />

        {/* ── Logo + tagline ── */}
        <div style={{ textAlign: "center" }}>
          <AnimatedLogo visible={logoVisible} />
          <Tagline visible={logoVisible} />
        </div>

        {/* ── Progress licznik + bar ── */}
        <div
          style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            gap:            10,
            width:          "100%",
            maxWidth:       280,
            opacity:        logoVisible ? 1 : 0,
            transform:      logoVisible ? "translateY(0)" : "translateY(8px)",
            transition:     "opacity 0.5s ease 0.55s, transform 0.5s ease 0.55s",
          }}
        >
          {/* Procent */}
          <div
            style={{
              fontFamily:    "'Inter', sans-serif",
              fontSize:      "11px",
              fontWeight:    600,
              color:         done
                ? "rgba(108,99,255,0.8)"
                : "rgba(255,255,255,0.3)",
              letterSpacing: "0.08em",
              transition:    "color 0.4s ease",
              userSelect:    "none",
            }}
          >
            {done ? "Gotowe!" : `${displayProgress}%`}
          </div>

          <LinearProgress progress={displayProgress} />
        </div>

        {/* ── Lista kroków ── */}
        <div
          style={{
            opacity:    logoVisible ? 1 : 0,
            transform:  logoVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.5s ease 0.7s, transform 0.5s ease 0.7s",
          }}
        >
          <StepList completed={completed} current={current} />
        </div>

        {/* ── Stopka ── */}
        <div
          style={{
            position:      "absolute",
            bottom:        24,
            left:          0,
            right:         0,
            textAlign:     "center",
            opacity:       logoVisible ? 0.4 : 0,
            transition:    "opacity 0.5s ease 0.9s",
          }}
        >
          <span
            style={{
              fontFamily:    "'Inter', sans-serif",
              fontSize:      "10px",
              color:         "rgba(255,255,255,0.25)",
              letterSpacing: "0.06em",
              fontWeight:    500,
              userSelect:    "none",
            }}
          >
            © {new Date().getFullYear()} MALTIXON • v2.0
          </span>
        </div>

      </div>
    </>
  );
}

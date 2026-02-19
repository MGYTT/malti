"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ── Typy ─────────────────────────────────────────────────
type LoadStep = {
  id:    string;
  label: string;
  delay: number;
};

// ── Kroki ładowania ───────────────────────────────────────
const LOAD_STEPS: LoadStep[] = [
  { id: "assets",    label: "Ładowanie zasobów...",       delay: 0    },
  { id: "profile",   label: "Pobieranie profilu...",      delay: 380  },
  { id: "socials",   label: "Łączenie z social media...", delay: 760  },
  { id: "links",     label: "Konfiguracja linków...",     delay: 1100 },
  { id: "rendering", label: "Renderowanie strony...",     delay: 1440 },
  { id: "ready",     label: "Gotowe!",                    delay: 1780 },
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
      const t1 = setTimeout(() => setCurrent(step.id), step.delay);

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

// ── Hook — płynny progress ────────────────────────────────
function useSmoothProgress(target: number) {
  const [display, setDisplay] = useState(0);
  const rafRef    = useRef<number>(0);
  const current   = useRef(0);

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

// ── Circular progress ring SVG ────────────────────────────
function ProgressRing({
  progress,
  size = 96,
}: {
  progress: number;
  size?:    number;
}) {
  const stroke        = 2.5;
  const radius        = (size - stroke * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset        = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#6c63ff"/>
          <stop offset="50%"  stopColor="#a855f7"/>
          <stop offset="100%" stopColor="#3b82f6"/>
        </linearGradient>
      </defs>

      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={stroke}
      />

      {/* Fill */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="url(#ring-grad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
    </svg>
  );
}

// ── Avatar ze zdjęciem + progress ring ───────────────────
function AvatarRing({
  visible,
  progress,
  done,
}: {
  visible:  boolean;
  progress: number;
  done:     boolean;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError,  setImgError]  = useState(false);
  const SIZE = 96;

  return (
    <div
      style={{
        position:   "relative",
        width:      SIZE,
        height:     SIZE,
        opacity:    visible ? 1 : 0,
        transform:  visible ? "scale(1)" : "scale(0.82)",
        transition: "opacity 0.65s ease, transform 0.65s cubic-bezier(.34,1.56,.64,1)",
        flexShrink: 0,
      }}
    >
      {/* Progress ring */}
      <ProgressRing progress={progress} size={SIZE} />

      {/* Avatar kontener */}
      <div
        style={{
          position:        "absolute",
          inset:           6,
          borderRadius:    "50%",
          overflow:        "hidden",
          border:          "2px solid rgba(0,0,0,0.4)",
          background:      "linear-gradient(135deg,rgba(108,99,255,0.2),rgba(168,85,247,0.1))",
          boxShadow:       done
            ? "0 0 28px rgba(108,99,255,0.45), inset 0 0 12px rgba(0,0,0,0.3)"
            : "inset 0 0 12px rgba(0,0,0,0.3)",
          transition:      "box-shadow 0.5s ease",
        }}
      >
        {/* Skeleton */}
        {!imgLoaded && !imgError && (
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

        {/* Fallback — litera M */}
        {imgError && (
          <div
            style={{
              position:       "absolute",
              inset:          0,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize:   "28px",
                fontWeight: 900,
                color:      "white",
                textShadow: "0 0 20px rgba(108,99,255,0.7)",
                userSelect: "none",
                lineHeight: 1,
              }}
            >
              M
            </span>
          </div>
        )}

        {/* Zdjęcie */}
        {!imgError && (
          <Image
            src="/avatar.jpg"
            alt="MALTIXON"
            fill
            sizes={`${SIZE}px`}
            priority
            quality={90}
            style={{
              objectFit:   "cover",
              borderRadius: "50%",
              opacity:     imgLoaded ? 1 : 0,
              transition:  "opacity 0.4s ease",
            }}
            onLoad={()  => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {/* Winietka wewnętrzna */}
        <div
          aria-hidden="true"
          style={{
            position:      "absolute",
            inset:         0,
            borderRadius:  "50%",
            boxShadow:     "inset 0 0 14px rgba(0,0,0,0.4)",
            pointerEvents: "none",
            zIndex:        2,
          }}
        />
      </div>

      {/* Checkmark po załadowaniu — pojawia się gdy done */}
      <div
        style={{
          position:       "absolute",
          bottom:         3,
          right:          3,
          width:          18,
          height:         18,
          borderRadius:   "50%",
          background:     done
            ? "linear-gradient(135deg,#6c63ff,#a855f7)"
            : "rgba(255,255,255,0.06)",
          border:         "2px solid #07070f",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          opacity:        done ? 1 : 0,
          transform:      done ? "scale(1)" : "scale(0.5)",
          transition:     "all 0.4s cubic-bezier(.34,1.56,.64,1) 0.1s",
          zIndex:         10,
        }}
      >
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <polyline
            points="1.5,5 4,7.5 8.5,2.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// ── Animowane logo ────────────────────────────────────────
function AnimatedLogo({ visible }: { visible: boolean }) {
  const letters = "MALTIXON".split("");

  return (
    <div
      style={{ display: "flex", alignItems: "flex-end",
               justifyContent: "center", gap: 1 }}
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
            fontSize:      "clamp(26px, 7.5vw, 40px)",
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
            textShadow: "0 0 40px rgba(108,99,255,0.35)",
            userSelect: "none",
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
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            10,
        marginTop:      8,
        opacity:        visible ? 1 : 0,
        transform:      visible ? "translateY(0)" : "translateY(6px)",
        transition:     "opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s",
      }}
    >
      <div style={{
        width: 36, height: 1,
        background: "linear-gradient(90deg,transparent,rgba(108,99,255,0.55))",
      }}/>
      <span
        style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      "9.5px",
          fontWeight:    600,
          letterSpacing: "0.22em",
          textTransform: "uppercase" as const,
          color:         "rgba(255,255,255,0.32)",
          userSelect:    "none",
          whiteSpace:    "nowrap",
        }}
      >
        Polski Streamer & Twórca
      </span>
      <div style={{
        width: 36, height: 1,
        background: "linear-gradient(90deg,rgba(108,99,255,0.55),transparent)",
      }}/>
    </div>
  );
}

// ── Linear progress bar ───────────────────────────────────
function LinearProgress({
  progress,
  done,
}: {
  progress: number;
  done:     boolean;
}) {
  return (
    <div style={{ width: "100%", maxWidth: 260 }}>
      {/* Procent */}
      <div
        style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      "10.5px",
          fontWeight:    600,
          color:         done
            ? "#a78bfa"
            : "rgba(255,255,255,0.28)",
          letterSpacing: "0.08em",
          textAlign:     "center",
          marginBottom:  8,
          transition:    "color 0.4s ease",
          userSelect:    "none",
        }}
      >
        {done ? "✓  Gotowe!" : `${progress}%`}
      </div>

      {/* Bar track */}
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
            inset:        0,
            width:        `${progress}%`,
            background:   done
              ? "linear-gradient(90deg,#6c63ff,#a855f7)"
              : "linear-gradient(90deg,#6c63ff,#a855f7,#3b82f6)",
            borderRadius: 999,
            transition:   "width 0.4s ease, background 0.5s ease",
            boxShadow:    "0 0 8px rgba(108,99,255,0.55)",
          }}
        />

        {/* Shimmer */}
        {!done && (
          <div
            style={{
              position:       "absolute",
              inset:          0,
              background:     "linear-gradient(90deg,transparent,rgba(255,255,255,0.18) 50%,transparent)",
              backgroundSize: "200% 100%",
              animation:      "shimmerBar 1.6s ease-in-out infinite",
            }}
          />
        )}
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
        display:       "flex",
        flexDirection: "column",
        gap:           5,
        width:         "100%",
        maxWidth:      240,
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
              opacity:    isPending ? 0.22 : 1,
              transform:  isActive ? "translateX(3px)" : "translateX(0)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            {/* Dot indicator */}
            <div
              style={{
                width:          15,
                height:         15,
                borderRadius:   "50%",
                flexShrink:     0,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                background:     isDone
                  ? "linear-gradient(135deg,#6c63ff,#a855f7)"
                  : isActive
                  ? "rgba(108,99,255,0.18)"
                  : "rgba(255,255,255,0.05)",
                border:         isActive
                  ? "1px solid rgba(108,99,255,0.5)"
                  : "none",
                boxShadow:      isDone
                  ? "0 0 7px rgba(108,99,255,0.35)"
                  : isActive
                  ? "0 0 8px rgba(108,99,255,0.4)"
                  : "none",
                transition:     "all 0.3s ease",
              }}
            >
              {isDone ? (
                <svg width="7" height="7" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <polyline
                    points="1.5,5 4,7.5 8.5,2.5"
                    stroke="white" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              ) : isActive ? (
                <div
                  style={{
                    width:        4,
                    height:       4,
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
                fontFamily:    "'Inter', sans-serif",
                fontSize:      "10.5px",
                fontWeight:    isActive ? 600 : 400,
                color:         isDone
                  ? "rgba(255,255,255,0.45)"
                  : isActive
                  ? "rgba(255,255,255,0.88)"
                  : "rgba(255,255,255,0.25)",
                transition:    "all 0.3s ease",
                userSelect:    "none",
                letterSpacing: "0.01em",
              }}
            >
              {step.label}
            </span>

            {/* Check tick */}
            {isDone && (
              <span
                style={{
                  marginLeft:  "auto",
                  fontSize:    "9px",
                  fontWeight:  700,
                  color:       "rgba(108,99,255,0.45)",
                  userSelect:  "none",
                  fontFamily:  "'Inter', sans-serif",
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

// ── Tło — orby ────────────────────────────────────────────
function BackgroundOrbs() {
  const orbs = [
    { w: 500, h: 500, top: "-15%", left: "-10%", color: "#6c63ff", dur: "11s", delay: "0s"  },
    { w: 380, h: 380, top: "55%",  left: "65%",  color: "#a855f7", dur: "14s", delay: "-4s" },
    { w: 260, h: 260, top: "30%",  left: "-5%",  color: "#3b82f6", dur: "9s",  delay: "-2s" },
  ];

  return (
    <div aria-hidden="true">
      {orbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position:      "fixed",
            top:           orb.top,
            left:          orb.left,
            width:         orb.w,
            height:        orb.h,
            borderRadius:  "50%",
            background:    `radial-gradient(circle,${orb.color}18 0%,transparent 70%)`,
            filter:        "blur(60px)",
            animation:     `floatOrb ${orb.dur} ease-in-out infinite ${orb.delay}`,
            pointerEvents: "none",
          }}
        />
      ))}
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
    const t = setTimeout(() => setLogoVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Wyjście
  useEffect(() => {
    if (!done || doneRef.current) return;
    doneRef.current = true;
    const t = setTimeout(() => {
      setLeaving(true);
      setTimeout(onComplete, 650);
    }, 520);
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
          50%     { opacity: 0.5; transform: scale(0.7);  }
        }
        @keyframes floatOrb {
          0%,100% { transform: translateY(0px)  scale(1);    }
          50%     { transform: translateY(-18px) scale(1.04); }
        }
        @keyframes skeletonPulse {
          0%,100% { opacity: 1;   }
          50%     { opacity: 0.4; }
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
          gap:            "clamp(20px, 3.5vh, 32px)",
          background:     "#07070f",
          padding:        "clamp(16px, 4vw, 32px)",
          overflow:       "hidden",
          // Wyjście
          opacity:        leaving ? 0 : 1,
          transform:      leaving ? "scale(1.03)" : "scale(1)",
          transition:     "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <BackgroundOrbs />

        {/* Avatar + ring */}
        <AvatarRing
          visible={logoVisible}
          progress={displayProgress}
          done={done}
        />

        {/* Logo + tagline */}
        <div
          style={{ textAlign: "center" }}
        >
          <AnimatedLogo visible={logoVisible} />
          <Tagline      visible={logoVisible} />
        </div>

        {/* Progress bar */}
        <div
          style={{
            display:    "flex",
            flexDirection: "column",
            alignItems: "center",
            width:      "100%",
            maxWidth:   260,
            opacity:    logoVisible ? 1 : 0,
            transform:  logoVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s",
          }}
        >
          <LinearProgress progress={displayProgress} done={done} />
        </div>

        {/* Step list */}
        <div
          style={{
            opacity:    logoVisible ? 1 : 0,
            transform:  logoVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.5s ease 0.65s, transform 0.5s ease 0.65s",
          }}
        >
          <StepList completed={completed} current={current} />
        </div>

        {/* Stopka */}
        <div
          style={{
            position:   "absolute",
            bottom:     20,
            left:       0,
            right:      0,
            textAlign:  "center",
            opacity:    logoVisible ? 0.35 : 0,
            transition: "opacity 0.5s ease 0.9s",
            pointerEvents: "none",
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

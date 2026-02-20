// src/components/LoadingScreen.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

// ── Typy ─────────────────────────────────────────────────
type LoadStep = { id: string; label: string; delay: number };

// ── Kroki ładowania ───────────────────────────────────────
const LOAD_STEPS: LoadStep[] = [
  { id: "assets",    label: "Ładowanie zasobów...",       delay: 0    },
  { id: "profile",   label: "Pobieranie profilu...",      delay: 320  },
  { id: "socials",   label: "Łączenie z social media...", delay: 620  },
  { id: "links",     label: "Konfiguracja linków...",     delay: 900  },
  { id: "rendering", label: "Renderowanie strony...",     delay: 1160 },
  { id: "ready",     label: "Gotowe!",                    delay: 1400 },
];

const TOTAL_DURATION = 1400 + 280; // ostatni krok + czas jego zakończenia

// ── Hook — sekwencja kroków ───────────────────────────────
function useLoadSteps() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [current,   setCurrent]   = useState<string | null>(null);
  const [progress,  setProgress]  = useState(0);
  const [done,      setDone]      = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    LOAD_STEPS.forEach((step, i) => {
      timers.push(setTimeout(() => setCurrent(step.id), step.delay));
      timers.push(setTimeout(() => {
        setCompleted((prev) => [...prev, step.id]);
        setProgress(Math.round(((i + 1) / LOAD_STEPS.length) * 100));
        if (i === LOAD_STEPS.length - 1) {
          setCurrent(null);
          setTimeout(() => setDone(true), 200);
        }
      }, step.delay + 280));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return { completed, current, progress, done };
}

// ── Hook — płynny eased progress ─────────────────────────
function useSmoothProgress(target: number) {
  const [display, setDisplay] = useState(0);
  const rafRef  = useRef<number>(0);
  const current = useRef(0);

  useEffect(() => {
    const animate = () => {
      const diff = target - current.current;
      if (Math.abs(diff) < 0.3) {
        current.current = target;
        setDisplay(target);
        return;
      }
      // easeOut — szybki start, łagodne docelowanie
      current.current += diff * 0.12;
      setDisplay(Math.round(current.current));
      rafRef.current = requestAnimationFrame(animate);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return display;
}

// ── Hook — licznik czasu (uptime) ─────────────────────────
function useElapsedMs() {
  const [ms, setMs]   = useState(0);
  const startRef      = useRef(performance.now());
  const rafRef        = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      setMs(Math.round(performance.now() - startRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return ms;
}

// ── ProgressRing ──────────────────────────────────────────
function ProgressRing({ progress, size = 108 }: { progress: number; size?: number }) {
  const stroke        = 2.5;
  const radius        = (size - stroke * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset        = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#6c63ff"/>
          <stop offset="50%"  stopColor="#a855f7"/>
          <stop offset="100%" stopColor="#3b82f6"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Track */}
      <circle cx={size/2} cy={size/2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>

      {/* Glow layer */}
      <circle cx={size/2} cy={size/2} r={radius}
        fill="none" stroke="url(#rg)" strokeWidth={stroke + 2}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        opacity={0.25}
        filter="url(#glow)"
        style={{ transition: "stroke-dashoffset 0.45s cubic-bezier(.22,1,.36,1)" }}
      />

      {/* Main fill */}
      <circle cx={size/2} cy={size/2} r={radius}
        fill="none" stroke="url(#rg)" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.45s cubic-bezier(.22,1,.36,1)" }}
      />
    </svg>
  );
}

// ── AvatarRing ────────────────────────────────────────────
function AvatarRing({ visible, progress, done }: { visible: boolean; progress: number; done: boolean }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError,  setImgError]  = useState(false);
  const SIZE = 108;

  return (
    <div style={{
      position:   "relative",
      width:      SIZE,
      height:     SIZE,
      opacity:    visible ? 1 : 0,
      transform:  visible ? "scale(1) translateY(0)" : "scale(0.75) translateY(12px)",
      transition: "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.34,1.56,.64,1)",
      flexShrink: 0,
    }}>
      <ProgressRing progress={progress} size={SIZE}/>

      {/* Zewnętrzny glow ring */}
      <div aria-hidden="true" style={{
        position:     "absolute",
        inset:        -4,
        borderRadius: "50%",
        background:   "transparent",
        boxShadow:    done
          ? "0 0 40px rgba(108,99,255,0.35), 0 0 80px rgba(108,99,255,0.12)"
          : "0 0 20px rgba(108,99,255,0.15)",
        transition:   "box-shadow 0.7s ease",
        pointerEvents:"none",
      }}/>

      {/* Avatar */}
      <div style={{
        position:   "absolute",
        inset:      7,
        borderRadius: "50%",
        overflow:   "hidden",
        background: "linear-gradient(135deg,rgba(108,99,255,0.2),rgba(168,85,247,0.1))",
        border:     "1.5px solid rgba(255,255,255,0.07)",
      }}>
        {!imgLoaded && !imgError && (
          <div aria-hidden="true" style={{
            position:  "absolute", inset: 0,
            background:"linear-gradient(135deg,rgba(108,99,255,0.18),rgba(168,85,247,0.08))",
            animation: "lsSkeletonPulse 1.8s ease-in-out infinite",
          }}/>
        )}

        {imgError && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"30px", fontWeight:900, color:"white", textShadow:"0 0 24px rgba(108,99,255,0.8)", userSelect:"none", lineHeight:1 }}>M</span>
          </div>
        )}

        {!imgError && (
          <Image
            src="/avatar.jpg" alt="MALTIXON" fill sizes={`${SIZE}px`}
            priority quality={90}
            style={{ objectFit:"cover", borderRadius:"50%", opacity: imgLoaded ? 1 : 0, transition:"opacity 0.5s ease" }}
            onLoad={()  => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {/* Vignette */}
        <div aria-hidden="true" style={{ position:"absolute", inset:0, borderRadius:"50%", boxShadow:"inset 0 0 16px rgba(0,0,0,0.45)", pointerEvents:"none", zIndex:2 }}/>
      </div>

      {/* Done badge */}
      <div style={{
        position:"absolute", bottom:4, right:4,
        width:20, height:20, borderRadius:"50%",
        background: done ? "linear-gradient(135deg,#6c63ff,#a855f7)" : "rgba(255,255,255,0.05)",
        border:"2px solid #07070f",
        display:"flex", alignItems:"center", justifyContent:"center",
        opacity:   done ? 1 : 0,
        transform: done ? "scale(1)" : "scale(0.4)",
        transition:"all 0.5s cubic-bezier(.34,1.56,.64,1) 0.15s",
        zIndex:10,
        boxShadow: done ? "0 0 12px rgba(108,99,255,0.6)" : "none",
      }}>
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

// ── AnimatedLogo ──────────────────────────────────────────
function AnimatedLogo({ visible }: { visible: boolean }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", gap:1 }}
      aria-label="MALTIXON" role="heading" aria-level={1}>
      {"MALTIXON".split("").map((char, i) => (
        <span key={i} style={{
          display:    "inline-block",
          fontFamily: "'Inter',sans-serif",
          fontSize:   "clamp(28px,7.5vw,42px)",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color:      "#ffffff",
          opacity:    visible ? 1 : 0,
          transform:  visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.92)",
          transition: `opacity 0.55s cubic-bezier(.22,1,.36,1) ${i*42}ms, transform 0.55s cubic-bezier(.34,1.56,.64,1) ${i*42}ms`,
          textShadow: "0 0 40px rgba(108,99,255,0.4)",
          userSelect: "none",
        }}>{char}</span>
      ))}
    </div>
  );
}

// ── Tagline ───────────────────────────────────────────────
function Tagline({ visible }: { visible: boolean }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      gap:10, marginTop:9,
      opacity:   visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(6px)",
      transition:"opacity 0.55s ease 0.42s, transform 0.55s ease 0.42s",
    }}>
      <div style={{ width:36, height:1, background:"linear-gradient(90deg,transparent,rgba(108,99,255,0.55))" }}/>
      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"9.5px", fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", userSelect:"none", whiteSpace:"nowrap" }}>
        Polski Streamer &amp; Twórca
      </span>
      <div style={{ width:36, height:1, background:"linear-gradient(90deg,rgba(108,99,255,0.55),transparent)" }}/>
    </div>
  );
}

// ── LinearProgress ────────────────────────────────────────
function LinearProgress({ progress, done, elapsed }: { progress: number; done: boolean; elapsed: number }) {
  return (
    <div style={{ width:"100%", maxWidth:260 }}>
      {/* Górna linia — procent + czas */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{
          fontFamily:"'Inter',sans-serif", fontSize:"10.5px", fontWeight:700,
          color: done ? "#a78bfa" : "rgba(255,255,255,0.35)",
          letterSpacing:"0.06em", transition:"color 0.4s ease", userSelect:"none",
        }}>
          {done ? "✓  Gotowe!" : `${progress}%`}
        </span>
        <span style={{
          fontFamily:"monospace", fontSize:"9px",
          color:"rgba(255,255,255,0.15)", userSelect:"none",
          opacity: done ? 0 : 1, transition:"opacity 0.4s ease",
        }}>
          {(elapsed / 1000).toFixed(2)}s
        </span>
      </div>

      {/* Track */}
      <div style={{ height:2.5, background:"rgba(255,255,255,0.06)", borderRadius:999, overflow:"hidden", position:"relative" }}>
        {/* Fill */}
        <div style={{
          position:"absolute", inset:0,
          width:`${progress}%`,
          background: done
            ? "linear-gradient(90deg,#6c63ff,#a855f7)"
            : "linear-gradient(90deg,#6c63ff,#a855f7,#3b82f6)",
          borderRadius:999,
          transition:"width 0.45s cubic-bezier(.22,1,.36,1), background 0.5s ease",
          boxShadow:"0 0 10px rgba(108,99,255,0.6)",
        }}/>

        {/* Shimmer */}
        {!done && (
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.22) 50%,transparent)",
            backgroundSize:"200% 100%",
            animation:"lsShimmerBar 1.8s ease-in-out infinite",
          }}/>
        )}
      </div>

      {/* Segmenty — subtelne znaczniki kroków */}
      <div style={{ display:"flex", gap:2, marginTop:5 }}>
        {LOAD_STEPS.map((_, i) => {
          const filled = progress >= Math.round(((i + 1) / LOAD_STEPS.length) * 100);
          return (
            <div key={i} style={{
              flex:1, height:2, borderRadius:999,
              background: filled ? "rgba(108,99,255,0.5)" : "rgba(255,255,255,0.05)",
              transition:`background 0.3s ease ${i * 40}ms`,
            }}/>
          );
        })}
      </div>
    </div>
  );
}

// ── StepList ──────────────────────────────────────────────
function StepList({ completed, current }: { completed: string[]; current: string | null }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5, width:"100%", maxWidth:230 }}
      aria-live="polite" aria-label="Status ładowania">
      {LOAD_STEPS.map((step) => {
        const isDone    = completed.includes(step.id);
        const isActive  = current === step.id;
        const isPending = !isDone && !isActive;

        return (
          <div key={step.id} style={{
            display:"flex", alignItems:"center", gap:8,
            opacity:   isPending ? 0.2 : 1,
            transform: isActive ? "translateX(4px)" : "translateX(0)",
            transition:"opacity 0.35s ease, transform 0.35s cubic-bezier(.22,1,.36,1)",
          }}>
            {/* Dot */}
            <div style={{
              width:15, height:15, borderRadius:"50%", flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              background: isDone
                ? "linear-gradient(135deg,#6c63ff,#a855f7)"
                : isActive ? "rgba(108,99,255,0.16)" : "rgba(255,255,255,0.05)",
              border: isActive ? "1px solid rgba(108,99,255,0.55)" : "none",
              boxShadow: isDone
                ? "0 0 8px rgba(108,99,255,0.4)"
                : isActive ? "0 0 10px rgba(108,99,255,0.45)" : "none",
              transition:"all 0.35s ease",
            }}>
              {isDone ? (
                <svg width="7" height="7" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : isActive ? (
                <div style={{ width:4, height:4, borderRadius:"50%", background:"#a78bfa", animation:"lsPulseDot 1s ease-in-out infinite" }}/>
              ) : null}
            </div>

            {/* Label */}
            <span style={{
              fontFamily:"'Inter',sans-serif", fontSize:"10.5px",
              fontWeight: isActive ? 600 : 400,
              color: isDone ? "rgba(255,255,255,0.4)" : isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.22)",
              transition:"all 0.3s ease", userSelect:"none", letterSpacing:"0.01em",
            }}>
              {step.label}
            </span>

            {isDone && (
              <span style={{ marginLeft:"auto", fontSize:"9px", fontWeight:700, color:"rgba(108,99,255,0.4)", userSelect:"none", fontFamily:"'Inter',sans-serif" }}>✓</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── BackgroundOrbs ────────────────────────────────────────
function BackgroundOrbs({ done }: { done: boolean }) {
  const orbs = [
    { w:520, h:520, top:"-18%", left:"-12%", color:"#6c63ff", dur:"12s", delay:"0s"  },
    { w:400, h:400, top:"58%",  left:"60%",  color:"#a855f7", dur:"15s", delay:"-5s" },
    { w:280, h:280, top:"35%",  left:"-8%",  color:"#3b82f6", dur:"10s", delay:"-2s" },
  ];
  return (
    <div aria-hidden="true">
      {orbs.map((orb, i) => (
        <div key={i} style={{
          position:"fixed",
          top:orb.top, left:orb.left,
          width:orb.w, height:orb.h,
          borderRadius:"50%",
          background:`radial-gradient(circle,${orb.color}${done ? "22" : "16"} 0%,transparent 70%)`,
          filter:"blur(70px)",
          animation:`lsFloatOrb ${orb.dur} ease-in-out infinite ${orb.delay}`,
          pointerEvents:"none",
          transition:"background 0.8s ease",
        }}/>
      ))}
    </div>
  );
}

// ── ExitOverlay ───────────────────────────────────────────
// Dedykowana warstwa wyjścia — ciemnieje nad ekranem ładowania
// a następnie nad całą stroną tworząc płynne cross-fade
function ExitOverlay({ leaving }: { leaving: boolean }) {
  return (
    <div aria-hidden="true" style={{
      position:      "fixed",
      inset:         0,
      zIndex:        10000,
      background:    "#07070f",
      opacity:       leaving ? 1 : 0,
      pointerEvents: leaving ? "all" : "none",
      transition:    "opacity 0.55s cubic-bezier(.22,1,.36,1)",
    }}/>
  );
}

// ── Główny komponent ──────────────────────────────────────
export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const { completed, current, progress, done } = useLoadSteps();
  const displayProgress = useSmoothProgress(progress);
  const elapsed         = useElapsedMs();

  const [logoVisible, setLogoVisible] = useState(false);
  const [leaving,     setLeaving]     = useState(false);
  const [exiting,     setExiting]     = useState(false);
  const calledRef = useRef(false);

  // Logo wejście
  useEffect(() => {
    const t = setTimeout(() => setLogoVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Sekwencja wyjścia
  const startExit = useCallback(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    // 1. Fade-out samego LoadingScreen
    setLeaving(true);

    // 2. Po 500ms — ciemny overlay wchodzi (płynna zasłona)
    setTimeout(() => setExiting(true), 480);

    // 3. Po kolejnych 400ms — przekazujemy sterowanie do rodzica
    //    rodzic renderuje stronę pod overlayem
    setTimeout(() => onComplete(), 880);
  }, [onComplete]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(startExit, 480);
    return () => clearTimeout(t);
  }, [done, startExit]);

  return (
    <>
      <style>{`
        @keyframes lsShimmerBar {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes lsPulseDot {
          0%,100% { opacity:1;   transform:scale(1);   }
          50%     { opacity:0.4; transform:scale(0.65); }
        }
        @keyframes lsFloatOrb {
          0%,100% { transform:translateY(0px)   scale(1);    }
          50%     { transform:translateY(-20px) scale(1.05); }
        }
        @keyframes lsSkeletonPulse {
          0%,100% { opacity:1;   }
          50%     { opacity:0.35; }
        }
        @keyframes lsFadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0);    }
        }
      `}</style>

      {/* Overlay wyjścia — renderowany NAD wszystkim */}
      <ExitOverlay leaving={exiting}/>

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
          gap:            "clamp(18px, 3vh, 28px)",
          background:     "#07070f",
          padding:        "clamp(16px,4vw,32px)",
          overflow:       "hidden",
          // Fade-out samego ekranu
          opacity:        leaving ? 0 : 1,
          transform:      leaving ? "scale(1.015)" : "scale(1)",
          transition:     "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <BackgroundOrbs done={done}/>

        {/* Avatar */}
        <AvatarRing visible={logoVisible} progress={displayProgress} done={done}/>

        {/* Logo + tagline */}
        <div style={{ textAlign:"center" }}>
          <AnimatedLogo visible={logoVisible}/>
          <Tagline      visible={logoVisible}/>
        </div>

        {/* Progress */}
        <div style={{
          width:"100%", maxWidth:260,
          opacity:   logoVisible ? 1 : 0,
          transform: logoVisible ? "translateY(0)" : "translateY(8px)",
          transition:"opacity 0.5s ease 0.48s, transform 0.5s ease 0.48s",
        }}>
          <LinearProgress progress={displayProgress} done={done} elapsed={elapsed}/>
        </div>

        {/* Step list */}
        <div style={{
          opacity:   logoVisible ? 1 : 0,
          transform: logoVisible ? "translateY(0)" : "translateY(8px)",
          transition:"opacity 0.5s ease 0.62s, transform 0.5s ease 0.62s",
        }}>
          <StepList completed={completed} current={current}/>
        </div>

        {/* Stopka */}
        <div style={{
          position:"absolute", bottom:20, left:0, right:0,
          textAlign:"center",
          opacity:   logoVisible ? 0.3 : 0,
          transition:"opacity 0.5s ease 0.9s",
          pointerEvents:"none",
        }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"10px", color:"rgba(255,255,255,0.25)", letterSpacing:"0.06em", fontWeight:500, userSelect:"none" }}>
            © {new Date().getFullYear()} MALTIXON • v2.0
          </span>
        </div>
      </div>
    </>
  );
}

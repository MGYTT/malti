"use client";

import { useState, useEffect, useRef } from "react";

// ── Typy ─────────────────────────────────────────────────
type StatItem = {
  id:       string;
  value:    number;
  display:  string;
  label:    string;
  sublabel: string;
  icon:     React.ReactNode;
  color:    string;
  suffix:   string;
  trend:    number[];   // dane do sparkline
  badge?:   string;     // opcjonalny badge np. "🔥 Nowe"
};

// ── Ikony SVG platform ────────────────────────────────────
function YouTubeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#ff4444"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545
           12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0
           0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016
           3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505
           0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12
           24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </svg>
  );
}

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#f09433"/>
          <stop offset="25%"  stopColor="#e6683c"/>
          <stop offset="50%"  stopColor="#dc2743"/>
          <stop offset="75%"  stopColor="#cc2366"/>
          <stop offset="100%" stopColor="#bc1888"/>
        </linearGradient>
      </defs>
      <path
        fill="url(#ig-grad)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771
           1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0
           3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919
           4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849
           -.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644
           -.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771
           4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0
           8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333
           0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618
           6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668
           -.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28
           .073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196
           -4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0
           5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324
           zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44
           0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"
      />
    </svg>
  );
}

function EyeIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

// ── Dane statystyk ────────────────────────────────────────
const STATS: StatItem[] = [
  {
    id:       "subscribers",
    value:    592,
    display:  "592K",
    label:    "Subskrybentów",
    sublabel: "YouTube",
    icon:     <YouTubeIcon size={15} />,
    color:    "#ff4444",
    suffix:   "K",
    trend:    [40, 55, 48, 70, 65, 88, 82, 105, 98, 120],
    badge:    "🔥",
  },
  {
    id:       "views",
    value:    65,
    display:  "65M+",
    label:    "Wyświetleń",
    sublabel: "Łącznie",
    icon:     <EyeIcon size={15} />,
    color:    "#a78bfa",
    suffix:   "M+",
    trend:    [20, 28, 25, 38, 35, 50, 48, 57, 54, 65],
  },
  {
    id:       "followers",
    value:    40,
    display:  "40K",
    label:    "Obserwujących",
    sublabel: "Instagram",
    icon:     <InstagramIcon size={15} />,
    color:    "#e1306c",
    suffix:   "K",
    trend:    [15, 18, 16, 22, 20, 27, 25, 33, 30, 40],
  },
];

// ── Hook — ease-out quart count-up ────────────────────────
function useCountUp(
  target:   number,
  duration: number = 1500,
  delay:    number = 0,
  active:   boolean = false,
) {
  const [count,  setCount]  = useState(0);
  const rafRef   = useRef<number>(0);
  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!active) return;

    timerRef.current = setTimeout(() => {
      startRef.current = 0;

      function tick(ts: number) {
        if (!startRef.current) startRef.current = ts;
        const p     = Math.min((ts - startRef.current) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        setCount(Math.floor(eased * target));
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
        else setCount(target);
      }

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, target, duration, delay]);

  return count;
}

// ── Hook — IntersectionObserver ───────────────────────────
function useInView(threshold = 0.3) {
  const ref    = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ── Sparkline SVG ─────────────────────────────────────────
function Sparkline({
  data,
  color,
  animated,
}: {
  data:     number[];
  color:    string;
  animated: boolean;
}) {
  const W   = 48;
  const H   = 18;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 4) - 2,
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${W} ${H} L 0 ${H} Z`;

  const last = pts[pts.length - 1];

  // Długość ścieżki do animacji stroke-dashoffset
  const pathLen = pts.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const prev = pts[i - 1];
    return acc + Math.hypot(p.x - prev.x, p.y - prev.y);
  }, 0);

  return (
    <svg
      width={W} height={H}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Gradient def */}
      <defs>
        <linearGradient
          id={`spark-area-${color.replace("#", "")}`}
          x1="0" y1="0" x2="0" y2="1"
        >
          <stop offset="0%"   stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Area */}
      <path
        d={areaPath}
        fill={`url(#spark-area-${color.replace("#", "")})`}
        style={{
          opacity:    animated ? 1 : 0,
          transition: "opacity 0.6s ease 0.4s",
        }}
      />

      {/* Linia */}
      <path
        d={linePath}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.75}
        style={{
          strokeDasharray:  pathLen,
          strokeDashoffset: animated ? 0 : pathLen,
          transition:       "stroke-dashoffset 1s ease 0.2s",
        }}
      />

      {/* Punkt końcowy — pulsujący */}
      {animated && (
        <>
          <circle
            cx={last.x}
            cy={last.y}
            r={2.5}
            fill={color}
            opacity={0.9}
          />
          <circle
            cx={last.x}
            cy={last.y}
            r={2.5}
            fill={color}
            opacity={0.4}
            style={{ animation: "sparkPulse 2s ease-out infinite" }}
          />
        </>
      )}
    </svg>
  );
}

// ── Trend indicator ───────────────────────────────────────
function TrendArrow({ color }: { color: string }) {
  return (
    <div
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        2,
      }}
    >
      <svg
        width="8" height="8"
        viewBox="0 0 10 10"
        fill={color}
        aria-hidden="true"
        style={{ opacity: 0.8 }}
      >
        <polygon points="5,1 9,9 1,9"/>
      </svg>
      <span
        style={{
          fontFamily:  "'Inter', sans-serif",
          fontSize:    "8px",
          fontWeight:  700,
          color:       color,
          opacity:     0.8,
          userSelect:  "none",
        }}
      >
        trend
      </span>
    </div>
  );
}

// ── Pojedyncza karta statystyki ───────────────────────────
function StatCard({
  stat,
  index,
  inView,
  isLast,
}: {
  stat:   StatItem;
  index:  number;
  inView: boolean;
  isLast: boolean;
}) {
  const count   = useCountUp(stat.value, 1400, index * 160, inView);
  const [hovered, setHovered] = useState(false);
  const [sparkReady, setSparkReady] = useState(false);

  // Sparkline wchodzi z małym dodatkowym opóźnieniem
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setSparkReady(true), index * 160 + 200);
    return () => clearTimeout(t);
  }, [inView, index]);

  return (
    <div
      role="listitem"
      aria-label={`${stat.label}: ${stat.display} — ${stat.sublabel}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:      "relative",
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        textAlign:     "center",
        padding:       "14px 6px 12px",
        cursor:        "default",
        userSelect:    "none",
        borderRight:   !isLast
          ? "1px solid rgba(255,255,255,0.05)"
          : undefined,
        // Entry animation
        opacity:    inView ? 1 : 0,
        transform:  inView ? "translateY(0)" : "translateY(10px)",
        transition: `opacity 0.45s ease ${index * 0.12}s,
                     transform 0.45s ease ${index * 0.12}s`,
      }}
    >
      {/* Hover radial glow */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          inset:         0,
          background:    `radial-gradient(ellipse at 50% 60%,${stat.color}18,transparent 72%)`,
          opacity:       hovered ? 1 : 0,
          transition:    "opacity 0.3s ease",
          pointerEvents: "none",
          borderRadius:  "inherit",
        }}
      />

      {/* Top — ikona platformy + opcjonalny badge */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          gap:            4,
          marginBottom:   8,
          position:       "relative",
        }}
      >
        {/* Icon container */}
        <div
          style={{
            width:          28,
            height:         28,
            borderRadius:   8,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            background:     `${stat.color}14`,
            border:         `1px solid ${stat.color}${hovered ? "40" : "20"}`,
            boxShadow:      hovered ? `0 0 12px ${stat.color}30` : "none",
            transition:     "all 0.25s ease",
            transform:      hovered ? "scale(1.08)" : "scale(1)",
          }}
        >
          {stat.icon}
        </div>

        {/* Badge */}
        {stat.badge && (
          <div
            style={{
              position:  "absolute",
              top:       -6,
              right:     -6,
              fontSize:  "10px",
              lineHeight: 1,
              filter:    "drop-shadow(0 0 4px rgba(255,150,0,0.5))",
              animation: "badgeBounce 2s ease-in-out infinite",
            }}
            aria-hidden="true"
          >
            {stat.badge}
          </div>
        )}
      </div>

      {/* Licznik */}
      <div
        style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      "clamp(16px, 4.5vw, 20px)",
          fontWeight:    900,
          letterSpacing: "-0.03em",
          lineHeight:    1,
          marginBottom:  4,
          background:    hovered
            ? `linear-gradient(135deg, #fff 0%, ${stat.color} 100%)`
            : "none",
          color:         hovered ? "transparent" : "#e2e8f0",
          WebkitBackgroundClip: hovered ? "text" : undefined,
          WebkitTextFillColor:  hovered ? "transparent" : undefined,
          backgroundClip:       hovered ? "text" : undefined,
          textShadow:           hovered
            ? "none"
            : "0 1px 4px rgba(0,0,0,0.3)",
          transition:    "color 0.25s ease",
        }}
      >
        {inView ? `${count}${stat.suffix}` : `0${stat.suffix}`}
      </div>

      {/* Label */}
      <p
        style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      "8.5px",
          fontWeight:    700,
          color:         "rgba(255,255,255,0.32)",
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
          marginBottom:  8,
          lineHeight:    1,
          userSelect:    "none",
        }}
      >
        {stat.label}
      </p>

      {/* Sparkline */}
      <Sparkline
        data={stat.trend}
        color={stat.color}
        animated={sparkReady}
      />

      {/* Sublabel + trend arrow */}
      <div
        style={{
          display:    "flex",
          alignItems: "center",
          justifyContent: "center",
          gap:        5,
          marginTop:  5,
        }}
      >
        <span
          style={{
            fontFamily:  "'Inter', sans-serif",
            fontSize:    "8.5px",
            fontWeight:  600,
            color:       hovered
              ? stat.color
              : "rgba(255,255,255,0.22)",
            transition:  "color 0.25s ease",
            userSelect:  "none",
          }}
        >
          {stat.sublabel}
        </span>
        {hovered && <TrendArrow color={stat.color} />}
      </div>
    </div>
  );
}

// ── Główny komponent ──────────────────────────────────────
export default function StatsRow() {
  const { ref, inView } = useInView(0.25);

  return (
    <>
      <style>{`
        @keyframes sparkPulse {
          0%   { r: 2.5; opacity: 0.4; }
          50%  { r: 5;   opacity: 0;   }
          100% { r: 2.5; opacity: 0;   }
        }
        @keyframes badgeBounce {
          0%,100% { transform: translateY(0)    rotate(-5deg); }
          50%     { transform: translateY(-3px) rotate(5deg);  }
        }
      `}</style>

      <div
        ref={ref}
        role="list"
        aria-label="Statystyki kanałów MALTIXON"
        style={{
          display:      "grid",
          gridTemplate: "1fr / repeat(3, 1fr)",
          borderRadius: 14,
          overflow:     "hidden",
          background:   "rgba(255,255,255,0.02)",
          border:       "1px solid rgba(255,255,255,0.05)",
          marginTop:    16,
          marginBottom: 4,
        }}
      >
        {STATS.map((stat, i) => (
          <StatCard
            key={stat.id}
            stat={stat}
            index={i}
            inView={inView}
            isLast={i === STATS.length - 1}
          />
        ))}
      </div>
    </>
  );
}

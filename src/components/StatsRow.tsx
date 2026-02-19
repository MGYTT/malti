"use client";

import { useState, useEffect, useRef } from "react";

// ── Typy ─────────────────────────────────────────────────
type StatItem = {
  id:       string;
  value:    number;        // wartość numeryczna do animacji
  display:  string;        // końcowy tekst (np. "592K")
  label:    string;
  sublabel: string;        // dodatkowy kontekst
  icon:     string;        // emoji ikona
  color:    string;        // kolor akcentu
  suffix:   string;        // "K", "M+", "K" itp.
  platform: string;        // nazwa platformy
};

// ── Dane statystyk ────────────────────────────────────────
const STATS: StatItem[] = [
  {
    id:       "subscribers",
    value:    592,
    display:  "592K",
    label:    "Subskrybentów",
    sublabel: "YouTube",
    icon:     "▶",
    color:    "#ff4444",
    suffix:   "K",
    platform: "YouTube",
  },
  {
    id:       "views",
    value:    65,
    display:  "65M+",
    label:    "Wyświetleń",
    sublabel: "Łącznie",
    icon:     "👁",
    color:    "#a78bfa",
    suffix:   "M+",
    platform: "All",
  },
  {
    id:       "followers",
    value:    40,
    display:  "40K",
    label:    "Obserwujących",
    sublabel: "Instagram",
    icon:     "📸",
    color:    "#e1306c",
    suffix:   "K",
    platform: "Instagram",
  },
];

// ── Hook — licznik z ease-out ─────────────────────────────
function useCountUp(
  target:   number,
  duration: number = 1400,
  delay:    number = 0,
  active:   boolean = false,
) {
  const [count, setCount] = useState(0);
  const rafRef  = useRef<number>(0);
  const startTs = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const timer = setTimeout(() => {
      startTs.current = 0;

      function step(ts: number) {
        if (!startTs.current) startTs.current = ts;
        const elapsed  = ts - startTs.current;
        const progress = Math.min(elapsed / duration, 1);

        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setCount(target);
        }
      }

      rafRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, target, duration, delay]);

  return count;
}

// ── Hook — Intersection Observer ──────────────────────────
function useInView() {
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
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

// ── Sparkline — mini wykres dekoracyjny ───────────────────
function Sparkline({ color }: { color: string }) {
  // Pseudo-losowe punkty wykresu (zawsze rosnące)
  const points = [2, 5, 3, 8, 6, 11, 9, 14, 12, 16];
  const max    = Math.max(...points);
  const w      = 40;
  const h      = 16;

  const pathD = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / max) * h;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Area pod wykresem
  const areaD =
    pathD +
    ` L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {/* Area fill */}
      <path
        d={areaD}
        fill={color}
        fillOpacity={0.08}
      />
      {/* Linia */}
      <path
        d={pathD}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.6}
      />
      {/* Ostatni punkt */}
      <circle
        cx={w}
        cy={h - (points[points.length - 1] / max) * h}
        r={2}
        fill={color}
        fillOpacity={0.9}
      />
    </svg>
  );
}

// ── Pojedyncza statystyka ─────────────────────────────────
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
  const count   = useCountUp(stat.value, 1300, index * 180, inView);
  const [hovered, setHovered] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  return (
    <div
      className="relative flex flex-col items-center text-center py-3 px-1
                 cursor-default select-none group"
      style={{
        borderRight: !isLast
          ? "1px solid rgba(255,255,255,0.06)"
          : undefined,
        transition: "background 0.2s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${stat.color}14, transparent 70%)`,
          opacity:    hovered ? 1 : 0,
        }}
      />

      {/* Ikona platformy */}
      <div
        className="mb-1.5 transition-transform duration-200"
        style={{
          transform: hovered ? "scale(1.2)" : "scale(1)",
          fontSize:  "13px",
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        {stat.icon}
      </div>

      {/* Licznik */}
      <div
        className="relative leading-none mb-1"
        style={{
          fontSize:    "18px",
          fontWeight:  800,
          letterSpacing: "-0.5px",
          color:       hovered ? stat.color : "#e2e8f0",
          transition:  "color 0.2s ease",
          textShadow:  hovered ? `0 0 20px ${stat.color}60` : "none",
        }}
      >
        {/* Animowany licznik */}
        <span>
          {inView ? `${count}${stat.suffix}` : "0"}
        </span>
      </div>

      {/* Label */}
      <p
        className="m-0 leading-none mb-1"
        style={{
          fontSize:   "9px",
          fontWeight: 600,
          color:      "rgba(255,255,255,0.35)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {stat.label}
      </p>

      {/* Sparkline + sublabel */}
      <div className="flex flex-col items-center gap-1 mt-1.5">
        <Sparkline color={stat.color} />
        <span
          style={{
            fontSize:   "9px",
            fontWeight: 500,
            color:      hovered ? stat.color : "rgba(255,255,255,0.2)",
            transition: "color 0.2s ease",
          }}
        >
          {stat.sublabel}
        </span>
      </div>
    </div>
  );
}

// ── Główny komponent ──────────────────────────────────────
export default function StatsRow() {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className="grid grid-cols-3 rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border:     "1px solid rgba(255,255,255,0.05)",
        opacity:    inView ? 1 : 0,
        transform:  inView ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
      }}
      role="list"
      aria-label="Statystyki kanałów"
    >
      {STATS.map((stat, i) => (
        <div key={stat.id} role="listitem">
          <StatCard
            stat={stat}
            index={i}
            inView={inView}
            isLast={i === STATS.length - 1}
          />
        </div>
      ))}
    </div>
  );
}

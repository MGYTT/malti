"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Typy ─────────────────────────────────────────────────
type Orb = {
  x:        number;   // pozycja X w %
  y:        number;   // pozycja Y w %
  size:     number;   // rozmiar w px
  color:    string;   // kolor hex
  blur:     number;   // blur w px
  opacity:  number;   // opacity 0–1
  speedX:   number;   // prędkość ruchu X
  speedY:   number;   // prędkość ruchu Y
  rangeX:   number;   // zakres ruchu X w px
  rangeY:   number;   // zakres ruchu Y w px
  phase:    number;   // faza startowa animacji (0–2π)
};

type Particle = {
  x:       number;
  y:       number;
  size:    number;
  opacity: number;
  speedY:  number;
  speedX:  number;
  life:    number;  // 0–1
};

// ── Konfiguracja orbów ────────────────────────────────────
const ORB_CONFIG: Orb[] = [
  {
    x: 15,  y: 10,  size: 560, color: "#6c63ff",
    blur: 110, opacity: 0.18,
    speedX: 0.4, speedY: 0.35,
    rangeX: 60,  rangeY: 50,
    phase: 0,
  },
  {
    x: 80,  y: 75,  size: 420, color: "#a855f7",
    blur: 100, opacity: 0.15,
    speedX: 0.3, speedY: 0.25,
    rangeX: 50,  rangeY: 40,
    phase: Math.PI * 0.7,
  },
  {
    x: 60,  y: 45,  size: 300, color: "#3b82f6",
    blur: 90,  opacity: 0.13,
    speedX: 0.5, speedY: 0.4,
    rangeX: 40,  rangeY: 35,
    phase: Math.PI * 1.3,
  },
  {
    x: 35,  y: 65,  size: 260, color: "#7c3aed",
    blur: 95,  opacity: 0.1,
    speedX: 0.25, speedY: 0.3,
    rangeX: 35,   rangeY: 45,
    phase: Math.PI * 0.4,
  },
  {
    x: 88,  y: 20,  size: 200, color: "#06b6d4",
    blur: 80,  opacity: 0.08,
    speedX: 0.35, speedY: 0.45,
    rangeX: 30,   rangeY: 30,
    phase: Math.PI * 1.8,
  },
];

// ── Canvas — orby ─────────────────────────────────────────
function useOrbCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dt    = timestamp - timeRef.current;
    timeRef.current = timestamp;
    const t     = timestamp * 0.001; // sekundy

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ORB_CONFIG.forEach((orb) => {
      // Płynna sinusoidalna trajektoria
      const offsetX = Math.sin(t * orb.speedX + orb.phase) * orb.rangeX;
      const offsetY = Math.cos(t * orb.speedY + orb.phase) * orb.rangeY;

      const cx = (orb.x / 100) * canvas.width  + offsetX;
      const cy = (orb.y / 100) * canvas.height + offsetY;
      const r  = orb.size / 2;

      // Radialny gradient = miękki orb
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0,   hexToRgba(orb.color, orb.opacity));
      grad.addColorStop(0.4, hexToRgba(orb.color, orb.opacity * 0.6));
      grad.addColorStop(1,   hexToRgba(orb.color, 0));

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    animRef.current = requestAnimationFrame(draw);
  }, [canvasRef]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);
}

// ── Canvas — siatka ───────────────────────────────────────
function useGridCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const CELL = 60;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Linie pionowe z gradientem opacity
    for (let x = 0; x <= canvas.width; x += CELL) {
      const grad = ctx.createLinearGradient(x, 0, x, canvas.height);
      grad.addColorStop(0,   "rgba(108,99,255,0)");
      grad.addColorStop(0.3, "rgba(108,99,255,0.05)");
      grad.addColorStop(0.7, "rgba(108,99,255,0.05)");
      grad.addColorStop(1,   "rgba(108,99,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Linie poziome z gradientem opacity
    for (let y = 0; y <= canvas.height; y += CELL) {
      const grad = ctx.createLinearGradient(0, y, canvas.width, y);
      grad.addColorStop(0,   "rgba(108,99,255,0)");
      grad.addColorStop(0.3, "rgba(108,99,255,0.05)");
      grad.addColorStop(0.7, "rgba(108,99,255,0.05)");
      grad.addColorStop(1,   "rgba(108,99,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, [canvasRef]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, [draw]);
}

// ── Canvas — cząsteczki (particles) ──────────────────────
function useParticleCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const animRef    = useRef<number>(0);
  const particles  = useRef<Particle[]>([]);

  // Inicjalizacja cząsteczek
  function spawnParticle(width: number, height: number): Particle {
    return {
      x:       Math.random() * width,
      y:       height + 10,
      size:    Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.4 + 0.1,
      speedY:  -(Math.random() * 0.5 + 0.2),
      speedX:  (Math.random() - 0.5) * 0.3,
      life:    1,
    };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Spawn startowy
    for (let i = 0; i < 40; i++) {
      const p = spawnParticle(canvas.width, canvas.height);
      p.y = Math.random() * canvas.height; // rozprosz startowo
      particles.current.push(p);
    }

    function animate() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Aktualizuj i rysuj cząsteczki
      particles.current = particles.current
        .map((p) => ({
          ...p,
          x:    p.x + p.speedX,
          y:    p.y + p.speedY,
          life: p.life - 0.003,
        }))
        .filter((p) => p.life > 0 && p.y > -20);

      // Uzupełniaj cząsteczki
      while (particles.current.length < 45) {
        particles.current.push(
          spawnParticle(canvas.width, canvas.height)
        );
      }

      particles.current.forEach((p) => {
        const alpha = p.opacity * p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,139,250,${alpha})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [canvasRef]);
}

// ── Pomocnik hex → rgba ───────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Główny komponent ──────────────────────────────────────
export default function Background() {
  const orbCanvasRef      = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef     = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

  // Resize orbCanvas
  useEffect(() => {
    function resize() {
      if (orbCanvasRef.current) {
        orbCanvasRef.current.width  = window.innerWidth;
        orbCanvasRef.current.height = window.innerHeight;
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useOrbCanvas(orbCanvasRef);
  useGridCanvas(gridCanvasRef);
  useParticleCanvas(particleCanvasRef);

  return (
    <div aria-hidden="true">

      {/* 1 — Gradient base */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg,#07070f 0%,#0b0b1a 30%,#090d18 65%,#060609 100%)",
        }}
      />

      {/* 2 — Orby animowane (canvas) */}
      <canvas
        ref={orbCanvasRef}
        className="fixed inset-0 z-[1] pointer-events-none"
      />

      {/* 3 — Siatka (canvas z gradientowymi liniami) */}
      <canvas
        ref={gridCanvasRef}
        className="fixed inset-0 z-[2] pointer-events-none"
      />

      {/* 4 — Cząsteczki (canvas) */}
      <canvas
        ref={particleCanvasRef}
        className="fixed inset-0 z-[3] pointer-events-none"
      />

      {/* 5 — Noise texture overlay */}
      <div
        className="fixed inset-0 z-[4] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256'
            xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E
            %3CfeTurbulence type='fractalNoise' baseFrequency='0.9'
            numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E
            %3Crect width='100%25' height='100%25' filter='url(%23noise)'
            opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize:   "256px 256px",
          opacity:          0.35,
        }}
      />

      {/* 6 — Vignette */}
      <div
        className="fixed inset-0 z-[5] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* 7 — Subtelna górna poświata (aurora) */}
      <div
        className="fixed top-0 left-0 right-0 z-[4] pointer-events-none"
        style={{
          height:     "35vh",
          background:
            "linear-gradient(180deg, rgba(108,99,255,0.07) 0%, transparent 100%)",
        }}
      />

    </div>
  );
}

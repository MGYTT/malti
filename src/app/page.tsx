"use client";

import {
  useEffect, useRef, useState,
  useCallback, useMemo,
} from "react";

import Background    from "@/components/Background";
import AvatarHeader  from "@/components/AvatarHeader";
import StatsRow      from "@/components/StatsRow";
import SocialIcons   from "@/components/SocialIcons";
import LinksList     from "@/components/LinksList";
import CollabSection from "@/components/CollabSection";
import LoadingScreen from "@/components/LoadingScreen";

// ── Typy ─────────────────────────────────────────────────
type AppPhase = "loading" | "entering" | "ready";

type Section = {
  id:    string;
  label: string;
  icon:  string;
};

// ── Sekcje ────────────────────────────────────────────────
const SECTIONS: Section[] = [
  { id: "profile", label: "Profil",     icon: "◉" },
  { id: "links",   label: "Linki",      icon: "⬡" },
  { id: "collab",  label: "Współpraca", icon: "✦" },
];

// ── Hook — aktywna sekcja ─────────────────────────────────
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.3, rootMargin: "-10% 0px -50% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);

  return active;
}

// ── Hook — scroll progress ────────────────────────────────
function useScrollProgress(ref: React.RefObject<HTMLDivElement>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const max = scrollHeight - clientHeight;
      setProgress(max > 0 ? scrollTop / max : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [ref]);

  return progress;
}

// ── Hook — mount sequence ─────────────────────────────────
function useMountSequence(active: boolean) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timers = [
      setTimeout(() => setStep(1),  60),
      setTimeout(() => setStep(2), 200),
      setTimeout(() => setStep(3), 360),
      setTimeout(() => setStep(4), 520),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return step;
}

// ── Hook — element in viewport ────────────────────────────
function useInView(threshold = 0.15) {
  const ref     = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ── Scroll progress bar ───────────────────────────────────
function ScrollProgressBar({ progress }: { progress: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position:   "fixed",
        top:        0,
        left:       0,
        right:      0,
        zIndex:     50,
        height:     2,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          height:     "100%",
          width:      `${progress * 100}%`,
          background: "linear-gradient(90deg,#6c63ff,#a855f7,#3b82f6)",
          transition: "width 0.1s linear",
          boxShadow:  progress > 0
            ? "0 0 12px rgba(108,99,255,0.7)"
            : "none",
        }}
      />
    </div>
  );
}

// ── Side navigation ───────────────────────────────────────
function SideNav({
  sections,
  active,
  containerRef,
}: {
  sections:     Section[];
  active:       string;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const scrollTo = useCallback((id: string) => {
    const el  = document.getElementById(id);
    const cnt = containerRef.current;
    if (!el || !cnt) return;
    cnt.scrollTo({ top: el.offsetTop - 32, behavior: "smooth" });
  }, [containerRef]);

  return (
    <nav
      aria-label="Nawigacja sekcji"
      style={{
        position:       "fixed",
        right:          16,
        top:            "50%",
        transform:      "translateY(-50%)",
        zIndex:         40,
        display:        "flex",
        flexDirection:  "column",
        gap:            14,
      }}
    >
      {sections.map((s) => {
        const isActive  = active === s.id;
        const isHovered = hoveredId === s.id;

        return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            onMouseEnter={() => setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            title={s.label}
            aria-label={s.label}
            aria-current={isActive ? "true" : undefined}
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "flex-end",
              gap:            7,
              background:     "none",
              border:         "none",
              cursor:         "pointer",
              padding:        0,
              outline:        "none",
            }}
          >
            {/* Label — slide in on hover/active */}
            <span
              style={{
                fontFamily:    "'Inter', sans-serif",
                fontSize:      "9.5px",
                fontWeight:    600,
                letterSpacing: "0.08em",
                color:         (isActive || isHovered)
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(255,255,255,0)",
                transform:     (isActive || isHovered)
                  ? "translateX(0)"
                  : "translateX(6px)",
                opacity:       (isActive || isHovered) ? 1 : 0,
                transition:    "all 0.25s cubic-bezier(.22,1,.36,1)",
                userSelect:    "none",
                whiteSpace:    "nowrap",
              }}
            >
              {s.label}
            </span>

            {/* Dot */}
            <div
              style={{
                width:        isActive ? 10 : isHovered ? 8 : 6,
                height:       isActive ? 10 : isHovered ? 8 : 6,
                borderRadius: "50%",
                flexShrink:   0,
                background:   isActive
                  ? "linear-gradient(135deg,#6c63ff,#a855f7)"
                  : isHovered
                  ? "rgba(108,99,255,0.6)"
                  : "rgba(255,255,255,0.22)",
                boxShadow:    isActive
                  ? "0 0 12px rgba(108,99,255,0.9)"
                  : isHovered
                  ? "0 0 8px rgba(108,99,255,0.5)"
                  : "none",
                border:       (!isActive && !isHovered)
                  ? "1px solid rgba(255,255,255,0.14)"
                  : "none",
                transition:   "all 0.3s cubic-bezier(.34,1.56,.64,1)",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}

// ── Section divider ───────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            10,
        padding:        "2px 0",
      }}
    >
      <div
        style={{
          flex:       1,
          height:     1,
          background: "linear-gradient(90deg,rgba(108,99,255,0.25),transparent)",
        }}
      />
      <span
        style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      "8.5px",
          fontWeight:    700,
          letterSpacing: "0.18em",
          textTransform: "uppercase" as const,
          color:         "rgba(255,255,255,0.2)",
          userSelect:    "none",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex:       1,
          height:     1,
          background: "linear-gradient(90deg,transparent,rgba(108,99,255,0.25))",
        }}
      />
    </div>
  );
}

// ── Animated section — wchodzi gdy w viewport ─────────────
function FadeSection({
  delay   = 0,
  translateY = 14,
  children,
}: {
  delay?:      number;
  translateY?: number;
  children:    React.ReactNode;
}) {
  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      style={{
        opacity:    inView ? 1 : 0,
        transform:  inView
          ? "translateY(0px)"
          : `translateY(${translateY}px)`,
        transition: `opacity 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms,
                     transform 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Enter animation wrapper — dla pierwszego renderu ──────
function EnterSection({
  step,
  minStep,
  delay   = 0,
  children,
}: {
  step:     number;
  minStep:  number;
  delay?:   number;
  children: React.ReactNode;
}) {
  const show = step >= minStep;

  return (
    <div
      style={{
        opacity:    show ? 1 : 0,
        transform:  show ? "translateY(0px) scale(1)" : "translateY(14px) scale(0.99)",
        transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms,
                     transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Karta główna ──────────────────────────────────────────
function MainCard({
  step,
  children,
}: {
  step:     number;
  children: React.ReactNode;
}) {
  const show = step >= 1;

  return (
    <div
      className="glass"
      style={{
        opacity:    show ? 1 : 0,
        transform:  show
          ? "translateY(0px) scale(1)"
          : "translateY(32px) scale(0.97)",
        transition:
          "opacity 0.7s cubic-bezier(.22,1,.36,1), " +
          "transform 0.7s cubic-bezier(.22,1,.36,1)",
        // GPU acceleration
        willChange: show ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────
function Footer({ visible }: { visible: boolean }) {
  return (
    <div
      style={{
        textAlign:  "center",
        padding:    "12px 0 32px",
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s",
      }}
    >
      <p
        style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      "10px",
          color:         "rgba(255,255,255,0.13)",
          fontWeight:    500,
          letterSpacing: "0.04em",
          userSelect:    "none",
          lineHeight:    1.6,
        }}
      >
        © {new Date().getFullYear()} MALTIXON
        <span style={{ margin: "0 7px", opacity: 0.4 }}>•</span>
        Wszelkie prawa zastrzeżone
        <span style={{ margin: "0 7px", opacity: 0.4 }}>•</span>
        <span style={{ color: "rgba(108,99,255,0.45)" }}>v2.0</span>
      </p>
    </div>
  );
}

// ── Overlay — page transition po LoadingScreen ────────────
function PageTransitionOverlay({ phase }: { phase: AppPhase }) {
  const visible = phase === "entering";

  return (
    <div
      aria-hidden="true"
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        9998,
        background:    "#07070f",
        opacity:       visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
        transition:    "opacity 0.55s cubic-bezier(.22,1,.36,1)",
      }}
    />
  );
}

// ── Główna strona ─────────────────────────────────────────
export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("loading");
  const containerRef      = useRef<HTMLDivElement>(null);
  const progress          = useScrollProgress(containerRef);
  const step              = useMountSequence(phase === "ready");
  const sectionIds        = useMemo(() => SECTIONS.map((s) => s.id), []);
  const active            = useActiveSection(sectionIds);

  // Loading → entering → ready
  const handleLoadComplete = useCallback(() => {
    setPhase("entering");
    // Krótki beat — overlay znika płynnie
    setTimeout(() => setPhase("ready"), 80);
  }, []);

  if (phase === "loading") {
    return <LoadingScreen onComplete={handleLoadComplete} />;
  }

  return (
    <>
      {/* Overlay przejścia */}
      <PageTransitionOverlay phase={phase} />

      {/* Pasek scrollowania */}
      <ScrollProgressBar progress={progress} />

      {/* Nawigacja boczna */}
      <SideNav
        sections={SECTIONS}
        active={active}
        containerRef={containerRef}
      />

      {/* Tło */}
      <Background />

      {/* Kontener scrollowania */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-screen overflow-y-auto
                   scroll-container"
        style={{ scrollBehavior: "smooth" }}
      >
        <div
          style={{
            display:        "flex",
            justifyContent: "center",
            padding:        "clamp(28px, 5vw, 48px) 16px",
            minHeight:      "100%",
          }}
        >
          <div
            style={{
              width:    "100%",
              maxWidth: 420,
              display:  "flex",
              flexDirection: "column",
              gap:      16,
            }}
          >

            {/* ════ KARTA GŁÓWNA ════ */}
            <MainCard step={step}>

              {/* ══ PROFIL ══════════════════════════ */}
              <section
                id="profile"
                aria-label="Profil MALTIXON"
                style={{ padding: "clamp(20px, 5vw, 28px) clamp(16px, 5vw, 24px) 20px" }}
              >
                {/* Avatar — wchodzi jako pierwszy */}
                <EnterSection step={step} minStep={1} delay={40}>
                  <AvatarHeader />
                </EnterSection>

                {/* Stats */}
                <EnterSection step={step} minStep={2} delay={80}>
                  <StatsRow />
                </EnterSection>

                {/* Social icons */}
                <EnterSection step={step} minStep={2} delay={140}>
                  <div
                    style={{
                      height:     1,
                      background: "rgba(255,255,255,0.05)",
                      margin:     "18px 0 16px",
                    }}
                  />
                  <p
                    className="section-label"
                    style={{ marginBottom: 10 }}
                  >
                    Media społecznościowe
                  </p>
                  <SocialIcons />
                </EnterSection>
              </section>

              {/* ══ LINKI ════════════════════════════ */}
              <section
                id="links"
                aria-label="Linki MALTIXON"
                style={{ padding: "0 clamp(16px, 5vw, 24px) 20px" }}
              >
                <FadeSection delay={0}>
                  <SectionDivider label="Linki" />
                  <div style={{ marginTop: 12 }}>
                    <LinksList />
                  </div>
                </FadeSection>
              </section>

              {/* ══ WSPÓŁPRACA ═══════════════════════ */}
              <section
                id="collab"
                aria-label="Współpraca z MALTIXON"
                style={{ padding: "0 clamp(16px, 5vw, 24px) clamp(20px, 5vw, 28px)" }}
              >
                <FadeSection delay={60}>
                  <SectionDivider label="Współpraca" />
                  <div style={{ marginTop: 12 }}>
                    <CollabSection />
                  </div>
                </FadeSection>
              </section>

            </MainCard>

            {/* Footer */}
            <Footer visible={step >= 4} />

          </div>
        </div>
      </div>
    </>
  );
}

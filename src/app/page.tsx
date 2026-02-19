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
};

// ── Sekcje ────────────────────────────────────────────────
const SECTIONS: Section[] = [
  { id: "profile", label: "Profil"      },
  { id: "links",   label: "Linki"       },
  { id: "collab",  label: "Współpraca"  },
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
        { threshold: 0.25, rootMargin: "-10% 0px -45% 0px" },
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
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = el;
        const max = scrollHeight - clientHeight;
        setProgress(max > 0 ? scrollTop / max : 0);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
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
function useInView(threshold = 0.12) {
  const ref     = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ── Hook — back to top button ─────────────────────────────
function useShowBackToTop(ref: React.RefObject<HTMLDivElement>) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setShow(el.scrollTop > 280);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [ref]);

  return show;
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
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height:     "100%",
          width:      `${progress * 100}%`,
          background: "linear-gradient(90deg,#6c63ff,#a855f7,#3b82f6)",
          transition: "width 0.1s linear",
          boxShadow:  progress > 0.01
            ? "0 0 10px rgba(108,99,255,0.65)"
            : "none",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}

// ── Back to top button ────────────────────────────────────
function BackToTop({
  show,
  containerRef,
}: {
  show:         boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [containerRef]);

  return (
    <button
      onClick={scrollToTop}
      aria-label="Wróć na górę"
      title="Wróć na górę"
      style={{
        position:       "fixed",
        bottom:         24,
        right:          20,
        zIndex:         40,
        width:          36,
        height:         36,
        borderRadius:   "50%",
        background:     "rgba(108,99,255,0.18)",
        border:         "1px solid rgba(108,99,255,0.35)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        cursor:         "pointer",
        backdropFilter: "blur(10px)",
        boxShadow:      "0 4px 16px rgba(108,99,255,0.2)",
        opacity:        show ? 1 : 0,
        transform:      show ? "translateY(0) scale(1)" : "translateY(10px) scale(0.85)",
        pointerEvents:  show ? "all" : "none",
        transition:     "opacity 0.3s ease, transform 0.3s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      <svg
        width="14" height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </button>
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
    cnt.scrollTo({ top: el.offsetTop - 28, behavior: "smooth" });
  }, [containerRef]);

  return (
    <nav
      aria-label="Nawigacja sekcji"
      style={{
        position:      "fixed",
        right:         14,
        top:           "50%",
        transform:     "translateY(-50%)",
        zIndex:        40,
        display:       "flex",
        flexDirection: "column",
        gap:           14,
        // Ukryj na bardzo małych ekranach
      }}
    >
      {sections.map((s) => {
        const isActive  = active === s.id;
        const isHovered = hoveredId === s.id;
        const highlight = isActive || isHovered;

        return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            onMouseEnter={() => setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            title={s.label}
            aria-label={`Przejdź do sekcji: ${s.label}`}
            aria-current={isActive ? "true" : undefined}
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "flex-end",
              gap:            7,
              background:     "none",
              border:         "none",
              cursor:         "pointer",
              padding:        "2px 0",
              outline:        "none",
            }}
          >
            {/* Label */}
            <span
              style={{
                fontFamily:    "'Inter', sans-serif",
                fontSize:      "9px",
                fontWeight:    700,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color:         highlight
                  ? "rgba(255,255,255,0.72)"
                  : "transparent",
                transform:     highlight
                  ? "translateX(0)"
                  : "translateX(8px)",
                opacity:       highlight ? 1 : 0,
                transition:    "all 0.28s cubic-bezier(.22,1,.36,1)",
                userSelect:    "none",
                whiteSpace:    "nowrap",
              }}
            >
              {s.label}
            </span>

            {/* Dot */}
            <div
              style={{
                width:        isActive ? 10 : isHovered ? 7 : 5,
                height:       isActive ? 10 : isHovered ? 7 : 5,
                borderRadius: "50%",
                flexShrink:   0,
                background:   isActive
                  ? "linear-gradient(135deg,#6c63ff,#a855f7)"
                  : isHovered
                  ? "rgba(108,99,255,0.65)"
                  : "rgba(255,255,255,0.2)",
                boxShadow:    isActive
                  ? "0 0 14px rgba(108,99,255,0.9)"
                  : isHovered
                  ? "0 0 8px rgba(108,99,255,0.5)"
                  : "none",
                border:       !highlight
                  ? "1px solid rgba(255,255,255,0.13)"
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
        display:     "flex",
        alignItems:  "center",
        gap:         10,
        padding:     "2px 0",
        userSelect:  "none",
      }}
    >
      <div
        style={{
          flex:       1,
          height:     1,
          background: "linear-gradient(90deg,rgba(108,99,255,0.22),transparent)",
        }}
      />
      <span
        style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      "8px",
          fontWeight:    800,
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          color:         "rgba(255,255,255,0.18)",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex:       1,
          height:     1,
          background: "linear-gradient(90deg,transparent,rgba(108,99,255,0.22))",
        }}
      />
    </div>
  );
}

// ── Thin horizontal divider ───────────────────────────────
function HDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        height:     1,
        background: "rgba(255,255,255,0.05)",
        margin:     "18px 0 16px",
        flexShrink: 0,
      }}
    />
  );
}

// ── FadeSection — wchodzi gdy w viewport ──────────────────
function FadeSection({
  delay      = 0,
  translateY = 12,
  children,
}: {
  delay?:      number;
  translateY?: number;
  children:    React.ReactNode;
}) {
  const { ref, inView } = useInView(0.08);

  return (
    <div
      ref={ref}
      style={{
        opacity:    inView ? 1 : 0,
        transform:  inView
          ? "translateY(0px)"
          : `translateY(${translateY}px)`,
        transition: `
          opacity   0.55s cubic-bezier(.22,1,.36,1) ${delay}ms,
          transform 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms
        `,
      }}
    >
      {children}
    </div>
  );
}

// ── EnterSection — wchodzi przy mount ─────────────────────
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
        transform:  show
          ? "translateY(0px) scale(1)"
          : "translateY(16px) scale(0.99)",
        transition: `
          opacity   0.6s cubic-bezier(.22,1,.36,1) ${delay}ms,
          transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms
        `,
        willChange: show ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// ── MainCard ──────────────────────────────────────────────
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
          : "translateY(36px) scale(0.965)",
        transition:
          "opacity 0.75s cubic-bezier(.22,1,.36,1), " +
          "transform 0.75s cubic-bezier(.22,1,.36,1)",
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
    <footer
      style={{
        textAlign:  "center",
        padding:    "10px 0 28px",
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s",
      }}
    >
      <p
        style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      "10px",
          color:         "rgba(255,255,255,0.12)",
          fontWeight:    500,
          letterSpacing: "0.04em",
          userSelect:    "none",
          lineHeight:    1.7,
        }}
      >
        © {new Date().getFullYear()} MALTIXON
        <span style={{ margin: "0 6px", opacity: 0.35 }}>•</span>
        Wszelkie prawa zastrzeżone
        <span style={{ margin: "0 6px", opacity: 0.35 }}>•</span>
        <span style={{ color: "rgba(108,99,255,0.4)" }}>v2.0</span>
      </p>
    </footer>
  );
}

// ── PageTransitionOverlay ─────────────────────────────────
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
  const [phase, setPhase]   = useState<AppPhase>("loading");
  const containerRef        = useRef<HTMLDivElement>(null);
  const progress            = useScrollProgress(containerRef);
  const step                = useMountSequence(phase === "ready");
  const sectionIds          = useMemo(() => SECTIONS.map((s) => s.id), []);
  const active              = useActiveSection(sectionIds);
  const showBackToTop       = useShowBackToTop(containerRef);

  const handleLoadComplete = useCallback(() => {
    setPhase("entering");
    setTimeout(() => setPhase("ready"), 80);
  }, []);

  // ── Loading ───────────────────────────────────────────
  if (phase === "loading") {
    return <LoadingScreen onComplete={handleLoadComplete} />;
  }

  // ── App ───────────────────────────────────────────────
  return (
    <>
      <PageTransitionOverlay phase={phase} />
      <ScrollProgressBar     progress={progress} />
      <SideNav
        sections={SECTIONS}
        active={active}
        containerRef={containerRef}
      />
      <BackToTop
        show={showBackToTop}
        containerRef={containerRef}
      />
      <Background />

      {/* ── Kontener scrollowania ── */}
      <div
        ref={containerRef}
        className="scroll-container"
        style={{
          position:  "relative",
          zIndex:    10,
          width:     "100%",
          height:    "100dvh",   // dvh — poprawka dla mobile browsers
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display:        "flex",
            justifyContent: "center",
            padding:        "clamp(24px, 5vw, 44px) clamp(12px, 4vw, 20px)",
            minHeight:      "100%",
          }}
        >
          <div
            style={{
              width:         "100%",
              maxWidth:      420,
              display:       "flex",
              flexDirection: "column",
              gap:           14,
            }}
          >

            {/* ════════ KARTA GŁÓWNA ════════ */}
            <MainCard step={step}>

              {/* ══ SEKCJA: PROFIL ══ */}
              <section
                id="profile"
                aria-label="Profil MALTIXON"
                style={{
                  padding: "clamp(20px,5vw,28px) clamp(14px,5vw,22px) 20px",
                }}
              >
                <EnterSection step={step} minStep={1} delay={40}>
                  <AvatarHeader />
                </EnterSection>

                <EnterSection step={step} minStep={2} delay={90}>
                  <StatsRow />
                </EnterSection>

                <EnterSection step={step} minStep={2} delay={150}>
                  <HDivider />
                  <p className="section-label">
                    Media społecznościowe
                  </p>
                  <SocialIcons />
                </EnterSection>
              </section>

              {/* ══ SEKCJA: LINKI ══ */}
              <section
                id="links"
                aria-label="Linki MALTIXON"
                style={{
                  padding: "0 clamp(14px,5vw,22px) 20px",
                }}
              >
                <FadeSection delay={0}>
                  <SectionDivider label="Linki" />
                  <div style={{ marginTop: 11 }}>
                    <LinksList />
                  </div>
                </FadeSection>
              </section>

              {/* ══ SEKCJA: WSPÓŁPRACA ══ */}
              <section
                id="collab"
                aria-label="Współpraca z MALTIXON"
                style={{
                  padding: "0 clamp(14px,5vw,22px) clamp(20px,5vw,28px)",
                }}
              >
                <FadeSection delay={55}>
                  <SectionDivider label="Współpraca" />
                  <div style={{ marginTop: 11 }}>
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

"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import Background    from "@/components/Background";
import AvatarHeader  from "@/components/AvatarHeader";
import StatsRow      from "@/components/StatsRow";
import SocialIcons   from "@/components/SocialIcons";
import LinksList     from "@/components/LinksList";
import CollabSection from "@/components/CollabSection";
import LoadingScreen from "@/components/LoadingScreen";

// ── Typy ─────────────────────────────────────────────────
type AppPhase = "loading" | "ready";

type Section = {
  id:    string;
  label: string;
};

// ── Sekcje nawigacji ──────────────────────────────────────
const SECTIONS: Section[] = [
  { id: "profile",    label: "Profil"      },
  { id: "links",      label: "Linki"       },
  { id: "collab",     label: "Współpraca"  },
];

// ── Hook — aktywna sekcja ─────────────────────────────────
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { threshold: 0.35, rootMargin: "-10% 0px -50% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);

  return active;
}

// ── Hook — scroll progress ────────────────────────────────
function useScrollProgress(containerRef: React.RefObject<HTMLDivElement>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onScroll() {
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const max = scrollHeight - clientHeight;
      setProgress(max > 0 ? scrollTop / max : 0);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  return progress;
}

// ── Hook — mount animation sequence ──────────────────────
function useMountSequence(active: boolean) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timers = [
      setTimeout(() => setStep(1), 80),
      setTimeout(() => setStep(2), 220),
      setTimeout(() => setStep(3), 380),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return step;
}

// ── Scroll progress bar ───────────────────────────────────
function ScrollProgressBar({ progress }: { progress: number }) {
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50"
      style={{ height: 2, background: "rgba(255,255,255,0.04)" }}
    >
      <div
        style={{
          height:     "100%",
          width:      `${progress * 100}%`,
          background: "linear-gradient(90deg,#6c63ff,#a855f7,#3b82f6)",
          transition: "width 0.12s linear",
          boxShadow:  "0 0 10px rgba(108,99,255,0.7)",
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
  const scrollTo = useCallback(
    (id: string) => {
      const el  = document.getElementById(id);
      const cnt = containerRef.current;
      if (!el || !cnt) return;
      cnt.scrollTo({ top: el.offsetTop - 32, behavior: "smooth" });
    },
    [containerRef]
  );

  return (
    <nav
      aria-label="Nawigacja sekcji"
      className="fixed right-4 z-40 hidden sm:flex flex-col gap-3.5"
      style={{ top: "50%", transform: "translateY(-50%)" }}
    >
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            title={s.label}
            aria-label={s.label}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex items-center justify-end gap-2
                       outline-none focus-visible:ring-2
                       focus-visible:ring-violet-500 rounded-full"
          >
            {/* Label */}
            <span
              style={{
                fontFamily:    "'Inter', sans-serif",
                fontSize:      "10px",
                fontWeight:    600,
                letterSpacing: "0.06em",
                color:         isActive
                  ? "rgba(255,255,255,0.65)"
                  : "rgba(255,255,255,0)",
                transition:    "color 0.22s ease",
                userSelect:    "none",
              }}
            >
              {s.label}
            </span>

            {/* Dot */}
            <div
              style={{
                width:      isActive ? 10 : 6,
                height:     isActive ? 10 : 6,
                borderRadius: "50%",
                flexShrink:  0,
                background:  isActive
                  ? "linear-gradient(135deg,#6c63ff,#a855f7)"
                  : "rgba(255,255,255,0.22)",
                boxShadow:   isActive
                  ? "0 0 10px rgba(108,99,255,0.8)"
                  : "none",
                border:      isActive
                  ? "none"
                  : "1px solid rgba(255,255,255,0.15)",
                transition:  "all 0.3s cubic-bezier(.34,1.56,.64,1)",
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
    <div className="flex items-center gap-3 py-0.5">
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
          fontSize:      "9px",
          fontWeight:    700,
          letterSpacing: "0.16em",
          textTransform: "uppercase" as const,
          color:         "rgba(255,255,255,0.18)",
          userSelect:    "none",
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

// ── Footer ────────────────────────────────────────────────
function Footer({ visible }: { visible: boolean }) {
  return (
    <div
      className="text-center pb-8 pt-3"
      style={{
        opacity:    visible ? 1 : 0,
        transition: "opacity 0.5s ease 0.4s",
      }}
    >
      <p
        style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      "10px",
          color:         "rgba(255,255,255,0.14)",
          fontWeight:    500,
          letterSpacing: "0.04em",
          userSelect:    "none",
        }}
      >
        © {new Date().getFullYear()} MALTIXON
        <span style={{ margin: "0 8px", opacity: 0.5 }}>•</span>
        Wszelkie prawa zastrzeżone
        <span style={{ margin: "0 8px", opacity: 0.5 }}>•</span>
        <span style={{ color: "rgba(108,99,255,0.5)" }}>v2.0</span>
      </p>
    </div>
  );
}

// ── Card Wrapper ──────────────────────────────────────────
function CardWrapper({
  step,
  children,
}: {
  step:     number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="glass"
      style={{
        opacity:    step >= 1 ? 1 : 0,
        transform:  step >= 1
          ? "translateY(0px) scale(1)"
          : "translateY(28px) scale(0.96)",
        transition:
          "opacity 0.65s cubic-bezier(.22,1,.36,1), " +
          "transform 0.65s cubic-bezier(.22,1,.36,1)",
      }}
    >
      {children}
    </div>
  );
}

// ── Animated Section ──────────────────────────────────────
function AnimatedSection({
  show,
  delay = 0,
  children,
}: {
  show:     boolean;
  delay?:   number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        opacity:    show ? 1 : 0,
        transform:  show ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Główna strona ─────────────────────────────────────────
export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("loading");
  const containerRef      = useRef<HTMLDivElement>(null);
  const progress          = useScrollProgress(containerRef);
  const step              = useMountSequence(phase === "ready");
  const active            = useActiveSection(SECTIONS.map((s) => s.id));

  // ── Faza: Loading Screen ──────────────────────────────
  if (phase === "loading") {
    return (
      <LoadingScreen
        onComplete={() => setPhase("ready")}
      />
    );
  }

  // ── Faza: Ready ───────────────────────────────────────
  return (
    <>
      {/* Pasek postępu scrollowania */}
      <ScrollProgressBar progress={progress} />

      {/* Nawigacja boczna */}
      <SideNav
        sections={SECTIONS}
        active={active}
        containerRef={containerRef}
      />

      {/* Tło animowane */}
      <Background />

      {/* Główny kontener scrollowania */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-screen overflow-y-auto
                   scroll-container"
      >
        <div className="flex justify-center px-4 py-10 min-h-full">
          <div className="w-full max-w-[420px] flex flex-col">

            {/* ════ KARTA GŁÓWNA ════ */}
            <CardWrapper step={step}>

              {/* ══ PROFIL ══════════════════════════ */}
              <section
                id="profile"
                aria-label="Profil MALTIXON"
                className="px-6 pt-7 pb-5"
              >
                <AnimatedSection show={step >= 1} delay={50}>
                  <AvatarHeader />
                </AnimatedSection>

                <AnimatedSection show={step >= 2} delay={100}>
                  <StatsRow />
                </AnimatedSection>

                <AnimatedSection show={step >= 2} delay={160}>
                  <div className="divider my-5" />
                  <p className="section-label">
                    Media społecznościowe
                  </p>
                  <SocialIcons />
                </AnimatedSection>
              </section>

              {/* ══ LINKI ════════════════════════════ */}
              <section
                id="links"
                aria-label="Linki MALTIXON"
                className="px-6 pb-5"
              >
                <AnimatedSection show={step >= 3} delay={60}>
                  <SectionDivider label="Linki" />
                  <div className="mt-3">
                    <LinksList />
                  </div>
                </AnimatedSection>
              </section>

              {/* ══ WSPÓŁPRACA ═══════════════════════ */}
              <section
                id="collab"
                aria-label="Współpraca z MALTIXON"
                className="px-6 pb-7"
              >
                <AnimatedSection show={step >= 3} delay={120}>
                  <SectionDivider label="Współpraca" />
                  <div className="mt-3">
                    <CollabSection />
                  </div>
                </AnimatedSection>
              </section>

            </CardWrapper>

            {/* Footer */}
            <Footer visible={step >= 3} />

          </div>
        </div>
      </div>
    </>
  );
}

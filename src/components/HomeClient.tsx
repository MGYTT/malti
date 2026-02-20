// src/components/HomeClient.tsx
"use client";

import {
  useEffect, useRef, useState,
  useCallback,
} from "react";

import Background         from "@/components/Background";
import AvatarHeader       from "@/components/AvatarHeader";
import StatsRow           from "@/components/StatsRow";
import SocialIcons        from "@/components/SocialIcons";
import LinksList          from "@/components/LinksList";
import CollabSection      from "@/components/CollabSection";
import LoadingScreen      from "@/components/LoadingScreen";
import NotificationBanner from "@/components/NotificationBanner";
import { ContentData }    from "@/types/content";

// ── Typy ─────────────────────────────────────────────────
type AppPhase = "loading" | "entering" | "ready";

// ── Hook — smooth scroll z easing ────────────────────────
// Natywny `behavior: "smooth"` ma różny easing w każdej
// przeglądarce. Własna implementacja na rAF daje pełną kontrolę.
function useSmoothScroll(containerRef: React.RefObject<HTMLDivElement>) {
  const rafRef      = useRef<number>(0);
  const startRef    = useRef<number>(0);
  const fromRef     = useRef<number>(0);
  const toRef       = useRef<number>(0);
  const durationRef = useRef<number>(680);

  // easeInOutQuart — przyjemniejszy niż easeInOutCubic przy dłuższych dystansach
  const ease = (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

  const scrollTo = useCallback((target: number, duration = 680) => {
    const el = containerRef.current;
    if (!el) return;

    cancelAnimationFrame(rafRef.current);

    fromRef.current     = el.scrollTop;
    toRef.current       = Math.max(0, Math.min(target, el.scrollHeight - el.clientHeight));
    durationRef.current = duration;
    startRef.current    = performance.now();

    const tick = (now: number) => {
      const elapsed  = now - startRef.current;
      const progress = Math.min(elapsed / durationRef.current, 1);
      const eased    = ease(progress);

      el.scrollTop = fromRef.current + (toRef.current - fromRef.current) * eased;

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [containerRef]);

  const scrollToTop = useCallback(() => {
    scrollTo(0, 600);
  }, [scrollTo]);

  // Cleanup przy odmontowaniu
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { scrollTo, scrollToTop };
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

// ── Hook — in view ────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Hook — back to top ────────────────────────────────────
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

// ── ScrollProgressBar ─────────────────────────────────────
function ScrollProgressBar({ progress }: { progress: number }) {
  return (
    <div aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 2, background: "rgba(255,255,255,0.04)", pointerEvents: "none" }}>
      <div style={{ height: "100%", width: `${progress * 100}%`, background: "linear-gradient(90deg,#6c63ff,#a855f7,#3b82f6)", transition: "width 0.1s linear", boxShadow: progress > 0.01 ? "0 0 10px rgba(108,99,255,0.65)" : "none", borderRadius: "0 2px 2px 0" }} />
    </div>
  );
}

// ── BackToTop ─────────────────────────────────────────────
function BackToTop({
  show,
  onScrollToTop,
}: {
  show:          boolean;
  onScrollToTop: () => void;
}) {
  return (
    <button
      onClick={onScrollToTop}
      aria-label="Wróć na górę"
      title="Wróć na górę"
      style={{ position: "fixed", bottom: 24, right: 20, zIndex: 40, width: 36, height: 36, borderRadius: "50%", background: "rgba(108,99,255,0.18)", border: "1px solid rgba(108,99,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(10px)", boxShadow: "0 4px 16px rgba(108,99,255,0.2)", opacity: show ? 1 : 0, transform: show ? "translateY(0) scale(1)" : "translateY(10px) scale(0.85)", pointerEvents: show ? "all" : "none", transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(.34,1.56,.64,1)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </button>
  );
}

// ── SectionDivider ────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 0", userSelect: "none" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(108,99,255,0.22),transparent)" }} />
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(108,99,255,0.22))" }} />
    </div>
  );
}

// ── HDivider ──────────────────────────────────────────────
function HDivider() {
  return (
    <div aria-hidden="true" style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "18px 0 16px", flexShrink: 0 }} />
  );
}

// ── FadeSection ───────────────────────────────────────────
function FadeSection({
  delay = 0,
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
        transform:  inView ? "translateY(0px)" : `translateY(${translateY}px)`,
        transition: `opacity 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── EnterSection ──────────────────────────────────────────
function EnterSection({
  step,
  minStep,
  delay = 0,
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
        transform:  show ? "translateY(0px) scale(1)" : "translateY(16px) scale(0.99)",
        transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        willChange: show ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// ── MainCard ──────────────────────────────────────────────
function MainCard({ step, children }: { step: number; children: React.ReactNode }) {
  const show = step >= 1;
  return (
    <div
      className="glass"
      style={{
        opacity:    show ? 1 : 0,
        transform:  show ? "translateY(0px) scale(1)" : "translateY(36px) scale(0.965)",
        transition: "opacity 0.75s cubic-bezier(.22,1,.36,1), transform 0.75s cubic-bezier(.22,1,.36,1)",
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
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.12)", fontWeight: 500, letterSpacing: "0.04em", userSelect: "none", lineHeight: 1.7 }}>
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
        position:     "fixed",
        inset:        0,
        zIndex:       9998,
        background:   "#07070f",
        opacity:      visible ? 1 : 0,
        pointerEvents:visible ? "all" : "none",
        transition:   "opacity 0.55s cubic-bezier(.22,1,.36,1)",
      }}
    />
  );
}

// ── Główny komponent ──────────────────────────────────────
export default function HomeClient({ content }: { content: ContentData }) {
  const [phase, setPhase] = useState<AppPhase>("loading");
  const containerRef      = useRef<HTMLDivElement>(null);

  const { scrollTo, scrollToTop } = useSmoothScroll(containerRef);

  const progress      = useScrollProgress(containerRef);
  const step          = useMountSequence(phase === "ready");
  const showBackToTop = useShowBackToTop(containerRef);

  // Przechwytujemy natywny scroll kółkiem myszy i zastępujemy płynnym
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let accumulated = 0;
    let rafId       = 0;
    let lastTime    = 0;

    const onWheel = (e: WheelEvent) => {
      // Pozwalamy na natywny scroll poziomy (np. trackpad)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      e.preventDefault();

      const now   = performance.now();
      const delta = e.deltaMode === 1
        // deltaMode 1 = linie (Firefox) — przeliczamy na piksele
        ? e.deltaY * 32
        // deltaMode 0 = piksele, deltaMode 2 = strony
        : e.deltaMode === 2 ? e.deltaY * el.clientHeight : e.deltaY;

      // Jeśli minęło >150ms od ostatniego eventu — resetujemy akumulację
      if (now - lastTime > 150) accumulated = 0;
      lastTime     = now;
      accumulated += delta;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        scrollTo(el.scrollTop + accumulated, 520);
        accumulated = 0;
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(rafId);
    };
  }, [scrollTo]);

  // Smooth scroll dla touch (mobile) — natywny CSS
  // (rAF-based scroll na touch jest laggy — lepiej zostawić przeglądarce)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.scrollBehavior = "auto"; // wyłączamy natywny smooth — zastąpiony przez rAF
  }, []);

  const handleLoadComplete = useCallback(() => {
    setPhase("entering");
    setTimeout(() => setPhase("ready"), 80);
  }, []);

  if (phase === "loading") {
    return <LoadingScreen onComplete={handleLoadComplete} />;
  }

  return (
    <>
      <PageTransitionOverlay phase={phase} />
      <ScrollProgressBar     progress={progress} />
      <BackToTop show={showBackToTop} onScrollToTop={scrollToTop} />
      <Background />

      <div
        ref={containerRef}
        className="scroll-container"
        style={{
          position:  "relative",
          zIndex:    10,
          width:     "100%",
          height:    "100dvh",
          overflowY: "auto",
          // Natywny smooth scroll jako fallback dla touch / klawiatury
          scrollBehavior: "smooth",
          // Eliminuje "inercję" na iOS która mogłaby kolidować z rAF scrollem
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "clamp(24px, 5vw, 44px) clamp(12px, 4vw, 20px)", minHeight: "100%" }}>
          <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* ══ POWIADOMIENIA ══ */}
            <EnterSection step={step} minStep={1} delay={0}>
              <NotificationBanner notifications={content.notifications ?? []} />
            </EnterSection>

            <MainCard step={step}>

              {/* ══ PROFIL ══ */}
              <section id="profile" aria-label="Profil MALTIXON" style={{ padding: "clamp(20px,5vw,28px) clamp(14px,5vw,22px) 20px" }}>
                <EnterSection step={step} minStep={1} delay={40}>
                  <AvatarHeader profile={content.profile} />
                </EnterSection>
                <EnterSection step={step} minStep={2} delay={90}>
                  <StatsRow stats={content.stats} />
                </EnterSection>
                <EnterSection step={step} minStep={2} delay={150}>
                  <HDivider />
                  <p className="section-label">Media społecznościowe</p>
                  <SocialIcons />
                </EnterSection>
              </section>

              {/* ══ LINKI ══ */}
              <section id="links" aria-label="Linki MALTIXON" style={{ padding: "0 clamp(14px,5vw,22px) 20px" }}>
                <FadeSection delay={0}>
                  <SectionDivider label="Linki" />
                  <div style={{ marginTop: 11 }}>
                    <LinksList links={content.links} />
                  </div>
                </FadeSection>
              </section>

              {/* ══ WSPÓŁPRACA ══ */}
              <section id="collab" aria-label="Współpraca z MALTIXON" style={{ padding: "0 clamp(14px,5vw,22px) clamp(20px,5vw,28px)" }}>
                <FadeSection delay={55}>
                  <SectionDivider label="Współpraca" />
                  <div style={{ marginTop: 11 }}>
                    <CollabSection
                      status={content.status}
                      preferred={content.profile.preferred}
                    />
                  </div>
                </FadeSection>
              </section>

            </MainCard>

            <Footer visible={step >= 4} />
          </div>
        </div>
      </div>
    </>
  );
}

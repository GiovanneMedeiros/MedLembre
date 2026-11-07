import { MotionConfig } from "motion/react";
import { Header } from "../components/landing/Header";
import { Hero } from "../components/landing/Hero";
import { DayStatement } from "../components/landing/DayStatement";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Benefits } from "../components/landing/Benefits";
import { Pricing } from "../components/landing/Pricing";
import { Faq } from "../components/landing/Faq";
import { CtaBand } from "../components/landing/CtaBand";
import { Footer } from "../components/landing/Footer";

export function LandingPage() {
  return (
    // reducedMotion="user": quem pediu "reduzir movimento" no sistema vê só fades, sem deslocamentos
    <MotionConfig reducedMotion="user">
      {/* overflow-x-clip: animações que entram pela lateral não alargam a página (e não quebra o sticky) */}
      <div className="font-hyper overflow-x-clip bg-white text-ink-900">
        <Header />
        <main>
          <Hero />
          <DayStatement />
          <HowItWorks />
          <Benefits />
          <Pricing />
          <Faq />
          <CtaBand />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}

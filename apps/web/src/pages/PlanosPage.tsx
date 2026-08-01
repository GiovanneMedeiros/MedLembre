import { Header } from "../components/landing/Header";
import { Hero } from "../components/landing/Hero";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Benefits } from "../components/landing/Benefits";
import { Pricing } from "../components/landing/Pricing";
import { Faq } from "../components/landing/Faq";
import { CtaBand } from "../components/landing/CtaBand";
import { Footer } from "../components/landing/Footer";

// Página com o mesmo conteúdo da home, numa URL própria — pensada para
// ser o destino de links externos (ex: link de afiliado da Cakto), sem
// depender da home nem ficar acoplada a mudanças futuras nela.
export function PlanosPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}

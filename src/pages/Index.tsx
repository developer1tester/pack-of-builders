import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import BenefitsSection from "@/components/BenefitsSection";
import WhoSection from "@/components/WhoSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import WhyJoinSection from "@/components/WhyJoinSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProblemSection />
      <BenefitsSection />
      <WhoSection />
      <TestimonialsSection />
      <WhyJoinSection />
      <CTASection />
    </main>
  );
};

export default Index;

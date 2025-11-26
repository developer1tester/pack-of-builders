import { Check } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";

const BenefitsSection = () => {
  const benefits = [
    "Use modern vibe-coding tools (Cursor, Lovable, Bolt, Replit)",
    "Build real automations (payments, workflows, onboarding, retention)",
    "Launch fast and get your first users",
    "Join weekly live sessions + teardown calls",
    "Fix issues, debug faster, and understand system architecture",
  ];

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 relative">
      {/* Floating Orb */}
      <motion.div
        className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-black mb-12">
            Inside the community, you'll learn how to:
          </h2>
        </AnimatedSection>

        <div className="space-y-6 mb-12">
          {benefits.map((benefit, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <motion.div 
                className="flex items-start gap-4 group p-4 rounded-xl hover:bg-secondary/30 transition-colors"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-primary rounded-full p-1 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Check className="text-primary-foreground" size={24} />
                </div>
                <p className="text-lg md:text-xl font-medium pt-1">{benefit}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.6}>
          <motion.div 
            className="bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-2xl p-8 md:p-12 backdrop-blur-sm border border-border/50"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p className="text-2xl md:text-3xl font-bold mb-4">
              Most people pay thousands for this.
            </p>
            <p className="text-xl md:text-2xl text-primary font-bold">
              You get it free, from builders shipping real products every week.
            </p>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default BenefitsSection;

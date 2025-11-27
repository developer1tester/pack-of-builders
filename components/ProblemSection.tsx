'use client'

import { ArrowRight } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";

const ProblemSection = () => {
  const problems = [
    "How do you onboard users automatically?",
    "How do you set up payments without duct-tape hacks?",
    "How do you trigger emails based on user actions?",
    "How do you find your first 100 customers?",
    "How do you scale without breaking everything?",
  ];

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 bg-secondary/30 relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
            Coding your app is the <span className="text-primary">easy part.</span>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Getting it to work in the real world is the hard part.
          </h3>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <p className="text-xl mb-8 text-foreground/80">
            Everyone can build an MVP today.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <p className="text-2xl font-bold mb-6">
            But nobody teaches you the other 80%:
          </p>
        </AnimatedSection>

        <div className="space-y-4 mb-12">
          {problems.map((problem, index) => (
            <AnimatedSection key={index} delay={0.4 + index * 0.1}>
              <motion.div
                className="flex items-start gap-3 p-4 rounded-lg hover:bg-background/50 transition-colors"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowRight className="text-primary mt-1 flex-shrink-0" size={24} />
                <p className="text-lg md:text-xl font-medium">{problem}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.9}>
          <div className="space-y-4">
            <p className="text-xl font-bold">
              This is the stuff vibe coders get stuck on.
            </p>
            <p className="text-xl font-bold text-primary">
              This is the reason we built the Vibe Coder Community.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ProblemSection;

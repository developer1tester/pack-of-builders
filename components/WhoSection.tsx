'use client'

import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";

const WhoSection = () => {
  const points = [
    "Figuring out vibe-coding and want to learn with others",
    "Building something but don't know how to launch it",
    "Stuck on technical issues but don't want to hire developers",
    "Tired of tutorials and want practical, real-world help",
  ];

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 bg-secondary/20 relative overflow-hidden">
      {/* Abstract Shape */}
      <motion.svg
        className="absolute top-10 right-20 w-48 h-48 text-primary/5"
        viewBox="0 0 200 200"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <path
          fill="currentColor"
          d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.4C25.8,83.8,8.8,86,-7.6,84.8C-24,83.6,-39.4,78.9,-52.8,71.1C-66.2,63.3,-77.6,52.4,-84.8,38.9C-92,25.4,-95,9.3,-93.7,-6.3C-92.4,-21.9,-86.8,-37,-77.4,-49.4C-68,-61.8,-54.8,-71.5,-40.2,-78.5C-25.6,-85.5,-9.6,-89.8,4.7,-97.1C19,-104.4,30.6,-83.6,44.7,-76.4Z"
          transform="translate(100 100)"
        />
      </motion.svg>

      <div className="max-w-5xl mx-auto relative z-10">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            Who this is for
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <p className="text-2xl font-bold mb-8">
            You're welcome if you're…
          </p>
        </AnimatedSection>

        <div className="space-y-6 mb-12">
          {points.map((point, index) => (
            <AnimatedSection key={index} delay={0.2 + index * 0.1}>
              <motion.div
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-background/30 transition-colors"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-primary text-2xl font-bold">•</span>
                <p className="text-lg md:text-xl font-medium pt-0.5">{point}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.6}>
          <motion.div
            className="bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-8 md:p-12 shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p className="text-xl md:text-2xl font-bold text-primary-foreground">
              If you're building — or want to — this community will move you faster.
            </p>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default WhoSection;

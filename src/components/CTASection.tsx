import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-32 px-4 md:px-8 lg:px-16 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-primary/15 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <AnimatedSection>
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            Join the Pack.{" "}
            <span className="text-primary">It's Free (for now).</span>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <p className="text-xl md:text-2xl mb-4 font-medium">
            Free courses. Live sessions. Real builders.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <p className="text-lg md:text-xl text-muted-foreground mb-12">
            Everything you need to move from "vibing" to "launching."
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Button 
              size="lg" 
              className="text-xl px-12 py-8 font-bold group shadow-2xl hover:shadow-primary/25 transition-all"
            >
              Join Free Community
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={28} />
            </Button>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CTASection;

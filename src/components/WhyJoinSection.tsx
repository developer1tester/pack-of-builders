import { Card } from "@/components/ui/card";
import { GraduationCap, Users, Sparkles, Gift } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";

const WhyJoinSection = () => {
  const reasons = [
    {
      icon: GraduationCap,
      title: "Learn how to build real products — and take them to market",
      description: "Not just tutorials. Not just UI. You'll learn automation, onboarding, payments, marketing, architecture — the actual skills required to launch and scale.",
    },
    {
      icon: Users,
      title: "Limited early-member slots (under 100)",
      description: "We're intentionally keeping the early group small so you get real attention, direct help, and a tight-knit community of builders moving fast.",
    },
    {
      icon: Sparkles,
      title: "Join a community of vibe-coding enthusiasts",
      description: "A space where you can ask questions without feeling dumb, get feedback, share progress, and shape the culture of the community from day one.",
    },
    {
      icon: Gift,
      title: "It's free… for now",
      description: "We'll eventually make some parts paid — but early members get everything unlocked at no cost.",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 bg-secondary/20 relative">
      {/* Floating Orb */}
      <motion.div
        className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-primary/8 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
            Why Join Now?
          </h2>
        </AnimatedSection>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -10, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="p-6 md:p-8 hover:shadow-2xl transition-all bg-background border-border/50 backdrop-blur-sm h-full">
                    <motion.div 
                      className="bg-gradient-to-br from-primary to-primary/80 rounded-full w-16 h-16 flex items-center justify-center mb-6 shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="text-primary-foreground" size={32} />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-4">{reason.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {reason.description}
                    </p>
                  </Card>
                </motion.div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyJoinSection;

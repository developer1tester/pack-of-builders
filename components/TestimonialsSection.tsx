'use client'

import { Card } from "@/components/ui/card";
import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "I built a working backend for my Lovable app in under an hour — without leaving the ecosystem.",
      author: "Piyush K.",
      role: "Indie Maker",
    },
    {
      quote: "Setting up automations with Claude + Meerkats AI feels magical.",
      author: "Rama Vergaroo",
      role: "AI SaaS Founder",
    },
    {
      quote: "I finally built the system to run my agency. Meerkats AI is the missing piece for anyone building with AI.",
      author: "Aditya",
      role: "Performance Marketer",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 relative overflow-hidden">
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
            What the tribe says
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={index} delay={index * 0.15}>
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-8 hover:shadow-2xl transition-all bg-secondary/30 border-border/50 backdrop-blur-sm h-full">
                  <p className="text-lg mb-6 leading-relaxed font-medium">
                    "{testimonial.quote}"
                  </p>
                  <div className="border-t border-border pt-4">
                    <p className="font-bold text-primary">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

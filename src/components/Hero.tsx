import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/meerkats-logo.png";
import AbstractBackground from "./AbstractBackground";

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col relative overflow-hidden">
      <AbstractBackground />
      
      {/* Navigation */}
      <motion.nav 
        className="w-full py-6 px-4 md:px-8 lg:px-16 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <img src={logo} alt="Meerkats.ai" className="h-12 md:h-16" />
        </div>
      </motion.nav>

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-8 lg:px-16 py-12 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight whitespace-nowrap"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Ship real products — <span className="text-primary">not just UI.</span>
          </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed px-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            From the founders of Meerkats.ai — a free community for vibe coders to learn how to build apps, discuss best practices, and take your product to market.
          </motion.p>

          <motion.div 
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 font-bold group hover:scale-105 transition-all shadow-lg hover:shadow-xl"
              asChild
            >
              <a href="https://www.skool.com/meerkats-ai-3387" target="_blank" rel="noopener noreferrer">
                Join the Pack
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <p className="text-sm text-muted-foreground">
              No credit card. No trials. 100% free.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute top-40 left-20 w-2 h-2 bg-primary rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-40 right-32 w-3 h-3 bg-primary rounded-full"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </section>
  );
};

export default Hero;

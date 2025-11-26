import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/meerkats-logo.png";

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full py-6 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <img src={logo} alt="Meerkats.ai" className="h-12 md:h-16" />
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-8 lg:px-16 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            Ship real products —{" "}
            <span className="text-primary">not just UI.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            From the founders of Meerkats.ai — a free community for vibe coders to learn how to build apps, discuss best practices, and take your product to market.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 font-bold group hover:scale-105 transition-transform"
            >
              Join the Pack
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground">
              No credit card. No trials. 100% free.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

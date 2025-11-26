import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-32 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-black mb-6">
          Join the Pack.{" "}
          <span className="text-primary">It's Free (for now).</span>
        </h2>

        <p className="text-xl md:text-2xl mb-4 font-medium">
          Free courses. Live sessions. Real builders.
        </p>

        <p className="text-lg md:text-xl text-muted-foreground mb-12">
          Everything you need to move from "vibing" to "launching."
        </p>

        <Button 
          size="lg" 
          className="text-xl px-12 py-8 font-bold group hover:scale-105 transition-transform"
        >
          Join Free Community
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={28} />
        </Button>
      </div>
    </section>
  );
};

export default CTASection;

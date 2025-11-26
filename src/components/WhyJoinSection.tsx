import { Card } from "@/components/ui/card";
import { GraduationCap, Users, Sparkles, Gift } from "lucide-react";

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
    <section className="py-20 px-4 md:px-8 lg:px-16 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
          Why Join Now?
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <Card 
                key={index} 
                className="p-8 hover:shadow-xl transition-all hover:scale-105 bg-background border-0"
              >
                <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Icon className="text-primary-foreground" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">{reason.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {reason.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyJoinSection;

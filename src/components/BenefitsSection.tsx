import { Check } from "lucide-react";

const BenefitsSection = () => {
  const benefits = [
    "Use modern vibe-coding tools (Cursor, Lovable, Bolt, Replit)",
    "Build real automations (payments, workflows, onboarding, retention)",
    "Launch fast and get your first users",
    "Join weekly live sessions + teardown calls",
    "Fix issues, debug faster, and understand system architecture",
  ];

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black mb-12">
          Inside the community, you'll learn how to:
        </h2>

        <div className="space-y-6 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-4 group">
              <div className="bg-primary rounded-full p-1 flex-shrink-0 group-hover:scale-110 transition-transform">
                <Check className="text-primary-foreground" size={24} />
              </div>
              <p className="text-lg md:text-xl font-medium pt-1">{benefit}</p>
            </div>
          ))}
        </div>

        <div className="bg-secondary rounded-2xl p-8 md:p-12">
          <p className="text-2xl md:text-3xl font-bold mb-4">
            Most people pay thousands for this.
          </p>
          <p className="text-xl md:text-2xl text-primary font-bold">
            You get it free, from builders shipping real products every week.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;

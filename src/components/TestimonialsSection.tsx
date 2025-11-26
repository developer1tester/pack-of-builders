import { Card } from "@/components/ui/card";

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
    <section className="py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
          What the tribe says
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="p-8 hover:shadow-xl transition-shadow bg-secondary border-0"
            >
              <p className="text-lg mb-6 leading-relaxed font-medium">
                "{testimonial.quote}"
              </p>
              <div className="border-t border-border pt-4">
                <p className="font-bold text-primary">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

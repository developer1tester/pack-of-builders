import { ArrowRight } from "lucide-react";

const ProblemSection = () => {
  const problems = [
    "How do you onboard users automatically?",
    "How do you set up payments without duct-tape hacks?",
    "How do you trigger emails based on user actions?",
    "How do you find your first 100 customers?",
    "How do you scale without breaking everything?",
  ];

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 bg-secondary">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
          Coding your app is the <span className="text-primary">easy part.</span>
        </h2>
        
        <h3 className="text-3xl md:text-4xl font-bold mb-6">
          Getting it to work in the real world is the hard part.
        </h3>

        <p className="text-xl mb-8 text-foreground/80">
          Everyone can build an MVP today.
        </p>

        <p className="text-2xl font-bold mb-6">
          But nobody teaches you the other 80%:
        </p>

        <div className="space-y-4 mb-12">
          {problems.map((problem, index) => (
            <div key={index} className="flex items-start gap-3">
              <ArrowRight className="text-primary mt-1 flex-shrink-0" size={24} />
              <p className="text-lg md:text-xl font-medium">{problem}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <p className="text-xl font-bold">
            This is the stuff vibe coders get stuck on.
          </p>
          <p className="text-xl font-bold text-primary">
            This is the reason we built the Vibe Coder Community.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;

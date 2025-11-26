const WhoSection = () => {
  const points = [
    "Figuring out vibe-coding and want to learn with others",
    "Building something but don't know how to launch it",
    "Stuck on technical issues but don't want to hire developers",
    "Tired of tutorials and want practical, real-world help",
  ];

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 bg-secondary">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black mb-8">
          Who this is for
        </h2>

        <p className="text-2xl font-bold mb-8">
          You're welcome if you're…
        </p>

        <div className="space-y-6 mb-12">
          {points.map((point, index) => (
            <div key={index} className="flex items-start gap-4">
              <span className="text-primary text-2xl font-bold">•</span>
              <p className="text-lg md:text-xl font-medium pt-0.5">{point}</p>
            </div>
          ))}
        </div>

        <div className="bg-primary rounded-2xl p-8 md:p-12">
          <p className="text-xl md:text-2xl font-bold text-primary-foreground">
            If you're building — or want to — this community will move you faster.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhoSection;

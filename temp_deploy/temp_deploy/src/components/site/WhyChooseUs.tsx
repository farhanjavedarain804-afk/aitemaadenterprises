import { ShieldCheck, Users, Award, Handshake, Zap, Briefcase } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Trusted Company", desc: "A reputation built on integrity and consistent delivery." },
  { icon: Users, title: "Professional Team", desc: "Skilled specialists across procurement, logistics and construction." },
  { icon: Award, title: "Quality Commitment", desc: "Every project audited against rigorous quality benchmarks." },
  { icon: Handshake, title: "Reliable Service", desc: "On-time, on-spec, on-budget — every single engagement." },
  { icon: Zap, title: "Fast Communication", desc: "Clear, prompt responses across WhatsApp, email and phone." },
  { icon: Briefcase, title: "Industry Experience", desc: "Cross-sector expertise that solves complex business needs." },
];

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            Why Choose Us
          </div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Built on trust. Driven by results.
          </h2>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-4 p-6 rounded-2xl border border-border bg-card hover:border-accent/60 transition-colors"
            >
              <div className="shrink-0 h-12 w-12 rounded-xl bg-accent-gradient grid place-items-center text-accent-foreground">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

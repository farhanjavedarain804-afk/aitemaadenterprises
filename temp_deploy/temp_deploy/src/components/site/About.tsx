import { UserCircle2 } from "lucide-react";

export function About() {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              About the Company
            </div>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-foreground text-balance">
              A trusted partner for{" "}
              <span className="text-primary">multi-industry solutions</span>.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Aitemaad Enterprises is a trusted multi-services company delivering professional
              procurement, sourcing, construction, logistics, trading, contracting, import/export,
              and consultancy solutions across multiple industries.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-6 max-w-md">
              {[
                { n: "8+", l: "Service Lines" },
                { n: "100%", l: "Commitment" },
                { n: "24/7", l: "Support" },
              ].map((stat) => (
                <div key={stat.l}>
                  <div className="text-3xl font-bold text-primary">{stat.n}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                    {stat.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-accent-gradient rounded-3xl opacity-20 blur-2xl" />
            <div className="relative bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-elegant">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-hero-gradient grid place-items-center text-white shadow-glow">
                  <UserCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-widest uppercase text-accent">
                    Founder
                  </div>
                  <div className="text-xl font-bold text-foreground">Ch Farhan Javed Arain</div>
                  <div className="text-sm text-muted-foreground">Chief Executive &amp; Founder</div>
                </div>
              </div>
              <blockquote className="mt-6 text-base text-foreground/80 leading-relaxed italic border-l-4 border-accent pl-4">
                "We believe in building long-term relationships through transparency, quality, and
                a relentless commitment to delivering on every promise we make."
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

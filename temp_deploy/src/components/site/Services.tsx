import {
  Package, Search, Building2, Globe2, HardHat, TrendingUp, Truck, Lightbulb,
} from "lucide-react";

const services = [
  { icon: Package, title: "General Order Supplies", desc: "End-to-end supply of products across industrial and commercial requirements." },
  { icon: Search, title: "Procurement & Sourcing", desc: "Smart sourcing strategies that deliver quality, timing, and cost efficiency." },
  { icon: Building2, title: "Construction", desc: "Civil construction services delivered with safety, quality and precision." },
  { icon: Globe2, title: "Import & Export", desc: "Reliable cross-border trade with full compliance and documentation support." },
  { icon: HardHat, title: "Contracting & Project Execution", desc: "Turnkey project execution backed by experienced contracting teams." },
  { icon: TrendingUp, title: "Trading", desc: "Wholesale trading and distribution across multiple commodity verticals." },
  { icon: Truck, title: "Logistics & Supply Chain", desc: "Optimized logistics, warehousing and supply chain management." },
  { icon: Lightbulb, title: "Consultancy", desc: "Strategic consultancy to help your business operate smarter and scale faster." },
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-secondary/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            What We Offer
          </div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Comprehensive services, one trusted partner.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Eight specialized service verticals built around the same standard of excellence.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute inset-x-0 -top-px h-px bg-accent-gradient opacity-0 group-hover:opacity-100 transition" />
              <div className="h-12 w-12 rounded-xl bg-hero-gradient grid place-items-center text-white group-hover:scale-110 transition-transform">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

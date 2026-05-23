import { Phone, Mail, Globe, MapPin } from "lucide-react";

const items = [
  { icon: Phone, label: "Phone", value: "+92-330-0602357", href: "tel:+923300602357" },
  { icon: Mail, label: "Email", value: "info@aitemaadenterprises.com", href: "mailto:info@aitemaadenterprises.com" },
  { icon: Globe, label: "Website", value: "aitemaadenterprises.com", href: "https://aitemaadenterprises.com" },
  { icon: MapPin, label: "Address", value: "Near Farhan Motors & Rent A Car, Multan Road Chowk Azam" },
];

export function Contact() {
  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            Contact Information
          </div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Let's start a conversation.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Reach us through any channel — we're always available to discuss your requirements.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(({ icon: Icon, label, value, href }) => {
            const inner = (
              <div className="h-full p-6 rounded-2xl border border-border bg-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-hero-gradient grid place-items-center text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-5 text-xs font-semibold uppercase tracking-widest text-accent">
                  {label}
                </div>
                <div className="mt-1 font-semibold text-foreground break-words">{value}</div>
              </div>
            );
            return href ? (
              <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                {inner}
              </a>
            ) : (
              <div key={label}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

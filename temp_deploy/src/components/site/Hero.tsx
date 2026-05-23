import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle, Send, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { getSettings, type SiteSettings } from "@/lib/settings";

const WHATSAPP = "https://wa.me/923300602357?text=" + encodeURIComponent("Hello Aitemaad Enterprises, I want to inquire about your services.");

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s, finished: diff === 0 };
}

function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(getSettings);
  useEffect(() => {
    const handler = () => setSettings(getSettings());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  return settings;
}

export function Hero() {
  const siteSettings = useSiteSettings();
  const target = new Date(siteSettings.countdownDate);
  const { d, h, m, s } = useCountdown(target);
  const units = [
    { v: d, l: "Days" },
    { v: h, l: "Hours" },
    { v: m, l: "Minutes" },
    { v: s, l: "Seconds" },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <img src={heroBg} alt="" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-overlay-gradient" />

      {/* Animated shapes */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-float-slow" />
      <div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/40 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />

      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="max-w-4xl animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-medium text-white">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Official Website Launching Soon
          </div>

          <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold text-white text-balance leading-[1.05]">
            Our Success Is{" "}
            <span className="bg-accent-gradient bg-clip-text text-transparent">Our Commitment</span>
          </h1>

          <p className="mt-5 text-xl sm:text-2xl text-white/90 font-medium">Professional Multi Services Provider</p>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/75 leading-relaxed">
            General Order Supplies, Procurement &amp; Sourcing, Construction, Import &amp; Export,
            Trading, Logistics &amp; Consultancy Solutions.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#contact" className="inline-flex items-center gap-2 bg-accent-gradient text-accent-foreground px-7 py-3.5 rounded-full font-semibold shadow-glow hover:scale-[1.03] transition-transform">
              Contact Us <ArrowRight className="h-4 w-4" />
            </a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[var(--whatsapp)] text-[var(--whatsapp-foreground)] px-7 py-3.5 rounded-full font-semibold hover:opacity-90 transition">
              <MessageCircle className="h-4 w-4" /> WhatsApp Now
            </a>
            <a href="#inquiry" className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur text-white px-7 py-3.5 rounded-full font-semibold hover:bg-white/20 transition">
              <Send className="h-4 w-4" /> Send Inquiry
            </a>
          </div>

          {/* Countdown — controlled from admin settings */}
          {siteSettings.countdownEnabled && (
            <div className="mt-10">
              <p className="text-sm font-medium text-white/60 uppercase tracking-widest mb-4">
                {siteSettings.countdownLabel}
              </p>
              <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-xl">
                {units.map((u) => (
                  <div key={u.l} className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-2 py-4 sm:py-5 text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
                      {String(u.v).padStart(2, "0")}
                    </div>
                    <div className="mt-1 text-[10px] sm:text-xs tracking-widest uppercase text-white/70">{u.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

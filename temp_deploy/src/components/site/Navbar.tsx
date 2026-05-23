import { useEffect, useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#contact", label: "Contact" },
];

const WHATSAPP = "https://wa.me/923300602357?text=" + encodeURIComponent("Hello Aitemaad Enterprises, I want to inquire about your services.");

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white border-b border-border shadow-sm"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          <a href="#home" className="flex items-center gap-3 group">
            <img src={logo} alt="Aitemaad Enterprises logo" width={48} height={48} className="h-11 w-11 object-contain" />
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium transition-colors hover:text-accent text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-accent-gradient text-accent-foreground px-5 py-2.5 rounded-full text-sm font-semibold shadow-glow hover:scale-105 transition-transform"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Now
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden p-2 rounded-md text-foreground"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-4 animate-fade-up">
            <nav className="flex flex-col gap-1 bg-card rounded-2xl p-3 shadow-elegant border border-border">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-lg text-foreground hover:bg-secondary text-sm font-medium"
                >
                  {l.label}
                </a>
              ))}
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 bg-accent-gradient text-accent-foreground px-5 py-3 rounded-lg text-sm font-semibold"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Now
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

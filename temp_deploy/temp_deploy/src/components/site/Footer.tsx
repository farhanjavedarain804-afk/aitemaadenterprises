import { Facebook, Instagram, Linkedin, Twitter, Phone, Mail } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 bg-white rounded-xl p-1.5">
                <img src={logo} alt="Aitemaad Enterprises" width={56} height={56} loading="lazy" className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="font-display font-bold text-lg">Aitemaad Enterprises</div>
                <div className="text-xs tracking-[0.2em] uppercase text-accent">Multi Services Provider</div>
              </div>
            </div>
            <p className="mt-5 text-sm text-primary-foreground/70 leading-relaxed">
              Trusted procurement, construction, logistics and consultancy solutions —
              delivered with integrity and excellence.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-accent">Quick Contact</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent" />
                <a href="tel:+923300602357" className="hover:text-accent transition">+92-330-0602357</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-accent" />
                <a href="mailto:info@aitemaadenterprises.com" className="hover:text-accent transition">
                  info@aitemaadenterprises.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-accent">Follow Us</h4>
            <div className="mt-5 flex gap-3">
              {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-accent grid place-items-center transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-center text-xs text-primary-foreground/60 flex flex-col gap-2">
          <div>© 2026 Aitemaad Enterprises — All Rights Reserved.</div>
          <div>Developed by Devionic (Private) Limited | devionic.com | +92-317-7121841 | info@devionic.com</div>
        </div>
      </div>
    </footer>
  );
}

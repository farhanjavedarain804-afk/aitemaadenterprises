import { MessageCircle } from "lucide-react";

const HREF = "https://wa.me/923300602357?text=" + encodeURIComponent("Hello Aitemaad Enterprises, I want to inquire about your services.");

export function WhatsappFloat() {
  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[var(--whatsapp)] text-[var(--whatsapp-foreground)] grid place-items-center shadow-elegant animate-pulse-glow hover:scale-110 transition-transform"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

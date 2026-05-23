import { useState } from "react";
import { z } from "zod";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";


const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(25)
    .regex(/^[+\d\s()-]+$/, "Phone can only contain digits and + ( ) -"),
  email: z.string().trim().email("Enter a valid email").max(160),
  service: z.string().min(1, "Please select a service"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

const SERVICES = [
  "General Order Supplies",
  "Procurement & Sourcing",
  "Construction",
  "Import & Export",
  "Contracting & Project Execution",
  "Trading",
  "Logistics & Supply Chain",
  "Consultancy",
  "Other",
];

const WA_NUMBER = "923300602357";

function formatInquiryId(index: number, createdAt: string) {
  const year = new Date(createdAt).getFullYear();
  const num = String(index).padStart(3, "0");
  return `INQ-${num}-AE/${year}`;
}

export function InquiryForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Honeypot
    if (fd.get("website")) return;

    const data = {
      fullName: String(fd.get("fullName") || ""),
      companyName: String(fd.get("companyName") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
      service: String(fd.get("service") || ""),
      message: String(fd.get("message") || ""),
    };

    const result = schema.safeParse(data);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setErrors({});
    setLoading(true);

    const { count } = await supabase.from("inquiries").select("*", { count: "exact", head: true });
    const nextIndex = (count || 0) + 1;
    const now = new Date().toISOString();
    const formattedId = formatInquiryId(nextIndex, now);

    const { error } = await supabase.from("inquiries").insert({
      full_name: data.fullName,
      company_name: data.companyName || null,
      phone: data.phone,
      email: data.email,
      service: data.service,
      message: data.message,
    });

    if (error) {
      setLoading(false);
      toast.error("Failed to submit inquiry. Please try again or contact us on WhatsApp.");
      return;
    }

    setLoading(false);
    setSubmittedId(formattedId);
    toast.success("Inquiry submitted successfully! We'll get back to you soon.");
    (e.target as HTMLFormElement).reset();
  };


  const field = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition";
  const errCls = "mt-1 text-xs text-destructive";

  return (
    <section id="inquiry" className="py-24 bg-hero-gradient relative overflow-hidden">
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            Get In Touch
          </div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-white text-balance">
            Send Us an Inquiry
          </h2>
          <p className="mt-4 text-white/80">
            Tell us about your requirement — our team responds within one business day.
          </p>
        </div>

        <div className="mt-12 bg-card rounded-3xl p-6 sm:p-10 shadow-elegant border border-border">
          {submittedId ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 mx-auto text-accent" />
              <h3 className="mt-4 text-2xl font-bold text-foreground">Thank you!</h3>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                Your inquiry has been received. Our team will contact you shortly.
              </p>
              <div className="mt-8 bg-muted/50 rounded-2xl p-6 inline-block border border-border">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-2">Your Inquiry ID</span>
                <span className="font-mono text-2xl font-bold text-foreground bg-background px-4 py-2 rounded-xl shadow-sm inline-block border border-border/50">{submittedId}</span>
              </div>
              <div className="mt-10">
                <button
                  onClick={() => setSubmittedId(null)}
                  className="inline-flex items-center gap-2 text-accent font-semibold hover:underline"
                >
                  Send another inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-5" noValidate>
              {/* Honeypot */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off"
                className="hidden" aria-hidden="true" />

              <div>
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input name="fullName" className={`mt-1.5 ${field}`} placeholder="John Doe" />
                {errors.fullName && <p className={errCls}>{errors.fullName}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Company Name</label>
                <input name="companyName" className={`mt-1.5 ${field}`} placeholder="Your Company" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone Number *</label>
                <input name="phone" className={`mt-1.5 ${field}`} placeholder="+92 300 1234567" />
                {errors.phone && <p className={errCls}>{errors.phone}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email Address *</label>
                <input name="email" type="email" className={`mt-1.5 ${field}`} placeholder="you@email.com" />
                {errors.email && <p className={errCls}>{errors.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Service Required *</label>
                <select name="service" defaultValue="" className={`mt-1.5 ${field}`}>
                  <option value="" disabled>Select a service…</option>
                  {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.service && <p className={errCls}>{errors.service}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Message *</label>
                <textarea name="message" rows={5} className={`mt-1.5 ${field}`} placeholder="Describe your requirement…" />
                {errors.message && <p className={errCls}>{errors.message}</p>}
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-accent-gradient text-accent-foreground px-8 py-3.5 rounded-full font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Sending…" : "Submit Inquiry"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

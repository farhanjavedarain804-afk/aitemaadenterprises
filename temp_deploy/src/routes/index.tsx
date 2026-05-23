import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Services } from "@/components/site/Services";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { InquiryForm } from "@/components/site/InquiryForm";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { WhatsappFloat } from "@/components/site/WhatsappFloat";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aitemaad Enterprises | Website Launching Soon" },
      {
        name: "description",
        content:
          "Aitemaad Enterprises provides procurement, construction, logistics, import/export, trading, and consultancy services. Official website launching soon.",
      },
      {
        name: "keywords",
        content:
          "Aitemaad Enterprises, procurement, sourcing, construction, import export, trading, logistics, consultancy, Pakistan",
      },
      { property: "og:title", content: "Aitemaad Enterprises | Website Launching Soon" },
      {
        property: "og:description",
        content:
          "Professional multi-services provider — procurement, construction, logistics, trading & consultancy.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Aitemaad Enterprises",
          url: "https://aitemaadenterprises.com",
          email: "info@aitemaadenterprises.com",
          telephone: "+92-330-0602357",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Near Farhan Motors & Rent A Car, Multan Road",
            addressLocality: "Chowk Azam",
            addressCountry: "PK",
          },
          founder: { "@type": "Person", name: "Ch Farhan Javed Arain" },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <WhyChooseUs />
      <InquiryForm />
      <Contact />
      <Footer />
      <WhatsappFloat />
      <Toaster position="top-center" richColors />
    </main>
  );
}

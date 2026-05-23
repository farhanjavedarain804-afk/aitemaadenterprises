import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Services } from "@/components/site/Services";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { InquiryForm } from "@/components/site/InquiryForm";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { WhatsappFloat } from "@/components/site/WhatsappFloat";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function HomePage() {
  usePageMeta({
    title: "Aitemaad Enterprises | Website Launching Soon",
    description:
      "Aitemaad Enterprises provides procurement, construction, logistics, import/export, trading, and consultancy services. Official website launching soon.",
    jsonLd: {
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
    },
  });

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
    </main>
  );
}

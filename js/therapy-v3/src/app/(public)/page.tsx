import { HeroSection } from "@/components/public/hero-section";
import { ServicesSection } from "@/components/public/services-section";
import { TeamSection } from "@/components/public/team-section";
import { TestimonialsSection } from "@/components/public/testimonials-section";
import { FaqSection } from "@/components/public/faq-section";
import { ContactSection } from "@/components/public/contact-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <TeamSection />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}

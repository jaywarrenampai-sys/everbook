import AnnouncementBar from "@/components/marketing/AnnouncementBar";
import SiteHeader from "@/components/marketing/SiteHeader";
import Hero from "@/components/marketing/Hero";
import TrustMarquee from "@/components/marketing/TrustMarquee";
import Advantages from "@/components/marketing/Advantages";
import HowItWorks from "@/components/marketing/HowItWorks";
import QualitySpotlight from "@/components/marketing/QualitySpotlight";
import ProductShowcase from "@/components/marketing/ProductShowcase";
import Testimonials from "@/components/marketing/Testimonials";
import FaqSection from "@/components/marketing/FaqSection";
import GuaranteeStrip from "@/components/marketing/GuaranteeStrip";
import SiteFooter from "@/components/marketing/SiteFooter";

export default function Home() {
  return (
    <div className="font-body">
      <AnnouncementBar />
      <SiteHeader />
      <main>
        <Hero />
        <TrustMarquee />
        <Advantages />
        <HowItWorks />
        <QualitySpotlight />
        <ProductShowcase />
        <Testimonials />
        <FaqSection />
        <GuaranteeStrip />
      </main>
      <SiteFooter />
    </div>
  );
}

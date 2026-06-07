import { AnnouncementBar } from "@/components/announcement-bar";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Features } from "@/components/features";
import { Steps } from "@/components/steps";
import { Quality } from "@/components/quality";
import { Pricing } from "@/components/pricing";
import { Testimonials } from "@/components/testimonials";
import { Faq } from "@/components/faq";
import { TrustBadges } from "@/components/trust-badges";
import { SiteFooter } from "@/components/site-footer";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <SiteHeader />
      <main>
        <Hero />
        <Marquee />
        <Features />
        <Steps />
        <Quality />
        <Pricing />
        <Testimonials />
        <Faq />
        <TrustBadges />
      </main>
      <SiteFooter />
    </div>
  );
}

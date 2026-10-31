import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Footer, Levels, Pipeline, Problem, Surfaces } from "@/components/landing/sections";
import { GlobeSection } from "@/components/landing/globe";
import { KitSection } from "@/components/landing/kit3d";
import { ScrollIsland } from "@/components/landing/island";
import { BlogTeaser, Faq, FinalCta, Numbers, PricingTeaser, UseCases } from "@/components/landing/more";
import { FeatureLab, PartnerStrip } from "@/components/landing/feature-lab";
import { Journey } from "@/components/landing/journey";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="overflow-x-clip">
        <Hero />
        <Numbers />
        <GlobeSection />
        <PartnerStrip />
        <Problem />
        <Journey />
        <FeatureLab />
        <UseCases />
        <Levels />
        <KitSection />
        <Pipeline />
        <Surfaces />
        <PricingTeaser />
        <BlogTeaser />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <ScrollIsland />
    </>
  );
}

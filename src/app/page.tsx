// app/page.tsx
import { HeroSection } from "@/components/home/hero-section"
import { StatsSection } from "@/components/home/stats-section"
import { HowItWorksSection } from "@/components/home/how-it-works"
import { FeaturedReports } from "@/components/home/featured-reports"
import { UpcomingDrives } from "@/components/home/upcoming-drives"
import { EnergyAwareCTA } from "@/components/home/energy-cta"
import { ImpactSection } from "@/components/home/impact-section"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <main className="w-full">
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturedReports />
      <UpcomingDrives />
      <EnergyAwareCTA />
      <ImpactSection />
      <Footer />
    </main>
  )
}

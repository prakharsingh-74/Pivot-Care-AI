import { Navbar } from "@/modules/landing/ui/components/navbar"
import { Hero } from "@/modules/landing/ui/components/hero"
import { VideoGallery } from "@/modules/landing/ui/components/video-gallery"
import { HowItWorks } from "@/modules/landing/ui/components/how-it-works"
import { UseCases } from "@/modules/landing/ui/components/use-cases"
import { Stats } from "@/modules/landing/ui/components/stats"
import { Testimonials } from "@/modules/landing/ui/components/testimonials"
import { Pricing } from "@/modules/landing/ui/components/pricing"
import { FAQ } from "@/modules/landing/ui/components/faq"
import { FinalCTA } from "@/modules/landing/ui/components/final-cta"
import { Footer } from "@/modules/landing/ui/components/footer"

export default function Home() {
  return (
    <main className="relative z-0 min-h-screen bg-background overflow-x-hidden">
      <div
        className="absolute top-0 right-0 w-[1500px] h-[1500px] -z-10 bg-primary pointer-events-none"
        style={{
          maskImage: "radial-gradient(ellipse 50% 50% at 100% 0%, rgb(0 0 0 / 0.75), transparent)",
        }}
      >
        <div className="absolute inset-0 bg-cover bg-right-top" style={{ backgroundImage: "url('/grade.png')" }} />
      </div>

      <Navbar />

      <Hero />
      <VideoGallery />
      <HowItWorks />
      <UseCases />
      <Stats />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}

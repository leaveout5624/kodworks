import { Navigation } from '@/components/Navigation'
import { CustomCursor } from '@/components/CustomCursor'
import { HeroSection } from '@/sections/HeroSection'
import { AlgorithmsSection } from '@/sections/AlgorithmsSection'
import { MetricsSection } from '@/sections/MetricsSection'
import { TestimonialsSection } from '@/sections/TestimonialsSection'
import { FooterSection } from '@/sections/FooterSection'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0e0e10] text-white overflow-x-hidden cursor-none">
      <CustomCursor />
      <Navigation />
      <HeroSection />
      <AlgorithmsSection />
      <MetricsSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  )
}

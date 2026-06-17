import { useRef, useEffect, useState } from 'react'
import { Shield, Zap, Globe, Lock } from 'lucide-react'

function CinematicDataItem({
  number,
  text,
  align = 'left',
  scrollProgress,
}: {
  number: string
  text: string
  align?: 'left' | 'right'
  scrollProgress: number
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wrapperRef.current) return
    const offset = align === 'left' ? scrollProgress * 100 : scrollProgress * -100
    wrapperRef.current.style.transform = `translateX(${offset}%)`
  }, [scrollProgress, align])

  return (
    <div className="relative w-full overflow-hidden py-12">
      <div
        ref={wrapperRef}
        className="flex items-center whitespace-nowrap"
      >
        {align === 'left' ? (
          <>
            <span
              className="text-6xl font-bold uppercase tracking-widest mr-8"
              style={{ color: '#0e0e10', textShadow: '0px 0px 0px #cd7f32' }}
            >
              {text}
            </span>
            <span
              className="text-[12vw] font-black tracking-tighter leading-none"
              style={{ WebkitTextStroke: '2px #ffffff', color: 'transparent' }}
            >
              {number}
            </span>
          </>
        ) : (
          <>
            <span
              className="text-[12vw] font-black tracking-tighter leading-none"
              style={{ WebkitTextStroke: '2px #ffffff', color: 'transparent' }}
            >
              {number}
            </span>
            <span
              className="text-6xl font-bold uppercase tracking-widest ml-8"
              style={{ color: '#0e0e10', textShadow: '0px 0px 0px #cd7f32' }}
            >
              {text}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

const metrics = [
  { number: '150%', text: 'Backtested ROI', align: 'left' as const },
  { number: '0.4s', text: 'Execution Latency', align: 'right' as const },
  { number: '99.9%', text: 'Uptime SLA', align: 'left' as const },
  { number: '24/7', text: 'Automated Operation', align: 'right' as const },
  { number: '50+', text: 'Active Strategies', align: 'left' as const },
]

const features = [
  {
    icon: <Shield className="w-6 h-6 text-[#cd7f32]" />,
    title: 'Bank-Grade Security',
    description: 'AES-256 encryption, multi-sig wallets, and cold storage for all user funds.',
  },
  {
    icon: <Zap className="w-6 h-6 text-[#cd7f32]" />,
    title: 'Sub-Second Execution',
    description: 'Direct exchange integrations with co-located infrastructure for minimal latency.',
  },
  {
    icon: <Globe className="w-6 h-6 text-[#cd7f32]" />,
    title: 'Global Infrastructure',
    description: 'Servers across 12 regions ensuring optimal connectivity to all major exchanges.',
  },
  {
    icon: <Lock className="w-6 h-6 text-[#cd7f32]" />,
    title: 'Non-Custodial Option',
    description: 'Connect your own exchange API keys. We never hold your funds directly.',
  },
]

export function MetricsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const sectionHeight = rect.height
      const scrolled = (windowHeight - rect.top) / (windowHeight + sectionHeight)
      setScrollProgress(Math.max(0, Math.min(1, scrolled)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      id="metrics"
      ref={sectionRef}
      className="relative bg-[#0e0e10] py-24 overflow-hidden"
    >
      {/* Metrics Header */}
      <div className="text-center mb-16 px-6">
        <span className="text-xs tracking-[0.3em] text-[#cd7f32] mb-4 block">
          PERFORMANCE METRICS
        </span>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Numbers That{' '}
          <span className="text-gradient-bronze">Speak</span>
        </h2>
        <p className="text-[#b0b0b0] max-w-2xl mx-auto">
          Proven results from extensive backtesting and live deployment across
          multiple market conditions and asset classes.
        </p>
      </div>

      {/* Cinematic Data Reveal */}
      <div className="max-w-7xl mx-auto px-4 mb-24">
        {metrics.map((metric) => (
          <CinematicDataItem
            key={metric.text}
            number={metric.number}
            text={metric.text}
            align={metric.align}
            scrollProgress={scrollProgress}
          />
        ))}
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 bg-[#0a0a0a] border border-white/5 hover:border-[#cd7f32]/20 transition-all duration-300"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-[#cd7f32]/10 border border-[#cd7f32]/20 mb-4 group-hover:shadow-bronze transition-shadow duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-[#b0b0b0] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Quote, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Marcus Chen',
    role: 'Quantitative Analyst, Delta Fund',
    quote:
      'KODWorks transformed our trading operations. The grid bot consistently outperforms our manual strategies by 40% while requiring zero intervention. The backtesting engine is remarkably accurate.',
    rating: 5,
  },
  {
    name: 'Sarah Williams',
    role: 'Independent Crypto Trader',
    quote:
      'I have been running the Martingale strategy on ETH for 6 months. The drawdown recovery is phenomenal, and the risk controls give me peace of mind even during volatile market conditions.',
    rating: 5,
  },
  {
    name: 'Alex Petrov',
    role: 'CTO, Blockchain Ventures',
    quote:
      'The AI signal aggregation is next-level. It caught the Bitcoin rally three days before it happened by analyzing order book imbalances across multiple exchanges simultaneously.',
    rating: 5,
  },
  {
    name: 'Dr. Emily Nakamura',
    role: 'Financial Engineering Lead, Tokyo Exchange',
    quote:
      'As someone who builds trading systems professionally, I am impressed by the execution quality. Sub-second latency with 99.9% uptime. This is institutional-grade infrastructure made accessible.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="relative bg-[#0e0e10] py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.3em] text-[#cd7f32] mb-4 block">
            TESTIMONIALS
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Trusted by{' '}
            <span className="text-gradient-bronze">Professionals</span>
          </h2>
          <p className="text-[#b0b0b0] max-w-2xl mx-auto">
            From independent traders to institutional funds, our platform powers
            quantitative strategies across the globe.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="group relative bg-glass p-8 hover:border-[#cd7f32]/20 transition-all duration-500"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-12 h-12 text-[#cd7f32]" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#cd7f32] fill-[#cd7f32]"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-white leading-relaxed mb-6 relative z-10">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#cd7f32]/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#cd7f32]">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-[#b0b0b0]">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#cd7f32]/10 via-transparent to-[#cd7f32]/10" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-12 border border-[#cd7f32]/20">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Ready to Automate Your Trading?
              </h3>
              <p className="text-[#b0b0b0]">
                Start with $10,000 demo credit. No credit card required.
              </p>
            </div>
            <a
              href="/login"
              className="px-8 py-3 text-sm font-semibold text-black bg-[#cd7f32] hover:bg-[#e8c07e] transition-all duration-300 animate-pulse-bronze shrink-0"
              style={{ borderRadius: '50px' }}
            >
              START FREE TRIAL
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

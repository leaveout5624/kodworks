import { Zap, Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { Link } from 'react-router'

export function FooterSection() {
  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/5">
      {/* Large Logo */}
      <div className="py-16 overflow-hidden">
        <div className="text-center">
          <h2
            className="text-[15vw] font-black leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #cd7f32 0%, #8c5220 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              opacity: 0.3,
            }}
          >
            KOD WORKS
          </h2>
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 pb-12">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[#cd7f32]" />
              <span className="text-lg font-bold text-white">
                KOD<span className="text-[#cd7f32]">Works</span>
              </span>
            </Link>
            <p className="text-sm text-[#b0b0b0] leading-relaxed mb-4">
              Institutional-grade quantitative trading infrastructure for the modern trader.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-[#cd7f32]/20 border border-white/10 hover:border-[#cd7f32]/30 transition-all duration-300"
                >
                  <Icon className="w-4 h-4 text-[#b0b0b0] hover:text-[#cd7f32]" />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
              PRODUCTS
            </h4>
            <ul className="space-y-2">
              {['Grid Bot', 'Martingale', 'AI Signals', 'Backtesting Engine', 'API Access'].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[#b0b0b0] hover:text-[#cd7f32] transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
              RESOURCES
            </h4>
            <ul className="space-y-2">
              {['Documentation', 'API Reference', 'Strategy Library', 'Status Page', 'Changelog'].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[#b0b0b0] hover:text-[#cd7f32] transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
              COMPANY
            </h4>
            <ul className="space-y-2">
              {['About', 'Careers', 'Blog', 'Terms of Service', 'Privacy Policy'].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[#b0b0b0] hover:text-[#cd7f32] transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#b0b0b0]">
            &copy; {new Date().getFullYear()} KODWorks. All rights reserved.
          </p>
          <p className="text-xs text-[#b0b0b0]/60 max-w-md text-center md:text-right">
            Trading involves significant risk of loss. Past performance does not guarantee future results.
            All strategies operate on Deriv demo accounts only.
          </p>
        </div>
      </div>
    </footer>
  )
}

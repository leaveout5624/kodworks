import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, Zap } from 'lucide-react'

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setMobileOpen(false)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? 'bg-[#0e0e10]/90 backdrop-blur-md border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Zap className="w-6 h-6 text-[#cd7f32] group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-tight text-white">
              KOD<span className="text-[#cd7f32]">Works</span>
            </span>
          </Link>

          {/* Center Links */}
          {isHome && (
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: 'GRID BOT', id: 'algorithms' },
                { label: 'MARTINGALE', id: 'algorithms' },
                { label: 'AI SIGNALS', id: 'algorithms' },
                { label: 'PRICING', id: 'metrics' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.id)}
                  className="text-xs tracking-[0.2em] text-[#b0b0b0] hover:text-[#cd7f32] transition-colors duration-300"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm text-[#b0b0b0] hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#b0b0b0]">{user?.name ?? 'User'}</span>
                  <button
                    onClick={logout}
                    className="text-xs text-[#b0b0b0] hover:text-[#cd7f32] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-[#b0b0b0] hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-2 text-sm font-semibold text-black bg-[#cd7f32] hover:bg-[#e8c07e] transition-all duration-300"
                  style={{ borderRadius: '50px' }}
                >
                  DEPLOY NOW
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0e0e10]/95 backdrop-blur-md border-t border-white/5">
          <div className="px-4 py-4 space-y-3">
            {isHome && (
              <>
                {['GRID BOT', 'MARTINGALE', 'AI SIGNALS', 'PRICING'].map((label) => (
                  <button
                    key={label}
                    onClick={() => scrollToSection('algorithms')}
                    className="block w-full text-left text-sm text-[#b0b0b0] hover:text-[#cd7f32] py-2"
                  >
                    {label}
                  </button>
                ))}
              </>
            )}
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-sm text-[#b0b0b0] py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button onClick={logout} className="block text-sm text-[#cd7f32] py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-sm text-[#b0b0b0] py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="block px-6 py-2 text-center text-sm font-semibold text-black bg-[#cd7f32]"
                  style={{ borderRadius: '50px' }}
                  onClick={() => setMobileOpen(false)}
                >
                  DEPLOY NOW
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

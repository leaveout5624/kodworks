import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, createContext, useContext } from 'react'
import {
  LayoutDashboard,
  Bot,
  Wallet,
  BarChart3,
  FlaskConical,
  Settings,
  LogOut,
  Zap,
  AlertTriangle,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { RiskWarningBanner } from './RiskWarningBanner'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/bots', label: 'Bots', icon: Bot },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/backtest', label: 'Backtest', icon: FlaskConical },
  { path: '/settings', label: 'Settings', icon: Settings },
]

// ── Trading Mode Context ─────────────────────────────────────────
interface TradingModeContextType {
  mode: 'demo' | 'real'
  setMode: (mode: 'demo' | 'real') => void
  riskAcknowledged: boolean
}

const TradingModeContext = createContext<TradingModeContextType>({
  mode: 'demo',
  setMode: () => {},
  riskAcknowledged: false,
})

export function useTradingMode() {
  return useContext(TradingModeContext)
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout } = useAuth({
    redirectOnUnauthenticated: true,
  })

  const utils = trpc.useUtils()
  const { data: modeData } = trpc.deriv.getTradingMode.useQuery(undefined, {
    staleTime: 1000 * 60,
  })
  const setModeMutation = trpc.deriv.setTradingMode.useMutation({
    onSuccess: () => utils.deriv.getTradingMode.invalidate(),
  })

  const [mode, setModeState] = useState<'demo' | 'real'>('demo')
  const [riskAcknowledged, setRiskAcknowledged] = useState(false)

  useEffect(() => {
    if (modeData) {
      setModeState(modeData.tradingMode as 'demo' | 'real')
      setRiskAcknowledged(modeData.riskAcknowledged ?? false)
    }
  }, [modeData])

  const setMode = (newMode: 'demo' | 'real') => {
    if (newMode === 'real' && !riskAcknowledged) {
      navigate('/settings')
      return
    }
    setModeState(newMode)
    setModeMutation.mutate({ mode: newMode, riskAcknowledged })
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== '/login') {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate, location.pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#cd7f32] border-t-transparent animate-spin" />
          <p className="text-[#b0b0b0] text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <TradingModeContext.Provider value={{ mode, setMode, riskAcknowledged }}>
      <div className="min-h-screen bg-[#0e0e10] flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col fixed h-full z-40">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-white/5">
            <Link to="/" className="flex items-center gap-2 group">
              <Zap className="w-5 h-5 text-[#cd7f32] group-hover:scale-110 transition-transform" />
              <span className="text-lg font-bold text-white">
                KOD<span className="text-[#cd7f32]">Works</span>
              </span>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'text-[#cd7f32] bg-[#cd7f32]/10 border-l-2 border-[#cd7f32]'
                      : 'text-[#b0b0b0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-[#cd7f32]' : 'text-[#b0b0b0] group-hover:text-white'}`}
                  />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/5">
            {/* Trading Mode Toggle */}
            <div className="mb-3 p-3 bg-[#0e0e10] border border-white/5">
              <p className="text-[10px] text-[#b0b0b0] uppercase tracking-wider mb-2">Trading Mode</p>
              <div className="flex bg-[#1a1a1a] p-0.5">
                <button
                  onClick={() => setMode('demo')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-all ${
                    mode === 'demo'
                      ? 'bg-[#00d084]/10 text-[#00d084] border border-[#00d084]/20'
                      : 'text-[#b0b0b0] hover:text-white'
                  }`}
                >
                  <FlaskConical className="w-3 h-3" />
                  DEMO
                </button>
                <button
                  onClick={() => setMode('real')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-all ${
                    mode === 'real'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'text-[#b0b0b0] hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  REAL
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#cd7f32]/20 flex items-center justify-center">
                <span className="text-xs font-bold text-[#cd7f32]">
                  {(user?.name ?? 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{user?.name ?? 'User'}</p>
                <p className="text-xs text-[#b0b0b0] truncate">{user?.email ?? ''}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs text-[#b0b0b0] hover:text-[#cd7f32] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          {/* Top Header */}
          <header className="h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30">
            <h1 className="text-lg font-semibold text-white">
              {navItems.find((n) => n.path === location.pathname)?.label ?? 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-xs text-[#b0b0b0] hover:text-[#cd7f32] transition-colors"
              >
                Back to Home
              </Link>
              <div className={`flex items-center gap-2 px-3 py-1 border ${
                mode === 'real'
                  ? 'bg-red-500/5 border-red-500/20'
                  : 'bg-[#00d084]/5 border-[#00d084]/20'
              }`}>
                <div className={`w-2 h-2 rounded-full ${mode === 'real' ? 'bg-red-400 animate-pulse' : 'bg-[#00d084]'}`} />
                <span className={`text-xs font-bold uppercase ${mode === 'real' ? 'text-red-400' : 'text-[#00d084]'}`}>
                  {mode}
                </span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-8">
            <RiskWarningBanner mode={mode} />
            {children}
          </div>
        </main>
      </div>
    </TradingModeContext.Provider>
  )
}

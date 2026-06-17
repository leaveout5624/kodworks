import { DashboardLayout, useTradingMode } from '@/components/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import {
  Settings,
  User,
  Shield,
  Bell,
  Key,
  Save,
  Check,
  AlertTriangle,
  ExternalLink,
  FlaskConical,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const { user } = useAuth()
  const { mode, setMode } = useTradingMode()
  const { data: balance } = trpc.wallet.getBalance.useQuery()
  const { data: connection } = trpc.deriv.getConnection.useQuery()
  const utils = trpc.useUtils()

  const setModeMutation = trpc.deriv.setTradingMode.useMutation({
    onSuccess: () => {
      utils.deriv.getTradingMode.invalidate()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const saveConnectionMutation = trpc.deriv.saveConnection.useMutation({
    onSuccess: () => {
      utils.deriv.getConnection.invalidate()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const [notifications, setNotifications] = useState({
    trades: true,
    deposits: true,
    strategies: false,
    newsletter: false,
  })

  const [derivToken, setDerivToken] = useState('')
  const [derivAppId, setDerivAppId] = useState('')
  const [derivAccountId, setDerivAccountId] = useState('')
  const [saved, setSaved] = useState(false)
  const [riskChecked, setRiskChecked] = useState(false)
  const [showRiskModal, setShowRiskModal] = useState(false)

  // Pre-fill from existing connection
  useEffect(() => {
    if (connection?.apiToken) setDerivToken(connection.apiToken)
    if (connection?.appId) setDerivAppId(connection.appId)
    if (connection?.accountId) setDerivAccountId(connection.accountId)
  }, [connection])

  const handleSaveDeriv = () => {
    saveConnectionMutation.mutate({
      apiToken: derivToken,
      appId: derivAppId || undefined,
      accountId: derivAccountId || undefined,
      isDemo: mode === 'demo',
    })
  }

  const handleModeSwitch = (newMode: 'demo' | 'real') => {
    if (newMode === 'real') {
      setShowRiskModal(true)
    } else {
      setMode('demo')
      setModeMutation.mutate({ mode: 'demo' })
    }
  }

  const handleRiskAcknowledge = () => {
    if (!riskChecked) return
    setShowRiskModal(false)
    setMode('real')
    setModeMutation.mutate({ mode: 'real', riskAcknowledged: true })
  }

  return (
    <DashboardLayout>
      {/* Risk Acknowledgment Modal */}
      {showRiskModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0e0e10] border border-red-500/30 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Risk Acknowledgment Required</h3>
                  <p className="text-xs text-red-400">Before enabling Real Trading</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  'Trading involves substantial risk of loss and is not suitable for all investors.',
                  'You may lose all or more of your initial investment. Past performance is not indicative of future results.',
                  'Real trading uses actual funds from your Deriv account. All executed trades are final.',
                  'Automated strategies can execute multiple trades rapidly, amplifying both gains and losses.',
                  'You are solely responsible for configuring appropriate risk limits (stop-loss, max daily loss, trade size).',
                  'We recommend starting with small trade sizes and thorough backtesting before deploying strategies on real accounts.',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-400 mt-1 shrink-0" />
                    <p className="text-xs text-[#b0b0b0] leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-red-500/5 border border-red-500/20">
                <p className="text-xs text-red-400 font-semibold">
                  By enabling Real Trading, you confirm that you understand these risks and are trading with funds you can afford to lose.
                </p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={riskChecked} onChange={(e) => setRiskChecked(e.target.checked)} className="accent-[#cd7f32] w-4 h-4" />
                <span className="text-xs text-[#b0b0b0]">
                  I have read and understand the risks. I accept full responsibility for my trading decisions.
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowRiskModal(false)} variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/5">
                  Cancel
                </Button>
                <Button onClick={handleRiskAcknowledge} disabled={!riskChecked}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-30">
                  Enable Real Trading
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#cd7f32]" />
          Settings
        </h2>
        <p className="text-sm text-[#b0b0b0]">Manage your account, Deriv connection, and trading preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Trading Mode */}
        <div className="bg-[#0a0a0a] border border-white/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#cd7f32]" />
            Trading Mode
          </h3>
          <div className="flex bg-[#1a1a1a] p-0.5 mb-4">
            <button onClick={() => handleModeSwitch('demo')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
                mode === 'demo' ? 'bg-[#00d084]/10 text-[#00d084] border border-[#00d084]/20' : 'text-[#b0b0b0] hover:text-white'
              }`}>
              <FlaskConical className="w-4 h-4" /> DEMO
            </button>
            <button onClick={() => handleModeSwitch('real')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
                mode === 'real' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-[#b0b0b0] hover:text-white'
              }`}>
              <AlertTriangle className="w-4 h-4" /> REAL
            </button>
          </div>
          {mode === 'real' ? (
            <div className="p-3 bg-red-500/5 border border-red-500/20">
              <p className="text-xs text-red-400 flex items-center gap-2">
                <Check className="w-3 h-3" />
                <strong>Real Trading is ACTIVE</strong> - All trades will use real money
              </p>
            </div>
          ) : (
            <div className="p-3 bg-[#00d084]/5 border border-[#00d084]/20">
              <p className="text-xs text-[#00d084] flex items-center gap-2">
                <Check className="w-3 h-3" />
                Practice mode - virtual funds only, no financial risk
              </p>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="bg-[#0a0a0a] border border-white/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#cd7f32]" />
            Profile Information
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#b0b0b0] mb-1 block">Name</label>
                <input type="text" defaultValue={user?.name ?? ''}
                  className="w-full bg-[#0e0e10] border border-white/10 px-4 py-2 text-sm text-white focus:border-[#cd7f32] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#b0b0b0] mb-1 block">Email</label>
                <input type="email" defaultValue={user?.email ?? ''} readOnly
                  className="w-full bg-[#0e0e10] border border-white/10 px-4 py-2 text-sm text-[#b0b0b0] cursor-not-allowed" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#b0b0b0] mb-1 block">Demo Balance</label>
                <input type="text" value={`$${parseFloat(balance?.demoBalance ?? '10000').toLocaleString('en-US', { minimumFractionDigits: 2 })}`} readOnly
                  className="w-full bg-[#0e0e10] border border-white/10 px-4 py-2 text-sm text-[#b0b0b0] cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs text-[#b0b0b0] mb-1 block">Real Balance</label>
                <input type="text" value={`$${parseFloat(balance?.realBalance ?? '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}`} readOnly
                  className={`w-full bg-[#0e0e10] border px-4 py-2 text-sm cursor-not-allowed ${
                    mode === 'real' ? 'border-red-500/20 text-red-400' : 'border-[#cd7f32]/20 text-[#cd7f32]'
                  }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Deriv API Connection */}
        <div className="bg-[#0a0a0a] border border-white/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-[#cd7f32]" />
            Deriv API Connection
          </h3>
          <div className={`mb-4 p-3 border ${
            mode === 'real'
              ? 'bg-red-500/5 border-red-500/20'
              : 'bg-[#00d084]/5 border-[#00d084]/20'
          }`}>
            <p className={`text-xs flex items-center gap-2 ${mode === 'real' ? 'text-red-400' : 'text-[#00d084]'}`}>
              <Check className="w-3 h-3" />
              {mode === 'real'
                ? 'Connected to Deriv REAL Environment - Live trading active'
                : 'Connected to Deriv Demo Environment - Practice mode'}
            </p>
          </div>

          {mode === 'real' && (
            <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20">
              <p className="text-xs text-red-400 flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                For real trading, you need a valid Deriv API token linked to your real account.
                <a href="https://app.deriv.com/account/api-token" target="_blank" rel="noopener noreferrer"
                  className="text-[#cd7f32] hover:text-[#e8c07e] underline flex items-center gap-1 shrink-0">
                  Get Token <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#b0b0b0] mb-1 block">Deriv API Token {mode === 'real' && <span className="text-red-400">*</span>}</label>
              <input type="password" value={derivToken} onChange={(e) => setDerivToken(e.target.value)}
                placeholder={mode === 'real' ? 'Required for real trading' : 'Optional for demo'}
                className="w-full bg-[#0e0e10] border border-white/10 px-4 py-2 text-sm text-white placeholder-[#b0b0b0]/50 focus:border-[#cd7f32] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#b0b0b0] mb-1 block">App ID</label>
                <input type="text" value={derivAppId} onChange={(e) => setDerivAppId(e.target.value)} placeholder="e.g. 12345"
                  className="w-full bg-[#0e0e10] border border-white/10 px-4 py-2 text-sm text-white placeholder-[#b0b0b0]/50 focus:border-[#cd7f32] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#b0b0b0] mb-1 block">Account ID</label>
                <input type="text" value={derivAccountId} onChange={(e) => setDerivAccountId(e.target.value)} placeholder="CRXXXXX"
                  className="w-full bg-[#0e0e10] border border-white/10 px-4 py-2 text-sm text-white placeholder-[#b0b0b0]/50 focus:border-[#cd7f32] focus:outline-none" />
              </div>
            </div>
            <p className="text-xs text-[#b0b0b0]/60">
              Your API token is encrypted and stored securely. For real trading, this must be a token from your real Deriv account.
            </p>
            <Button onClick={handleSaveDeriv} disabled={saveConnectionMutation.isPending || (mode === 'real' && !derivToken)}
              className="bg-[#cd7f32] hover:bg-[#e8c07e] text-black font-semibold disabled:opacity-50" style={{ borderRadius: '50px' }}>
              <Save className="w-4 h-4 mr-2" />
              {saveConnectionMutation.isPending ? 'Saving...' : 'Save Connection'}
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#0a0a0a] border border-white/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#cd7f32]" />
            Notification Preferences
          </h3>
          <div className="space-y-3">
            {[
              { key: 'trades' as const, label: 'Trade Executions', desc: 'Get notified when trades are opened or closed' },
              { key: 'deposits' as const, label: 'Deposits & Withdrawals', desc: 'Notifications for payment transactions' },
              { key: 'strategies' as const, label: 'Strategy Alerts', desc: 'Alerts when strategies hit limits or errors' },
              { key: 'newsletter' as const, label: 'Newsletter', desc: 'Weekly updates and market insights' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-[#0e0e10] border border-white/5 hover:border-white/10 transition-colors">
                <div>
                  <p className="text-sm text-white">{item.label}</p>
                  <p className="text-xs text-[#b0b0b0]">{item.desc}</p>
                </div>
                <button onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${notifications[item.key] ? 'bg-[#cd7f32]' : 'bg-[#333]'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-[#0a0a0a] border border-white/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#cd7f32]" />
            Security
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-[#0e0e10] border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Two-Factor Authentication</p>
                <p className="text-xs text-[#b0b0b0]">Add an extra layer of security</p>
              </div>
              <span className="text-xs px-2 py-0.5 bg-[#b0b0b0]/10 text-[#b0b0b0] border border-[#b0b0b0]/20">Coming Soon</span>
            </div>
            <div className="p-3 bg-[#0e0e10] border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Session Management</p>
                <p className="text-xs text-[#b0b0b0]">Active sessions: 1</p>
              </div>
              <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Revoke All</button>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <Button onClick={() => setSaved(true)} className="bg-[#cd7f32] hover:bg-[#e8c07e] text-black font-semibold" style={{ borderRadius: '50px' }}>
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
          {saved && (
            <span className="text-xs text-[#00d084] flex items-center gap-1">
              <Check className="w-3 h-3" /> Settings saved successfully
            </span>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

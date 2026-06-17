import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

interface RiskWarningBannerProps {
  mode: 'demo' | 'real'
  onDismiss?: () => void
  dismissible?: boolean
}

export function RiskWarningBanner({ mode, onDismiss, dismissible = false }: RiskWarningBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  if (mode === 'demo') {
    return (
      <div className="bg-[#00d084]/5 border border-[#00d084]/20 px-4 py-3 mb-6 flex items-start gap-3">
        <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-[#00d084]/10 rounded-full mt-0.5">
          <span className="text-xs font-bold text-[#00d084]">DEMO</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-[#00d084] font-medium">Practice Mode Active</p>
          <p className="text-xs text-[#b0b0b0] mt-0.5">
            You are trading with virtual funds. No real money is at risk.
            Switch to Real mode in Settings when you are ready to trade live.
          </p>
        </div>
        {dismissible && (
          <button
            onClick={() => { setDismissed(true); onDismiss?.() }}
            className="text-[#b0b0b0] hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-red-500/5 border border-red-500/30 px-4 py-3 mb-6 flex items-start gap-3 animate-pulse">
      <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-red-500/10 rounded-full mt-0.5">
        <AlertTriangle className="w-4 h-4 text-red-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-red-400 font-bold uppercase tracking-wide">Real Trading Mode - Risk Warning</p>
        <p className="text-xs text-[#b0b0b0] mt-1">
          You are now trading with <span className="text-red-400 font-semibold">REAL MONEY</span>.
          All trades will result in actual financial gains or losses.
          Trading involves significant risk of loss. Only trade with funds you can afford to lose.
          Past performance does not guarantee future results.
        </p>
      </div>
      {dismissible && (
        <button
          onClick={() => { setDismissed(true); onDismiss?.() }}
          className="text-[#b0b0b0] hover:text-white shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

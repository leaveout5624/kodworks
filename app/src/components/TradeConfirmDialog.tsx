import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Shield, Eye } from 'lucide-react'

interface TradePreview {
  symbol: string
  direction: 'buy' | 'sell'
  entryPrice: string
  quantity: string
  totalValue: string
  environment: 'demo' | 'real'
  warning?: string
}

interface TradeConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preview: TradePreview | null
  onConfirm: () => void
  onCancel: () => void
}

export function TradeConfirmDialog({
  open,
  onOpenChange,
  preview,
  onConfirm,
  onCancel,
}: TradeConfirmDialogProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [typedConfirm, setTypedConfirm] = useState('')

  if (!preview) return null

  const isReal = preview.environment === 'real'
  const canConfirm = !isReal || (confirmed && typedConfirm === 'CONFIRM')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0e0e10] border border-red-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            {isReal ? 'Confirm Real Trade' : 'Confirm Trade'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Environment Badge */}
          <div className={`p-3 border ${isReal ? 'bg-red-500/5 border-red-500/20' : 'bg-[#00d084]/5 border-[#00d084]/20'}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${isReal ? 'text-red-400' : 'text-[#00d084]'}`}>
              {preview.environment.toUpperCase()} TRADING
            </span>
          </div>

          {/* Trade Details */}
          <div className="space-y-2">
            {[
              { label: 'Symbol', value: preview.symbol },
              { label: 'Direction', value: preview.direction.toUpperCase(), color: preview.direction === 'buy' ? 'text-[#00d084]' : 'text-red-400' },
              { label: 'Entry Price', value: `$${parseFloat(preview.entryPrice).toFixed(2)}` },
              { label: 'Quantity', value: preview.quantity },
              { label: 'Total Value', value: `$${parseFloat(preview.totalValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, bold: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <span className="text-xs text-[#b0b0b0]">{item.label}</span>
                <span className={`text-sm ${item.bold ? 'font-bold text-white' : 'text-white'} ${item.color ?? ''}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Real Trading Extra Confirmation */}
          {isReal && (
            <div className="space-y-3">
              <div className="p-3 bg-red-500/5 border border-red-500/20">
                <p className="text-xs text-red-400 leading-relaxed flex items-start gap-2">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  This trade will use REAL money from your account.
                  You cannot undo this action once executed.
                  Ensure you understand the risks before proceeding.
                </p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="accent-[#cd7f32] w-4 h-4"
                />
                <span className="text-xs text-[#b0b0b0]">
                  I understand this is a real trade and accept the financial risk
                </span>
              </label>

              {confirmed && (
                <div className="space-y-1">
                  <label className="text-xs text-[#b0b0b0] flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Type &quot;CONFIRM&quot; to execute this real trade
                  </label>
                  <input
                    type="text"
                    value={typedConfirm}
                    onChange={(e) => setTypedConfirm(e.target.value)}
                    placeholder="Type CONFIRM"
                    className="w-full bg-[#0a0a0a] border border-red-500/30 px-4 py-2 text-sm text-white placeholder-[#b0b0b0]/50 focus:border-red-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={!canConfirm}
              className={`flex-1 font-semibold disabled:opacity-30 ${
                isReal
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-[#cd7f32] hover:bg-[#e8c07e] text-black'
              }`}
            >
              {isReal ? 'Execute Real Trade' : 'Confirm Trade'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

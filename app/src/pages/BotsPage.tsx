import { useState } from 'react'
import { DashboardLayout, useTradingMode } from '@/components/DashboardLayout'
import { trpc } from '@/providers/trpc'
import { TradeConfirmDialog } from '@/components/TradeConfirmDialog'
import {
  Bot,
  Plus,
  Play,
  Square,
  Trash2,
  Grid3X3,
  TrendingUp,
  Brain,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const strategyTypes = [
  { value: 'grid', label: 'Grid Bot', icon: <Grid3X3 className="w-4 h-4" /> },
  { value: 'martingale', label: 'Martingale', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'ai_signals', label: 'AI Signals', icon: <Brain className="w-4 h-4" /> },
  { value: 'custom', label: 'Custom', icon: <Sparkles className="w-4 h-4" /> },
]

const assetOptions = ['BTCUSDT', 'ETHUSDT', 'R_75', 'R_100', 'BOOM 1000', 'CRASH 1000']
const indicators = ['price_above', 'price_below', 'rsi', 'ma_cross', 'volume_spike']
const operators = ['above', 'below', 'equals']

function CreateBotDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const { mode } = useTradingMode()
  const [name, setName] = useState('')
  const [strategyType, setStrategyType] = useState('grid')
  const [asset, setAsset] = useState('BTCUSDT')
  const [tradeSize, setTradeSize] = useState('0.01')
  const [maxDailyLoss, setMaxDailyLoss] = useState('100')
  const [takeProfit, setTakeProfit] = useState('10')
  const [stopLoss, setStopLoss] = useState('5')
  const [entryConditions, setEntryConditions] = useState([{ indicator: 'price_above', operator: 'above', value: 0 }])

  const createMutation = trpc.trading.createStrategy.useMutation({
    onSuccess: () => { setOpen(false); onCreated(); resetForm() },
  })

  const resetForm = () => {
    setName(''); setStrategyType('grid'); setAsset('BTCUSDT'); setTradeSize('0.01')
    setMaxDailyLoss('100'); setTakeProfit('10'); setStopLoss('5')
    setEntryConditions([{ indicator: 'price_above', operator: 'above', value: 0 }])
  }

  const handleSubmit = () => {
    createMutation.mutate({
      name, strategyType: strategyType as 'grid' | 'martingale' | 'ai_signals' | 'custom',
      assetSymbol: asset, tradeSize, maxDailyLoss, takeProfit, stopLoss,
      entryConditions,
      exitConditions: [{ type: 'take_profit', value: parseFloat(takeProfit) }, { type: 'stop_loss', value: parseFloat(stopLoss) }],
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#cd7f32] hover:bg-[#e8c07e] text-black font-semibold" style={{ borderRadius: '50px' }}>
          <Plus className="w-4 h-4 mr-2" /> Create Bot
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0e0e10] border border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Create New Bot</DialogTitle>
        </DialogHeader>

        {mode === 'real' && (
          <div className="p-3 bg-red-500/5 border border-red-500/20 mb-4">
            <p className="text-xs text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              This bot will execute <strong>REAL</strong> trades with actual money when activated.
            </p>
          </div>
        )}

        <div className="space-y-5 py-4">
          <div>
            <label className="text-xs text-[#b0b0b0] mb-1 block">Strategy Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Grid Strategy"
              className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2 text-sm text-white placeholder-[#b0b0b0]/50 focus:border-[#cd7f32] focus:outline-none" />
          </div>

          <div>
            <label className="text-xs text-[#b0b0b0] mb-2 block">Strategy Type</label>
            <div className="grid grid-cols-2 gap-2">
              {strategyTypes.map((type) => (
                <button key={type.value} onClick={() => setStrategyType(type.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm border transition-all ${
                    strategyType === type.value ? 'border-[#cd7f32] bg-[#cd7f32]/10 text-[#cd7f32]' : 'border-white/10 text-[#b0b0b0] hover:border-white/20'
                  }`}>
                  {type.icon} {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[#b0b0b0] mb-1 block">Asset Symbol</label>
            <select value={asset} onChange={(e) => setAsset(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2 text-sm text-white focus:border-[#cd7f32] focus:outline-none appearance-none">
              {assetOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#b0b0b0] mb-1 block">Trade Size</label>
              <input type="text" value={tradeSize} onChange={(e) => setTradeSize(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2 text-sm text-white focus:border-[#cd7f32] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-[#b0b0b0] mb-1 block">Max Daily Loss</label>
              <input type="text" value={maxDailyLoss} onChange={(e) => setMaxDailyLoss(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2 text-sm text-white focus:border-[#cd7f32] focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#b0b0b0] mb-1 block">Take Profit (%)</label>
              <input type="text" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2 text-sm text-white focus:border-[#cd7f32] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-[#b0b0b0] mb-1 block">Stop Loss (%)</label>
              <input type="text" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2 text-sm text-white focus:border-[#cd7f32] focus:outline-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[#b0b0b0]">Entry Conditions</label>
              <button onClick={() => setEntryConditions([...entryConditions, { indicator: 'price_above', operator: 'above', value: 0 }])}
                className="text-xs text-[#cd7f32] hover:text-[#e8c07e]">+ Add</button>
            </div>
            {entryConditions.map((cond, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select value={cond.indicator} onChange={(e) => { const u = [...entryConditions]; u[i] = { ...u[i], indicator: e.target.value }; setEntryConditions(u) }}
                  className="flex-1 bg-[#0a0a0a] border border-white/10 px-2 py-1.5 text-xs text-white">
                  {indicators.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
                <select value={cond.operator} onChange={(e) => { const u = [...entryConditions]; u[i] = { ...u[i], operator: e.target.value }; setEntryConditions(u) }}
                  className="bg-[#0a0a0a] border border-white/10 px-2 py-1.5 text-xs text-white">
                  {operators.map((op) => <option key={op} value={op}>{op}</option>)}
                </select>
                <input type="number" value={cond.value} onChange={(e) => { const u = [...entryConditions]; u[i] = { ...u[i], value: parseFloat(e.target.value) }; setEntryConditions(u) }}
                  className="w-20 bg-[#0a0a0a] border border-white/10 px-2 py-1.5 text-xs text-white" />
                {entryConditions.length > 1 && (
                  <button onClick={() => setEntryConditions(entryConditions.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                )}
              </div>
            ))}
          </div>

          <Button onClick={handleSubmit} disabled={!name || createMutation.isPending}
            className={`w-full font-semibold disabled:opacity-50 ${
              mode === 'real' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#cd7f32] hover:bg-[#e8c07e] text-black'
            }`} style={{ borderRadius: '50px' }}>
            {createMutation.isPending ? 'Creating...' : mode === 'real' ? 'Create Real Strategy' : 'Create Strategy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StrategyCard({ strategy, onToggle, onDelete }: {
  strategy: { id: number; name: string; strategyType: string; assetSymbol: string; isActive: boolean; status: string; tradeSize: string; createdAt: Date | string }
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}) {
  const { mode } = useTradingMode()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const typeConfig = strategyTypes.find((t) => t.value === strategy.strategyType) ?? strategyTypes[0]
  const statusColor = strategy.status === 'running' ? 'text-[#00d084]' : strategy.status === 'error' ? 'text-red-400' : 'text-[#b0b0b0]'

  const handleToggle = () => {
    if (mode === 'real' && !strategy.isActive) {
      setConfirmOpen(true)
    } else {
      onToggle(strategy.id)
    }
  }

  return (
    <>
      <div className="bg-[#0a0a0a] border border-white/5 hover:border-[#cd7f32]/20 transition-all duration-300 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-[#cd7f32]/10 border border-[#cd7f32]/20">
              {typeConfig.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{strategy.name}</h3>
              <p className="text-xs text-[#b0b0b0]">{strategy.assetSymbol} &middot; {typeConfig.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${strategy.isActive ? 'bg-[#00d084]' : 'bg-[#b0b0b0]/50'}`} />
            <span className={`text-xs ${statusColor}`}>{strategy.status}</span>
          </div>
        </div>

        {mode === 'real' && strategy.isActive && (
          <div className="mb-3 p-2 bg-red-500/5 border border-red-500/20">
            <p className="text-[10px] text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Executing REAL trades
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><p className="text-xs text-[#b0b0b0]">Trade Size</p><p className="text-sm text-white">{strategy.tradeSize}</p></div>
          <div><p className="text-xs text-[#b0b0b0]">Created</p><p className="text-sm text-white">{strategy.createdAt ? new Date(strategy.createdAt).toLocaleDateString() : '-'}</p></div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleToggle}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium transition-all ${
              strategy.isActive
                ? 'bg-red-400/10 text-red-400 hover:bg-red-400/20 border border-red-400/20'
                : mode === 'real' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-[#00d084]/10 text-[#00d084] hover:bg-[#00d084]/20 border border-[#00d084]/20'
            }`}>
            {strategy.isActive ? <><Square className="w-3 h-3" /> Stop</> : <><Play className="w-3 h-3" /> Start{mode === 'real' ? ' (Real)' : ''}</>}
          </button>
          <button onClick={() => onDelete(strategy.id)} className="p-2 text-[#b0b0b0] hover:text-red-400 border border-white/10 hover:border-red-400/20 transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <TradeConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        preview={{
          symbol: strategy.assetSymbol,
          direction: 'buy',
          entryPrice: strategy.tradeSize,
          quantity: strategy.tradeSize,
          totalValue: strategy.tradeSize,
          environment: 'real',
          warning: `Starting bot "${strategy.name}" will execute REAL trades with actual money.`,
        }}
        onConfirm={() => { setConfirmOpen(false); onToggle(strategy.id) }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

export default function BotsPage() {
  const { mode } = useTradingMode()
  const utils = trpc.useUtils()
  const { data: strategies, isLoading } = trpc.trading.listStrategies.useQuery()

  const toggleMutation = trpc.trading.toggleStrategy.useMutation({
    onSuccess: () => utils.trading.listStrategies.invalidate(),
  })

  const deleteMutation = trpc.trading.deleteStrategy.useMutation({
    onSuccess: () => utils.trading.listStrategies.invalidate(),
  })

  return (
    <DashboardLayout>
      {/* Mode indicator */}
      {mode === 'real' && (
        <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-400">Real Trading Mode Active</p>
            <p className="text-xs text-[#b0b0b0]">
              All bots will execute with real money. Ensure your Deriv API token is configured and your real account is funded.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold text-white">Strategy Manager</h2>
          <p className="text-sm text-[#b0b0b0]">{strategies?.length ?? 0} strategies &middot; {(strategies ?? []).filter((s) => s.isActive).length} active</p>
        </div>
        <CreateBotDialog onCreated={() => utils.trading.listStrategies.invalidate()} />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#0a0a0a] border border-white/5 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 skeleton-shimmer" />
                <div className="space-y-2"><Skeleton className="h-4 w-24 skeleton-shimmer" /><Skeleton className="h-3 w-16 skeleton-shimmer" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4"><Skeleton className="h-8 skeleton-shimmer" /><Skeleton className="h-8 skeleton-shimmer" /></div>
              <Skeleton className="h-8 skeleton-shimmer" />
            </div>
          ))}
        </div>
      ) : strategies && strategies.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy}
              onToggle={(id) => toggleMutation.mutate({ id })}
              onDelete={(id) => { if (confirm('Delete this strategy?')) deleteMutation.mutate({ id }) }} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#0a0a0a] border border-white/5">
          <Bot className="w-12 h-12 text-[#b0b0b0]/30 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Strategies Yet</h3>
          <p className="text-sm text-[#b0b0b0] mb-6 max-w-md">Create your first strategy to start automating your trades.</p>
          <CreateBotDialog onCreated={() => utils.trading.listStrategies.invalidate()} />
        </div>
      )}
    </DashboardLayout>
  )
}

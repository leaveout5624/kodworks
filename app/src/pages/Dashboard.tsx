import { useEffect, useRef, useState } from 'react'
import { DashboardLayout, useTradingMode } from '@/components/DashboardLayout'
import { trpc } from '@/providers/trpc'
import { TradeConfirmDialog } from '@/components/TradeConfirmDialog'
import {
  TrendingUp,
  Bot,
  Activity,
  Wallet,
  BarChart3,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

// ── Chart Component using Lightweight Charts via Canvas ──────────
function PriceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<Array<{ time: number; price: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateData = () => {
      const points: Array<{ time: number; price: number }> = []
      let price = 65000
      const now = Date.now()
      for (let i = 100; i >= 0; i--) {
        price = price + (Math.random() - 0.48) * 200
        points.push({ time: now - i * 60000, price })
      }
      setData(points)
      setLoading(false)
    }
    generateData()
    const interval = setInterval(() => {
      setData((prev) => {
        const lastPrice = prev[prev.length - 1]?.price ?? 65000
        const newPrice = lastPrice + (Math.random() - 0.48) * 150
        return [...prev.slice(1), { time: Date.now(), price: newPrice }]
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const padding = { top: 20, right: 60, bottom: 30, left: 10 }

    const prices = data.map((d) => d.price)
    const minPrice = Math.min(...prices) * 0.999
    const maxPrice = Math.max(...prices) * 1.001
    const priceRange = maxPrice - minPrice

    ctx.clearRect(0, 0, w, h)

    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (h - padding.top - padding.bottom) * (i / 4)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(w - padding.right, y)
      ctx.stroke()

      const price = maxPrice - (priceRange * i) / 4
      ctx.fillStyle = '#b0b0b0'
      ctx.font = '10px Inter'
      ctx.textAlign = 'left'
      ctx.fillText(price.toFixed(2), w - padding.right + 5, y + 3)
    }

    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    ctx.beginPath()
    ctx.strokeStyle = '#cd7f32'
    ctx.lineWidth = 2
    data.forEach((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW
      const y = padding.top + ((maxPrice - d.price) / priceRange) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    ctx.beginPath()
    data.forEach((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW
      const y = padding.top + ((maxPrice - d.price) / priceRange) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.lineTo(padding.left + chartW, h - padding.bottom)
    ctx.lineTo(padding.left, h - padding.bottom)
    ctx.closePath()
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom)
    gradient.addColorStop(0, 'rgba(205, 127, 50, 0.2)')
    gradient.addColorStop(1, 'rgba(205, 127, 50, 0)')
    ctx.fillStyle = gradient
    ctx.fill()

    const lastPoint = data[data.length - 1]
    const lastX = padding.left + chartW
    const lastY = padding.top + ((maxPrice - lastPoint.price) / priceRange) * chartH
    ctx.beginPath()
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#cd7f32'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(lastX, lastY, 8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(205, 127, 50, 0.3)'
    ctx.fill()

    ctx.fillStyle = '#b0b0b0'
    ctx.font = '10px Inter'
    ctx.textAlign = 'center'
    for (let i = 0; i <= 4; i++) {
      const idx = Math.floor((i / 4) * (data.length - 1))
      const x = padding.left + (idx / (data.length - 1)) * chartW
      const date = new Date(data[idx].time)
      ctx.fillText(
        `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        x,
        h - 8
      )
    }
  }, [data])

  if (loading) {
    return (
      <div className="w-full h-[320px] bg-[#0a0a0a] border border-white/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#cd7f32] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#b0b0b0]">Loading chart data...</p>
        </div>
      </div>
    )
  }

  const currentPrice = data[data.length - 1]?.price ?? 0
  const prevPrice = data[data.length - 2]?.price ?? currentPrice
  const change = ((currentPrice - prevPrice) / prevPrice) * 100

  return (
    <div className="bg-[#0a0a0a] border border-white/5">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">BTCUSDT</span>
          <span
            className={`text-xs flex items-center gap-1 ${change >= 0 ? 'text-[#00d084]' : 'text-red-400'}`}
          >
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>
        <span className="text-lg font-bold text-[#cd7f32]">{currentPrice.toFixed(2)}</span>
      </div>
      <canvas ref={canvasRef} className="w-full h-[280px]" style={{ display: 'block' }} />
    </div>
  )
}

// ── Stat Card ────────────────────────────────────────────────────
function StatCard({ icon, label, value, change, loading }: {
  icon: React.ReactNode
  label: string
  value: string
  change?: string
  loading?: boolean
}) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-5 hover:border-[#cd7f32]/10 transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 flex items-center justify-center bg-[#cd7f32]/10 border border-[#cd7f32]/20">
          {icon}
        </div>
        {change && (
          <span className="text-xs text-[#00d084] flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {change}
          </span>
        )}
      </div>
      {loading ? <Skeleton className="h-7 w-20 skeleton-shimmer" /> : <p className="text-xl font-bold text-white">{value}</p>}
      <p className="text-xs text-[#b0b0b0] mt-1">{label}</p>
    </div>
  )
}

// ── Positions Table ──────────────────────────────────────────────
function PositionsTable() {
  const { data: positions, isLoading } = trpc.trading.listPositions.useQuery()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-[#0a0a0a] border border-white/5">
            <Skeleton className="h-4 w-20 skeleton-shimmer" />
            <Skeleton className="h-4 w-16 skeleton-shimmer" />
            <Skeleton className="h-4 w-24 skeleton-shimmer" />
            <Skeleton className="h-4 w-20 skeleton-shimmer" />
          </div>
        ))}
      </div>
    )
  }

  if (!positions || positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Target className="w-10 h-10 text-[#b0b0b0]/30 mb-3" />
        <p className="text-sm text-[#b0b0b0]">No open positions</p>
        <p className="text-xs text-[#b0b0b0]/60 mt-1">Start a bot to see positions here</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left text-xs text-[#b0b0b0] font-medium py-3 px-4">Symbol</th>
            <th className="text-left text-xs text-[#b0b0b0] font-medium py-3 px-4">Side</th>
            <th className="text-left text-xs text-[#b0b0b0] font-medium py-3 px-4">Quantity</th>
            <th className="text-left text-xs text-[#b0b0b0] font-medium py-3 px-4">Entry</th>
            <th className="text-left text-xs text-[#b0b0b0] font-medium py-3 px-4">P&L</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => {
            const pnl = parseFloat(pos.unrealizedPnl ?? '0')
            return (
              <tr key={pos.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-4 text-sm font-medium text-white">{pos.symbol}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 ${pos.side === 'long' ? 'bg-[#00d084]/10 text-[#00d084]' : 'bg-red-400/10 text-red-400'}`}>
                    {pos.side.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-[#b0b0b0]">{pos.quantity}</td>
                <td className="py-3 px-4 text-sm text-[#b0b0b0]">{pos.avgEntryPrice}</td>
                <td className={`py-3 px-4 text-sm font-medium ${pnl >= 0 ? 'text-[#00d084]' : 'text-red-400'}`}>
                  {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Recent Trades ────────────────────────────────────────────────
function RecentTrades() {
  const { data: trades, isLoading } = trpc.trading.listTrades.useQuery()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-3 bg-[#0a0a0a] border border-white/5">
            <Skeleton className="h-4 w-16 skeleton-shimmer" />
            <Skeleton className="h-4 w-12 skeleton-shimmer" />
            <Skeleton className="h-4 w-20 skeleton-shimmer" />
          </div>
        ))}
      </div>
    )
  }

  const recentTrades = (trades ?? []).slice(0, 5)
  if (recentTrades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="w-8 h-8 text-[#b0b0b0]/30 mb-2" />
        <p className="text-sm text-[#b0b0b0]">No trades yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {recentTrades.map((trade) => {
        const pnl = parseFloat(trade.pnl ?? '0')
        return (
          <div key={trade.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${trade.direction === 'buy' ? 'bg-[#00d084]' : 'bg-red-400'}`} />
              <div>
                <p className="text-sm font-medium text-white">{trade.symbol}</p>
                <p className="text-xs text-[#b0b0b0]">{trade.direction.toUpperCase()} @ {trade.entryPrice}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${pnl >= 0 ? 'text-[#00d084]' : 'text-red-400'}`}>
                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
              </p>
              <p className="text-xs text-[#b0b0b0]">{trade.status}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Quick Trade Panel ────────────────────────────────────────────
function QuickTradePanel() {
  const { mode } = useTradingMode()
  const utils = trpc.useUtils()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [preview, setPreview] = useState<{
    symbol: string
    direction: 'buy' | 'sell'
    entryPrice: string
    quantity: string
    totalValue: string
    environment: 'demo' | 'real'
    warning?: string
  } | null>(null)

  const createTrade = trpc.trading.createTrade.useMutation({
    onSuccess: (data) => {
      if ('requiresConfirmation' in data && data.requiresConfirmation) {
        setPreview(data.preview as typeof preview)
        setConfirmOpen(true)
      } else {
        utils.trading.listTrades.invalidate()
      }
    },
  })

  const handleQuickTrade = (direction: 'buy' | 'sell') => {
    createTrade.mutate({
      symbol: 'BTCUSDT',
      direction,
      entryPrice: '65000',
      quantity: '0.01',
      environment: mode,
    })
  }

  const handleConfirmedTrade = () => {
    if (!preview) return
    setConfirmOpen(false)
    createTrade.mutate({
      symbol: preview.symbol,
      direction: preview.direction,
      entryPrice: preview.entryPrice,
      quantity: preview.quantity,
      environment: mode,
      confirmed: true,
    })
    setPreview(null)
  }

  return (
    <>
      <div className="bg-[#0a0a0a] border border-white/5 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#cd7f32]" />
            Quick Trade
          </h3>
          <span className={`text-xs px-2 py-0.5 border ${
            mode === 'real' ? 'text-red-400 border-red-400/20 bg-red-400/5' : 'text-[#00d084] border-[#00d084]/20 bg-[#00d084]/5'
          }`}>
            {mode.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleQuickTrade('buy')}
            disabled={createTrade.isPending}
            className="bg-[#00d084]/10 text-[#00d084] hover:bg-[#00d084]/20 border border-[#00d084]/20 font-semibold disabled:opacity-30"
          >
            {createTrade.isPending ? '...' : 'BUY'}
          </Button>
          <Button
            onClick={() => handleQuickTrade('sell')}
            disabled={createTrade.isPending}
            className="bg-red-400/10 text-red-400 hover:bg-red-400/20 border border-red-400/20 font-semibold disabled:opacity-30"
          >
            {createTrade.isPending ? '...' : 'SELL'}
          </Button>
        </div>
        {mode === 'real' && (
          <p className="text-[10px] text-red-400/60 mt-2 text-center">
            Real trades require confirmation. Your balance will be deducted.
          </p>
        )}
      </div>

      <TradeConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        preview={preview}
        onConfirm={handleConfirmedTrade}
        onCancel={() => { setConfirmOpen(false); setPreview(null) }}
      />
    </>
  )
}

// ── Dashboard Page ───────────────────────────────────────────────
export default function Dashboard() {
  const { mode } = useTradingMode()
  const { data: balance, isLoading: balanceLoading } = trpc.wallet.getBalance.useQuery()
  const { data: strategies, isLoading: strategiesLoading } = trpc.trading.listStrategies.useQuery()
  const { data: positions, isLoading: positionsLoading } = trpc.trading.listPositions.useQuery()
  const { data: auditSummary } = trpc.audit.getRealTradesSummary.useQuery()

  const activeBots = (strategies ?? []).filter((s) => s.isActive).length
  const totalPositions = positions?.length ?? 0
  const realTradeCount = auditSummary?.totalRealTrades ?? 0

  return (
    <DashboardLayout>
      <QuickTradePanel />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Wallet className="w-4 h-4 text-[#cd7f32]" />}
          label={mode === 'real' ? 'Real Balance' : 'Demo Balance'}
          value={`$${parseFloat(mode === 'real' ? (balance?.realBalance ?? '0') : (balance?.demoBalance ?? '10000')).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          loading={balanceLoading}
        />
        <StatCard
          icon={<Bot className="w-4 h-4 text-[#cd7f32]" />}
          label="Active Bots"
          value={String(activeBots)}
          loading={strategiesLoading}
        />
        <StatCard
          icon={<Activity className="w-4 h-4 text-[#cd7f32]" />}
          label="Open Positions"
          value={String(totalPositions)}
          loading={positionsLoading}
        />
        <StatCard
          icon={<BarChart3 className="w-4 h-4 text-[#cd7f32]" />}
          label="Real Trades Executed"
          value={String(realTradeCount)}
        />
      </div>

      {/* Chart */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#cd7f32]" />
            Price Chart
          </h2>
          <div className="flex gap-2">
            {['1m', '5m', '15m', '1h', '4h'].map((tf) => (
              <button
                key={tf}
                className={`px-3 py-1 text-xs border transition-colors ${
                  tf === '1m' ? 'border-[#cd7f32] text-[#cd7f32] bg-[#cd7f32]/10' : 'border-white/10 text-[#b0b0b0] hover:border-[#cd7f32]/30'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <PriceChart />
      </div>

      {/* Two Column */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#cd7f32]" />
            Open Positions
          </h2>
          <div className="bg-[#0a0a0a] border border-white/5"><PositionsTable /></div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#cd7f32]" />
            Recent Trades
          </h2>
          <div className="bg-[#0a0a0a] border border-white/5 p-4"><RecentTrades /></div>
        </div>
      </div>
    </DashboardLayout>
  )
}

import { useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { trpc } from '@/providers/trpc'
import {
  TrendingUp,
  BarChart3,
  Target,
  Activity,
  PieChart,
  Trophy,
  AlertTriangle,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

function EquityChart({ data }: { data: Array<{ timestamp: string; value: number }> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    const values = data.map((d) => d.value)
    const minVal = Math.min(...values, 0) * 1.1
    const maxVal = Math.max(...values, 1) * 1.1
    const valRange = maxVal - minVal

    ctx.clearRect(0, 0, w, h)

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (h - padding.top - padding.bottom) * (i / 4)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(w - padding.right, y)
      ctx.stroke()

      const val = maxVal - (valRange * i) / 4
      ctx.fillStyle = '#b0b0b0'
      ctx.font = '10px Inter'
      ctx.textAlign = 'left'
      ctx.fillText(`$${val.toFixed(0)}`, w - padding.right + 5, y + 3)
    }

    // Line
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    ctx.beginPath()
    ctx.strokeStyle = '#cd7f32'
    ctx.lineWidth = 2
    data.forEach((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW
      const y = padding.top + ((maxVal - d.value) / valRange) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Fill
    ctx.beginPath()
    data.forEach((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW
      const y = padding.top + ((maxVal - d.value) / valRange) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.lineTo(padding.left + chartW, h - padding.bottom)
    ctx.lineTo(padding.left, h - padding.bottom)
    ctx.closePath()
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom)
    gradient.addColorStop(0, 'rgba(205, 127, 50, 0.3)')
    gradient.addColorStop(1, 'rgba(205, 127, 50, 0)')
    ctx.fillStyle = gradient
    ctx.fill()
  }, [data])

  return <canvas ref={canvasRef} className="w-full h-[300px]" style={{ display: 'block' }} />
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  loading,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtext?: string
  loading?: boolean
}) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-5 hover:border-[#cd7f32]/10 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-xs text-[#b0b0b0]">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20 skeleton-shimmer" />
      ) : (
        <>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtext && <p className="text-xs text-[#b0b0b0] mt-1">{subtext}</p>}
        </>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: performance, isLoading: perfLoading } = trpc.analytics.getPerformance.useQuery()
  const { data: equityCurve, isLoading: curveLoading } = trpc.analytics.getEquityCurve.useQuery()

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#cd7f32]" />
          Performance Analytics
        </h2>
        <p className="text-sm text-[#b0b0b0]">Track your trading performance and strategy metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={<Target className="w-4 h-4 text-[#cd7f32]" />}
          label="Total Trades"
          value={String(performance?.totalTrades ?? 0)}
          loading={perfLoading}
        />
        <MetricCard
          icon={<Trophy className="w-4 h-4 text-[#00d084]" />}
          label="Win Rate"
          value={`${performance?.winRate ?? 0}%`}
          subtext={`${performance?.winTrades ?? 0} winning trades`}
          loading={perfLoading}
        />
        <MetricCard
          icon={<TrendingUp className="w-4 h-4 text-[#cd7f32]" />}
          label="Total P&L"
          value={`$${parseFloat(performance?.totalPnl ?? '0').toFixed(2)}`}
          loading={perfLoading}
        />
        <MetricCard
          icon={<Activity className="w-4 h-4 text-[#cd7f32]" />}
          label="Avg P&L / Trade"
          value={`$${parseFloat(performance?.avgPnl ?? '0').toFixed(2)}`}
          loading={perfLoading}
        />
      </div>

      {/* Equity Curve */}
      <div className="bg-[#0a0a0a] border border-white/5 mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#cd7f32]" />
            Equity Curve
          </h3>
        </div>
        <div className="p-4">
          {curveLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-full w-full skeleton-shimmer" />
            </div>
          ) : equityCurve && equityCurve.length > 0 ? (
            <EquityChart data={equityCurve} />
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center">
              <TrendingUp className="w-10 h-10 text-[#b0b0b0]/30 mb-3" />
              <p className="text-sm text-[#b0b0b0]">No equity data yet</p>
              <p className="text-xs text-[#b0b0b0]/60 mt-1">
                Execute trades to see your equity curve
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Strategy Breakdown */}
      <div className="bg-[#0a0a0a] border border-white/5">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#cd7f32]" />
            Strategy Breakdown
          </h3>
        </div>
        <div className="p-4">
          {perfLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 skeleton-shimmer" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 skeleton-shimmer" />
                    <Skeleton className="h-3 w-20 skeleton-shimmer" />
                  </div>
                  <Skeleton className="h-6 w-16 skeleton-shimmer" />
                </div>
              ))}
            </div>
          ) : performance?.strategyBreakdown && performance.strategyBreakdown.length > 0 ? (
            <div className="space-y-3">
              {performance.strategyBreakdown.map((s) => {
                const pnl = parseFloat(s.totalPnl)
                return (
                  <div
                    key={s.strategyId ?? 'manual'}
                    className="flex items-center justify-between p-4 bg-[#0e0e10] border border-white/5 hover:border-[#cd7f32]/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-[#cd7f32]/10 border border-[#cd7f32]/20">
                        <PieChart className="w-4 h-4 text-[#cd7f32]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{s.strategyName}</p>
                        <p className="text-xs text-[#b0b0b0]">
                          {s.totalTrades} trades &middot; avg ${parseFloat(s.avgPnl).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${pnl >= 0 ? 'text-[#00d084]' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="w-10 h-10 text-[#b0b0b0]/30 mb-3" />
              <p className="text-sm text-[#b0b0b0]">No strategy data available</p>
              <p className="text-xs text-[#b0b0b0]/60 mt-1">
                Create and run strategies to see performance breakdown
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

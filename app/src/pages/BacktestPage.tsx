import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { trpc } from '@/providers/trpc'
import {
  FlaskConical,
  Play,
  TrendingUp,
  Target,
  Shield,
  BarChart3,
  Clock,
  AlertTriangle,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const assetSymbols = ['BTCUSDT', 'ETHUSDT', 'R_75', 'R_100', 'BOOM 1000', 'CRASH 1000']
const strategyTypes = ['grid', 'martingale', 'ai_signals', 'custom'] as const

export default function BacktestPage() {
  const [asset, setAsset] = useState('BTCUSDT')
  const [strategy, setStrategy] = useState<'grid' | 'martingale' | 'ai_signals' | 'custom'>('grid')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [tradeSize, setTradeSize] = useState('0.01')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<{
    totalPnl: number
    winRate: number
    sharpeRatio: number
    maxDrawdown: number
    profitFactor: number
    totalTrades: number
    avgTradeDuration: number
    report: {
      equityCurve: Array<{ timestamp: string; value: number }>
      monthlyBreakdown: Array<{ month: string; pnl: number; trades: number }>
    }
  } | null>(null)

  const backtestMutation = trpc.backtest.run.useMutation({
    onSuccess: (data) => {
      setResult(data)
      setRunning(false)
    },
    onError: () => {
      setRunning(false)
    },
  })

  const handleRun = () => {
    if (!startDate || !endDate) return
    setRunning(true)
    backtestMutation.mutate({
      assetSymbol: asset,
      strategyType: strategy,
      tradeSize,
      startDate,
      endDate,
      entryConditions: [
        { indicator: 'price_above', operator: 'above', value: 0 },
      ],
      exitConditions: [
        { type: 'take_profit', value: 10 },
        { type: 'stop_loss', value: 5 },
      ],
    })
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-[#cd7f32]" />
          Strategy Backtester
        </h2>
        <p className="text-sm text-[#b0b0b0]">
          Test your strategies on historical data before going live
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-[#0a0a0a] border border-white/5 p-6 mb-8">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-[#cd7f32]" />
          Backtest Configuration
        </h3>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* Asset */}
          <div>
            <label className="text-xs text-[#b0b0b0] mb-1 block">Asset Symbol</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full bg-[#0e0e10] border border-white/10 px-4 py-2 text-sm text-white focus:border-[#cd7f32] focus:outline-none"
            >
              {assetSymbols.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Strategy Type */}
          <div>
            <label className="text-xs text-[#b0b0b0] mb-1 block">Strategy Type</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as typeof strategy)}
              className="w-full bg-[#0e0e10] border border-white/10 px-4 py-2 text-sm text-white focus:border-[#cd7f32] focus:outline-none"
            >
              {strategyTypes.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Trade Size */}
          <div>
            <label className="text-xs text-[#b0b0b0] mb-1 block">Trade Size</label>
            <input
              type="text"
              value={tradeSize}
              onChange={(e) => setTradeSize(e.target.value)}
              className="w-full bg-[#0e0e10] border border-white/10 px-4 py-2 text-sm text-white focus:border-[#cd7f32] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Start Date */}
          <div>
            <label className="text-xs text-[#b0b0b0] mb-1 block">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#0e0e10] border border-white/10 px-4 py-2 text-sm text-white focus:border-[#cd7f32] focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-xs text-[#b0b0b0] mb-1 block">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#0e0e10] border border-white/10 px-4 py-2 text-sm text-white focus:border-[#cd7f32] focus:outline-none"
            />
          </div>
        </div>

        <Button
          onClick={handleRun}
          disabled={!startDate || !endDate || running}
          className="bg-[#cd7f32] hover:bg-[#e8c07e] text-black font-semibold disabled:opacity-50"
          style={{ borderRadius: '50px' }}
        >
          {running ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
              Running Backtest...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Backtest
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <TrendingUp className="w-4 h-4 text-[#cd7f32]" />,
                label: 'Total P&L',
                value: `$${result.totalPnl.toFixed(2)}`,
                color: result.totalPnl >= 0 ? 'text-[#00d084]' : 'text-red-400',
              },
              {
                icon: <Target className="w-4 h-4 text-[#00d084]" />,
                label: 'Win Rate',
                value: `${result.winRate.toFixed(1)}%`,
                color: 'text-white',
              },
              {
                icon: <BarChart3 className="w-4 h-4 text-[#cd7f32]" />,
                label: 'Sharpe Ratio',
                value: result.sharpeRatio.toFixed(2),
                color: 'text-white',
              },
              {
                icon: <Shield className="w-4 h-4 text-red-400" />,
                label: 'Max Drawdown',
                value: `$${result.maxDrawdown.toFixed(2)}`,
                color: 'text-red-400',
              },
              {
                icon: <TrendingUp className="w-4 h-4 text-[#cd7f32]" />,
                label: 'Profit Factor',
                value: typeof result.profitFactor === 'number' && isFinite(result.profitFactor) ? result.profitFactor.toFixed(2) : '0.00',
                color: 'text-white',
              },
              {
                icon: <Clock className="w-4 h-4 text-[#cd7f32]" />,
                label: 'Total Trades',
                value: String(result.totalTrades),
                color: 'text-white',
              },
            ].map((metric) => (
              <div key={metric.label} className="bg-[#0a0a0a] border border-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  {metric.icon}
                  <span className="text-xs text-[#b0b0b0]">{metric.label}</span>
                </div>
                <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
              </div>
            ))}
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-[#0a0a0a] border border-white/5">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">Monthly Breakdown</h3>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs text-[#b0b0b0] py-3 px-4">Month</th>
                    <th className="text-left text-xs text-[#b0b0b0] py-3 px-4">Trades</th>
                    <th className="text-left text-xs text-[#b0b0b0] py-3 px-4">P&L</th>
                    <th className="text-left text-xs text-[#b0b0b0] py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.report.monthlyBreakdown.map((m) => (
                    <tr key={m.month} className="border-b border-white/5">
                      <td className="py-3 px-4 text-sm text-white">{m.month}</td>
                      <td className="py-3 px-4 text-sm text-[#b0b0b0]">{m.trades}</td>
                      <td className={`py-3 px-4 text-sm font-medium ${m.pnl >= 0 ? 'text-[#00d084]' : 'text-red-400'}`}>
                        {m.pnl >= 0 ? '+' : ''}${m.pnl.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {m.pnl >= 0 ? (
                          <span className="flex items-center gap-1 text-xs text-[#00d084]">
                            <Check className="w-3 h-3" /> Profitable
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-400">
                            <AlertTriangle className="w-3 h-3" /> Loss
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

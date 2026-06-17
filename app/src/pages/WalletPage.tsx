import { useState } from 'react'
import { DashboardLayout, useTradingMode } from '@/components/DashboardLayout'
import { trpc } from '@/providers/trpc'
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Bitcoin,
  Landmark,
  CircleDollarSign,
  Check,
  X,
  Clock,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer', icon: <Landmark className="w-5 h-5" /> },
  { value: 'credit_card', label: 'Credit Card', icon: <CreditCard className="w-5 h-5" /> },
  { value: 'crypto', label: 'Cryptocurrency', icon: <Bitcoin className="w-5 h-5" /> },
  { value: 'paypal', label: 'PayPal', icon: <CircleDollarSign className="w-5 h-5" /> },
]

function DepositDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('bank_transfer')
  const createDeposit = trpc.wallet.createDeposit.useMutation({
    onSuccess: () => { setOpen(false); setAmount(''); onSuccess() },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#00d084] hover:bg-[#00b874] text-black font-semibold" style={{ borderRadius: '50px' }}>
          <ArrowDownLeft className="w-4 h-4 mr-2" /> Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0e0e10] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Deposit Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div>
            <label className="text-xs text-[#b0b0b0] mb-1 block">Amount (USD)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000"
              className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2 text-sm text-white placeholder-[#b0b0b0]/50 focus:border-[#cd7f32] focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-[#b0b0b0] mb-2 block">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((pm) => (
                <button key={pm.value} onClick={() => setMethod(pm.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm border transition-all ${
                    method === pm.value ? 'border-[#00d084] bg-[#00d084]/10 text-[#00d084]' : 'border-white/10 text-[#b0b0b0] hover:border-white/20'
                  }`}>
                  {pm.icon} {pm.label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={() => createDeposit.mutate({ amount, currency: 'USD', paymentMethod: method as 'bank_transfer' | 'credit_card' | 'crypto' | 'paypal' | 'skrill' })}
            disabled={!amount || createDeposit.isPending}
            className="w-full bg-[#00d084] hover:bg-[#00b874] text-black font-semibold disabled:opacity-50" style={{ borderRadius: '50px' }}>
            {createDeposit.isPending ? 'Processing...' : 'Confirm Deposit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function WithdrawalDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('bank_transfer')
  const [address, setAddress] = useState('')
  const createWithdrawal = trpc.wallet.createWithdrawal.useMutation({
    onSuccess: () => { setOpen(false); setAmount(''); setAddress(''); onSuccess() },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[#cd7f32] text-[#cd7f32] hover:bg-[#cd7f32]/10 font-semibold" style={{ borderRadius: '50px' }}>
          <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0e0e10] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Withdraw Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div>
            <label className="text-xs text-[#b0b0b0] mb-1 block">Amount (USD)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000"
              className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2 text-sm text-white placeholder-[#b0b0b0]/50 focus:border-[#cd7f32] focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-[#b0b0b0] mb-2 block">Withdrawal Method</label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.slice(0, 3).map((pm) => (
                <button key={pm.value} onClick={() => setMethod(pm.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm border transition-all ${
                    method === pm.value ? 'border-[#cd7f32] bg-[#cd7f32]/10 text-[#cd7f32]' : 'border-white/10 text-[#b0b0b0] hover:border-white/20'
                  }`}>
                  {pm.icon} {pm.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[#b0b0b0] mb-1 block">Destination Address / Account</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter wallet address or bank account"
              className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2 text-sm text-white placeholder-[#b0b0b0]/50 focus:border-[#cd7f32] focus:outline-none" />
          </div>
          <Button onClick={() => createWithdrawal.mutate({ amount, currency: 'USD', paymentMethod: method as 'bank_transfer' | 'crypto' | 'paypal' | 'skrill', destinationAddress: address })}
            disabled={!amount || !address || createWithdrawal.isPending}
            className="w-full bg-[#cd7f32] hover:bg-[#e8c07e] text-black font-semibold disabled:opacity-50" style={{ borderRadius: '50px' }}>
            {createWithdrawal.isPending ? 'Processing...' : 'Confirm Withdrawal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ReactNode }> = {
    pending: { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: <Clock className="w-3 h-3" /> },
    completed: { color: 'text-[#00d084] bg-[#00d084]/10 border-[#00d084]/20', icon: <Check className="w-3 h-3" /> },
    failed: { color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: <X className="w-3 h-3" /> },
    processing: { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: <RotateCcw className="w-3 h-3 animate-spin" /> },
    cancelled: { color: 'text-[#b0b0b0] bg-[#b0b0b0]/10 border-[#b0b0b0]/20', icon: <X className="w-3 h-3" /> },
  }
  const c = config[status] ?? config.pending
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border ${c.color}`}>{c.icon} {status.charAt(0).toUpperCase() + status.slice(1)}</span>
}

export default function WalletPage() {
  const { mode } = useTradingMode()
  const utils = trpc.useUtils()
  const { data: balance, isLoading: balanceLoading } = trpc.wallet.getBalance.useQuery()
  const { data: transactions, isLoading: txLoading } = trpc.wallet.listTransactions.useQuery()
  const refresh = () => { utils.wallet.getBalance.invalidate(); utils.wallet.listTransactions.invalidate() }

  return (
    <DashboardLayout>
      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#0a0a0a] border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#cd7f32]" />
              <span className="text-sm text-[#b0b0b0]">Demo Balance</span>
            </div>
            <span className="text-xs px-2 py-0.5 bg-[#00d084]/10 text-[#00d084] border border-[#00d084]/20">PRACTICE</span>
          </div>
          {balanceLoading ? <Skeleton className="h-10 w-32 skeleton-shimmer" /> : (
            <p className="text-3xl font-bold text-white">${parseFloat(balance?.demoBalance ?? '10000').toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          )}
          <p className="text-xs text-[#b0b0b0] mt-1">Used for testing strategies risk-free</p>
        </div>

        <div className={`p-6 ${mode === 'real' ? 'bg-red-500/5 border border-red-500/30' : 'bg-[#0a0a0a] border border-[#cd7f32]/20'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#cd7f32]" />
              <span className="text-sm text-[#b0b0b0]">Real Balance</span>
            </div>
            <span className={`text-xs px-2 py-0.5 border ${mode === 'real' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-[#cd7f32]/10 text-[#cd7f32] border-[#cd7f32]/20'}`}>
              {mode === 'real' ? 'ACTIVE' : 'LIVE'}
            </span>
          </div>
          {balanceLoading ? <Skeleton className="h-10 w-32 skeleton-shimmer" /> : (
            <p className={`text-3xl font-bold ${mode === 'real' ? 'text-red-400' : 'text-[#cd7f32]'}`}>
              ${parseFloat(balance?.realBalance ?? '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          )}
          <p className="text-xs text-[#b0b0b0] mt-1">
            {mode === 'real' ? 'REAL FUNDS - Trading with actual money' : 'Available for live trading'}
          </p>
        </div>
      </div>

      {/* Risk warning for real mode */}
      {mode === 'real' && (
        <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Financial Risk Notice</p>
            <p className="text-xs text-[#b0b0b0] mt-1">
              Deposited funds are used for real trading. Ensure you only deposit amounts you can afford to lose.
              Withdrawals are processed within 1-3 business days.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-8">
        <DepositDialog onSuccess={refresh} />
        <WithdrawalDialog onSuccess={refresh} />
      </div>

      {/* Transaction History */}
      <div className="bg-[#0a0a0a] border border-white/5">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Transaction History</h3>
          <button onClick={refresh} className="text-xs text-[#b0b0b0] hover:text-[#cd7f32] transition-colors">Refresh</button>
        </div>

        {txLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 skeleton-shimmer" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32 skeleton-shimmer" /><Skeleton className="h-3 w-20 skeleton-shimmer" /></div>
                <Skeleton className="h-6 w-20 skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-[#b0b0b0] font-medium py-3 px-6">Type</th>
                  <th className="text-left text-xs text-[#b0b0b0] font-medium py-3 px-4">Amount</th>
                  <th className="text-left text-xs text-[#b0b0b0] font-medium py-3 px-4">Method</th>
                  <th className="text-left text-xs text-[#b0b0b0] font-medium py-3 px-4">Status</th>
                  <th className="text-left text-xs text-[#b0b0b0] font-medium py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: Record<string, unknown>) => (
                  <tr key={Number(tx.id)} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        {tx.type === 'deposit' ? (
                          <div className="w-8 h-8 flex items-center justify-center bg-[#00d084]/10 border border-[#00d084]/20">
                            <ArrowDownLeft className="w-4 h-4 text-[#00d084]" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center bg-[#cd7f32]/10 border border-[#cd7f32]/20">
                            <ArrowUpRight className="w-4 h-4 text-[#cd7f32]" />
                          </div>
                        )}
                        <span className="text-sm text-white capitalize">{String(tx.type)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-white">${parseFloat(String(tx.amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-sm text-[#b0b0b0] capitalize">{String(tx.paymentMethod).replace('_', ' ')}</td>
                    <td className="py-3 px-4"><StatusBadge status={String(tx.status)} /></td>
                    <td className="py-3 px-4 text-sm text-[#b0b0b0]">{tx.createdAt ? new Date(String(tx.createdAt)).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Wallet className="w-10 h-10 text-[#b0b0b0]/30 mb-3" />
            <p className="text-sm text-[#b0b0b0]">No transactions yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

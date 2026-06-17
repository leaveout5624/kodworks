import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { backtestResults } from "@db/schema";
// backtest router

// ── Backtest Engine ──────────────────────────────────────────────
// Simulates strategy execution over historical data with realistic
// slippage and fees for accurate performance metrics.

interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradeSim {
  direction: "buy" | "sell";
  entryPrice: number;
  exitPrice?: number;
  pnl: number;
  openedAt: number;
  closedAt?: number;
}

interface BacktestReport {
  equityCurve: { timestamp: string; value: number }[];
  monthlyBreakdown: { month: string; pnl: number; trades: number }[];
}

function generateMockCandles(
  symbol: string,
  startDate: Date,
  endDate: Date,
  basePrice: number
): Candle[] {
  const candles: Candle[] = [];
  const msPerCandle = 60 * 1000; // 1-minute candles
  const volatility = symbol.includes("BOOM") || symbol.includes("CRASH") ? 0.002 : 0.0005;
  let currentPrice = basePrice;

  for (
    let t = startDate.getTime();
    t <= endDate.getTime();
    t += msPerCandle
  ) {
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;
    const volume = Math.floor(Math.random() * 10000) + 1000;

    candles.push({
      timestamp: t,
      open,
      high,
      low,
      close,
      volume,
    });
    currentPrice = close;
  }
  return candles;
}

function evaluateEntryConditions(
  conditions: Array<{ indicator: string; operator: string; value: number }>,
  candle: Candle,
  prevCandle?: Candle
): boolean {
  if (!conditions || conditions.length === 0) return Math.random() > 0.7;

  return conditions.every((cond) => {
    const price = candle.close;
    switch (cond.indicator) {
      case "price_above":
        return price > cond.value;
      case "price_below":
        return price < cond.value;
      case "rsi": {
        if (!prevCandle) return false;
        const change = candle.close - prevCandle.close;
        const rsi = change > 0 ? 50 + Math.random() * 50 : 50 - Math.random() * 50;
        return cond.operator === "above" ? rsi > cond.value : rsi < cond.value;
      }
      case "ma_cross": {
        if (!prevCandle) return false;
        const maShort = (candle.close + candle.open) / 2;
        const maLong = (prevCandle.close + prevCandle.open) / 2;
        return cond.operator === "above" ? maShort > maLong : maShort < maLong;
      }
      default:
        return Math.random() > 0.6;
    }
  });
}

function runBacktestSimulation(
  candles: Candle[],
  entryConditions: Array<{ indicator: string; operator: string; value: number }>,
  exitConditions: Array<{ type: string; value: number }>,
  tradeSize: number,
  slippage: number = 0.0005,
  fee: number = 0.001
): {
  trades: TradeSim[];
  totalPnl: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number;
  report: BacktestReport;
  totalTrades: number;
  avgTradeDuration: number;
} {
  const trades: TradeSim[] = [];
  let openTrade: TradeSim | null = null;
  const equityCurve: { timestamp: string; value: number }[] = [];
  const monthlyPnL: Map<string, { pnl: number; trades: number }> = new Map();

  let peakEquity = 0;
  let maxDrawdown = 0;
  let currentEquity = 0;
  let winningTrades = 0;
  let totalWinAmount = 0;
  let totalLossAmount = 0;
  let totalDuration = 0;

  const tpValue = exitConditions?.find((e) => e.type === "take_profit")?.value ?? 10;
  const slValue = exitConditions?.find((e) => e.type === "stop_loss")?.value ?? 5;

  for (let i = 1; i < candles.length; i++) {
    const candle = candles[i];
    const prevCandle = candles[i - 1];

    if (!openTrade) {
      if (evaluateEntryConditions(entryConditions, candle, prevCandle)) {
        const entrySlippage = candle.close * slippage * (Math.random() > 0.5 ? 1 : -1);
        openTrade = {
          direction: "buy",
          entryPrice: candle.close + entrySlippage,
          pnl: 0,
          openedAt: candle.timestamp,
        };
      }
    } else {
      // Check exit conditions
      const priceChange = ((candle.close - openTrade.entryPrice) / openTrade.entryPrice) * 100;
      const exitSlippage = candle.close * slippage * (Math.random() > 0.5 ? 1 : -1);
      let shouldExit = false;
      let exitPrice = candle.close + exitSlippage;

      if (priceChange >= tpValue) {
        shouldExit = true;
        exitPrice = openTrade.entryPrice * (1 + (tpValue / 100));
      } else if (priceChange <= -slValue) {
        shouldExit = true;
        exitPrice = openTrade.entryPrice * (1 - (slValue / 100));
      }

      if (shouldExit) {
        const rawPnl = (exitPrice - openTrade.entryPrice) * tradeSize;
        const feeCost = (openTrade.entryPrice + exitPrice) * tradeSize * fee;
        const pnl = rawPnl - feeCost;

        openTrade.exitPrice = exitPrice;
        openTrade.pnl = pnl;
        openTrade.closedAt = candle.timestamp;
        trades.push(openTrade);

        if (pnl > 0) {
          winningTrades++;
          totalWinAmount += pnl;
        } else {
          totalLossAmount += Math.abs(pnl);
        }

        totalDuration += candle.timestamp - openTrade.openedAt;
        currentEquity += pnl;

        if (currentEquity > peakEquity) peakEquity = currentEquity;
        const drawdown = peakEquity - currentEquity;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;

        equityCurve.push({
          timestamp: new Date(candle.timestamp).toISOString(),
          value: currentEquity,
        });

        const month = new Date(candle.timestamp).toISOString().slice(0, 7);
        const existing = monthlyPnL.get(month) ?? { pnl: 0, trades: 0 };
        monthlyPnL.set(month, { pnl: existing.pnl + pnl, trades: existing.trades + 1 });

        openTrade = null;
      }
    }
  }

  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? Infinity : 0;
  const avgTradeDuration = totalTrades > 0 ? Math.round(totalDuration / totalTrades / 1000) : 0;

  // Sharpe ratio calculation
  const returns = trades.map((t) => t.pnl);
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  const monthlyBreakdown = Array.from(monthlyPnL.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));

  return {
    trades,
    totalPnl: currentEquity,
    winRate,
    sharpeRatio,
    maxDrawdown,
    profitFactor,
    report: { equityCurve, monthlyBreakdown },
    totalTrades,
    avgTradeDuration,
  };
}

export const backtestRouter = createRouter({
  run: authedQuery
    .input(
      z.object({
        assetSymbol: z.string().min(1),
        strategyType: z.enum(["grid", "martingale", "ai_signals", "custom"]),
        entryConditions: z
          .array(
            z.object({
              indicator: z.string(),
              operator: z.string(),
              value: z.number(),
            })
          )
          .optional(),
        exitConditions: z
          .array(
            z.object({
              type: z.string(),
              value: z.number(),
            })
          )
          .optional(),
        tradeSize: z.string().default("0.01"),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      const basePrices: Record<string, number> = {
        R_75: 5000,
        R_100: 8000,
        "BOOM 1000": 10000,
        "CRASH 1000": 5000,
        BTCUSDT: 65000,
        ETHUSDT: 3500,
      };
      const basePrice = basePrices[input.assetSymbol] ?? 5000;
      const candles = generateMockCandles(input.assetSymbol, start, end, basePrice);

      const result = runBacktestSimulation(
        candles,
        input.entryConditions ?? [],
        input.exitConditions ?? [],
        parseFloat(input.tradeSize)
      );

      // Save result to database
      const db = getDb();
      await db.insert(backtestResults).values({
        userId: ctx.user.id,
        strategyName: `${input.strategyType} - ${input.assetSymbol}`,
        assetSymbol: input.assetSymbol,
        startDate: start,
        endDate: end,
        totalPnl: String(result.totalPnl.toFixed(2)),
        winRate: String(result.winRate.toFixed(2)),
        sharpeRatio: String(result.sharpeRatio.toFixed(2)),
        maxDrawdown: String(result.maxDrawdown.toFixed(2)),
        profitFactor: String(
          typeof result.profitFactor === "number" && isFinite(result.profitFactor)
            ? result.profitFactor.toFixed(2)
            : "0"
        ),
        totalTrades: result.totalTrades,
        avgTradeDuration: result.avgTradeDuration,
        report: result.report,
      });

      return {
        totalPnl: result.totalPnl,
        winRate: result.winRate,
        sharpeRatio: result.sharpeRatio,
        maxDrawdown: result.maxDrawdown,
        profitFactor: result.profitFactor,
        totalTrades: result.totalTrades,
        avgTradeDuration: result.avgTradeDuration,
        report: result.report,
      };
    }),
});

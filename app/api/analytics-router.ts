import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { trades, strategies, backtestResults } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const analyticsRouter = createRouter({
  getPerformance: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Total trades count
    const totalTradesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(trades)
      .where(eq(trades.userId, userId));
    const totalTrades = totalTradesResult[0]?.count ?? 0;

    // Win count (positive pnl)
    const winTradesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(trades)
      .where(
        and(
          eq(trades.userId, userId),
          sql`${trades.pnl} > 0`
        )
      );
    const winTrades = winTradesResult[0]?.count ?? 0;
    const winRate = totalTrades > 0 ? ((winTrades / totalTrades) * 100).toFixed(2) : "0";

    // Total P&L
    const totalPnlResult = await db
      .select({ total: sql<string>`COALESCE(SUM(${trades.pnl}), 0)` })
      .from(trades)
      .where(eq(trades.userId, userId));
    const totalPnl = totalPnlResult[0]?.total ?? "0";

    // Average P&L per trade
    const avgPnlResult = await db
      .select({ avg: sql<string>`COALESCE(AVG(${trades.pnl}), 0)` })
      .from(trades)
      .where(eq(trades.userId, userId));
    const avgPnl = avgPnlResult[0]?.avg ?? "0";

    // Open positions count
    const openTradesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.status, "open")));
    const openPositions = openTradesResult[0]?.count ?? 0;

    // Active strategies count
    const activeStrategiesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(strategies)
      .where(and(eq(strategies.userId, userId), eq(strategies.isActive, true)));
    const activeStrategies = activeStrategiesResult[0]?.count ?? 0;

    // Strategy breakdown
    const strategyPerformance = await db
      .select({
        strategyId: trades.strategyId,
        totalTrades: sql<number>`count(*)`,
        totalPnl: sql<string>`COALESCE(SUM(${trades.pnl}), 0)`,
        avgPnl: sql<string>`COALESCE(AVG(${trades.pnl}), 0)`,
      })
      .from(trades)
      .where(eq(trades.userId, userId))
      .groupBy(trades.strategyId);

    // Get strategy names
    const allStrategies = await db
      .select({ id: strategies.id, name: strategies.name })
      .from(strategies)
      .where(eq(strategies.userId, userId));

    const strategyMap = new Map(allStrategies.map((s) => [s.id, s.name]));
    const strategyBreakdown = strategyPerformance.map((sp) => ({
      strategyName: sp.strategyId ? strategyMap.get(sp.strategyId) ?? "Unknown" : "Manual",
      ...sp,
    }));

    return {
      totalTrades,
      winTrades,
      winRate,
      totalPnl,
      avgPnl,
      openPositions,
      activeStrategies,
      strategyBreakdown,
    };
  }),

  getEquityCurve: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const tradeHistory = await db
      .select({
        pnl: trades.pnl,
        openedAt: trades.openedAt,
      })
      .from(trades)
      .where(eq(trades.userId, userId))
      .orderBy(trades.openedAt);

    let cumulative = 0;
    const equityCurve = tradeHistory.map((trade) => {
      cumulative += parseFloat(trade.pnl ?? "0");
      return {
        timestamp: trade.openedAt ? new Date(trade.openedAt).toISOString() : new Date().toISOString(),
        value: cumulative,
      };
    });

    return equityCurve;
  }),

  listBacktestResults: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const results = await db
      .select()
      .from(backtestResults)
      .where(eq(backtestResults.userId, ctx.user.id))
      .orderBy(backtestResults.createdAt);
    return results;
  }),
});

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { strategies, trades, positions, tradeAuditLogs } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const tradingRouter = createRouter({
  // ── Strategies ─────────────────────────────────────────────────
  listStrategies: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    const results = await db
      .select()
      .from(strategies)
      .where(eq(strategies.userId, userId))
      .orderBy(desc(strategies.createdAt));
    return results;
  }),

  createStrategy: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        strategyType: z.enum(["grid", "martingale", "ai_signals", "custom"]),
        assetSymbol: z.string().min(1).max(20),
        entryConditions: z.array(
          z.object({
            indicator: z.string(),
            operator: z.string(),
            value: z.number(),
          })
        ).optional(),
        exitConditions: z.array(
          z.object({
            type: z.string(),
            value: z.number(),
          })
        ).optional(),
        tradeSize: z.string().default("0.01"),
        maxDailyLoss: z.string().default("100.00"),
        takeProfit: z.string().optional(),
        stopLoss: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const [strategy] = await db.insert(strategies).values({
        userId,
        name: input.name,
        strategyType: input.strategyType,
        assetSymbol: input.assetSymbol,
        entryConditions: input.entryConditions,
        exitConditions: input.exitConditions,
        tradeSize: input.tradeSize,
        maxDailyLoss: input.maxDailyLoss,
        takeProfit: input.takeProfit,
        stopLoss: input.stopLoss,
        isActive: false,
        status: "stopped",
      });
      return strategy;
    }),

  updateStrategy: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        assetSymbol: z.string().min(1).max(20).optional(),
        entryConditions: z.array(z.object({ indicator: z.string(), operator: z.string(), value: z.number() })).optional(),
        exitConditions: z.array(z.object({ type: z.string(), value: z.number() })).optional(),
        tradeSize: z.string().optional(),
        maxDailyLoss: z.string().optional(),
        takeProfit: z.string().optional(),
        stopLoss: z.string().optional(),
        isActive: z.boolean().optional(),
        status: z.enum(["running", "stopped", "error", "paused"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db
        .update(strategies)
        .set(updates)
        .where(and(eq(strategies.id, id), eq(strategies.userId, ctx.user.id)));
      return { success: true };
    }),

  deleteStrategy: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(strategies)
        .where(and(eq(strategies.id, input.id), eq(strategies.userId, ctx.user.id)));
      return { success: true };
    }),

  toggleStrategy: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(strategies)
        .where(and(eq(strategies.id, input.id), eq(strategies.userId, ctx.user.id)));
      if (existing.length === 0) return { success: false, error: "Strategy not found" };
      const current = existing[0];
      const newIsActive = !current.isActive;
      const newStatus = newIsActive ? "running" : "stopped";
      await db
        .update(strategies)
        .set({ isActive: newIsActive, status: newStatus })
        .where(eq(strategies.id, input.id));
      return { success: true, isActive: newIsActive, status: newStatus };
    }),

  // ── Trades ─────────────────────────────────────────────────────
  listTrades: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const results = await db
      .select()
      .from(trades)
      .where(eq(trades.userId, ctx.user.id))
      .orderBy(desc(trades.openedAt));
    return results;
  }),

  createTrade: authedQuery
    .input(
      z.object({
        strategyId: z.number().optional(),
        symbol: z.string().min(1).max(20),
        direction: z.enum(["buy", "sell"]),
        entryPrice: z.string(),
        quantity: z.string(),
        environment: z.enum(["demo", "real"]).default("demo"),
        confirmed: z.boolean().default(false),
        clientIp: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // If real trade and not confirmed, return preview (require confirmation)
      if (input.environment === "real" && !input.confirmed) {
        return {
          requiresConfirmation: true,
          preview: {
            symbol: input.symbol,
            direction: input.direction,
            entryPrice: input.entryPrice,
            quantity: input.quantity,
            totalValue: (parseFloat(input.entryPrice) * parseFloat(input.quantity)).toFixed(2),
            environment: "real",
            warning: "This is a REAL trade with actual financial risk. Please confirm to proceed.",
          },
        };
      }

      // Execute the trade
      const [trade] = await db.insert(trades).values({
        userId: ctx.user.id,
        strategyId: input.strategyId,
        symbol: input.symbol,
        direction: input.direction,
        entryPrice: input.entryPrice,
        quantity: input.quantity,
        status: "open",
      });

      // Log to audit table
      await db.insert(tradeAuditLogs).values({
        userId: ctx.user.id,
        strategyId: input.strategyId,
        tradeId: trade.insertId ? Number(trade.insertId) : undefined,
        symbol: input.symbol,
        direction: input.direction,
        entryPrice: input.entryPrice,
        quantity: input.quantity,
        environment: input.environment,
        status: "executed",
        clientIp: input.clientIp,
        userAgent: input.userAgent,
      });

      return { success: true, trade, requiresConfirmation: false };
    }),

  closeTrade: authedQuery
    .input(
      z.object({
        id: z.number(),
        exitPrice: z.string(),
        pnl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(trades)
        .set({
          exitPrice: input.exitPrice,
          pnl: input.pnl,
          status: "closed",
          closedAt: new Date(),
        })
        .where(and(eq(trades.id, input.id), eq(trades.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── Positions ──────────────────────────────────────────────────
  listPositions: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const results = await db
      .select()
      .from(positions)
      .where(eq(positions.userId, ctx.user.id))
      .orderBy(desc(positions.lastUpdated));
    return results;
  }),

  upsertPosition: authedQuery
    .input(
      z.object({
        symbol: z.string().min(1).max(20),
        quantity: z.string(),
        avgEntryPrice: z.string(),
        currentPrice: z.string().optional(),
        unrealizedPnl: z.string().optional(),
        side: z.enum(["long", "short"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(positions)
        .where(
          and(
            eq(positions.userId, ctx.user.id),
            eq(positions.symbol, input.symbol)
          )
        );
      if (existing.length > 0) {
        await db
          .update(positions)
          .set({
            quantity: input.quantity,
            avgEntryPrice: input.avgEntryPrice,
            currentPrice: input.currentPrice,
            unrealizedPnl: input.unrealizedPnl,
            lastUpdated: new Date(),
          })
          .where(eq(positions.id, existing[0].id));
      } else {
        await db.insert(positions).values({
          userId: ctx.user.id,
          symbol: input.symbol,
          quantity: input.quantity,
          avgEntryPrice: input.avgEntryPrice,
          currentPrice: input.currentPrice,
          unrealizedPnl: input.unrealizedPnl,
          side: input.side,
        });
      }
      return { success: true };
    }),

  closePosition: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(positions)
        .where(and(eq(positions.id, input.id), eq(positions.userId, ctx.user.id)));
      return { success: true };
    }),
});

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tradeAuditLogs } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const auditRouter = createRouter({
  listLogs: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const logs = await db
      .select()
      .from(tradeAuditLogs)
      .where(eq(tradeAuditLogs.userId, ctx.user.id))
      .orderBy(desc(tradeAuditLogs.createdAt))
      .limit(200);
    return logs;
  }),

  createLog: authedQuery
    .input(
      z.object({
        strategyId: z.number().optional(),
        tradeId: z.number().optional(),
        symbol: z.string().min(1),
        direction: z.enum(["buy", "sell"]),
        entryPrice: z.string(),
        quantity: z.string(),
        environment: z.enum(["demo", "real"]),
        status: z.enum(["executed", "confirmed", "failed", "cancelled"]).default("executed"),
        apiResponse: z.record(z.string(), z.any()).optional(),
        clientIp: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(tradeAuditLogs).values({
        userId: ctx.user.id,
        strategyId: input.strategyId,
        tradeId: input.tradeId,
        symbol: input.symbol,
        direction: input.direction,
        entryPrice: input.entryPrice,
        quantity: input.quantity,
        environment: input.environment,
        status: input.status,
        apiResponse: input.apiResponse,
        clientIp: input.clientIp,
        userAgent: input.userAgent,
      });
      return { success: true };
    }),

  getRealTradesSummary: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const logs = await db
      .select()
      .from(tradeAuditLogs)
      .where(eq(tradeAuditLogs.userId, ctx.user.id));

    const realTrades = logs.filter((l) => l.environment === "real");
    const demoTrades = logs.filter((l) => l.environment === "demo");

    return {
      totalRealTrades: realTrades.length,
      totalDemoTrades: demoTrades.length,
      realTradesByStatus: {
        executed: realTrades.filter((t) => t.status === "executed").length,
        confirmed: realTrades.filter((t) => t.status === "confirmed").length,
        failed: realTrades.filter((t) => t.status === "failed").length,
        cancelled: realTrades.filter((t) => t.status === "cancelled").length,
      },
      recentLogs: logs.slice(0, 20),
    };
  }),
});

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { derivConnections, users } from "@db/schema";
import { eq } from "drizzle-orm";
import { env } from "./lib/env";
import { setUserEnvironment } from "./services/deriv";

export const derivRouter = createRouter({
  getConnection: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const conn = await db
      .select()
      .from(derivConnections)
      .where(eq(derivConnections.userId, ctx.user.id));
    return conn[0] ?? null;
  }),

  saveConnection: authedQuery
    .input(
      z.object({
        apiToken: z.string().min(1),
        appId: z.string().optional(),
        accountId: z.string().optional(),
        isDemo: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(derivConnections)
        .where(eq(derivConnections.userId, ctx.user.id));

      if (existing.length > 0) {
        await db
          .update(derivConnections)
          .set({
            apiToken: input.apiToken,
            appId: input.appId ?? env.derivAppId ?? "",
            accountId: input.accountId,
            isDemo: input.isDemo,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(derivConnections.id, existing[0].id));
      } else {
        await db.insert(derivConnections).values({
          userId: ctx.user.id,
          apiToken: input.apiToken,
          appId: input.appId ?? env.derivAppId ?? "",
          accountId: input.accountId,
          isDemo: input.isDemo,
          isActive: true,
        });
      }
      return { success: true };
    }),

  getTradingMode: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = await db
      .select({ tradingMode: users.tradingMode, riskAcknowledged: users.riskAcknowledged })
      .from(users)
      .where(eq(users.id, ctx.user.id));
    return user[0] ?? { tradingMode: "demo", riskAcknowledged: false };
  }),

  setTradingMode: authedQuery
    .input(
      z.object({
        mode: z.enum(["demo", "real"]),
        riskAcknowledged: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      if (input.mode === "real" && !input.riskAcknowledged) {
        return { success: false, error: "You must acknowledge the risk warning before enabling real trading" };
      }

      await db
        .update(users)
        .set({
          tradingMode: input.mode,
          riskAcknowledged: input.riskAcknowledged ?? false,
        })
        .where(eq(users.id, ctx.user.id));

      // Sync with Deriv service
      try {
        setUserEnvironment(String(ctx.user.id), input.mode);
      } catch {
        // Service may not be initialized yet, that's OK
      }

      return { success: true, mode: input.mode };
    }),

  disconnect: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db
      .update(derivConnections)
      .set({ isActive: false })
      .where(eq(derivConnections.userId, ctx.user.id));
    return { success: true };
  }),
});

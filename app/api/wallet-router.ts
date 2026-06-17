import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { deposits, withdrawals, users } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const walletRouter = createRouter({
  // ── Balance ────────────────────────────────────────────────────
  getBalance: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = await db
      .select({
        demoBalance: users.demoBalance,
        realBalance: users.realBalance,
        currency: users.currency,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id));
    return user[0] ?? { demoBalance: "0", realBalance: "0", currency: "USD" };
  }),

  // ── Deposits ───────────────────────────────────────────────────
  listDeposits: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const results = await db
      .select()
      .from(deposits)
      .where(eq(deposits.userId, ctx.user.id))
      .orderBy(desc(deposits.createdAt));
    return results;
  }),

  createDeposit: authedQuery
    .input(
      z.object({
        amount: z.string().min(1),
        currency: z.string().default("USD"),
        paymentMethod: z.enum(["bank_transfer", "credit_card", "crypto", "paypal", "skrill"]),
        transactionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [deposit] = await db.insert(deposits).values({
        userId: ctx.user.id,
        amount: input.amount,
        currency: input.currency,
        paymentMethod: input.paymentMethod,
        transactionId: input.transactionId,
        status: "pending",
      });
      return deposit;
    }),

  updateDepositStatus: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "completed", "failed", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, status } = input;
      const completedAt = status === "completed" ? new Date() : undefined;
      await db
        .update(deposits)
        .set({ status, completedAt })
        .where(and(eq(deposits.id, id), eq(deposits.userId, ctx.user.id)));

      // If completed, update user balance
      if (status === "completed") {
        const deposit = await db
          .select()
          .from(deposits)
          .where(and(eq(deposits.id, id), eq(deposits.userId, ctx.user.id)));
        if (deposit.length > 0) {
          const currentUser = await db
            .select({ realBalance: users.realBalance })
            .from(users)
            .where(eq(users.id, ctx.user.id));
          const currentBalance = parseFloat(currentUser[0]?.realBalance ?? "0");
          const depositAmount = parseFloat(deposit[0].amount);
          await db
            .update(users)
            .set({ realBalance: String(currentBalance + depositAmount) })
            .where(eq(users.id, ctx.user.id));
        }
      }
      return { success: true };
    }),

  // ── Withdrawals ────────────────────────────────────────────────
  listWithdrawals: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const results = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, ctx.user.id))
      .orderBy(desc(withdrawals.createdAt));
    return results;
  }),

  createWithdrawal: authedQuery
    .input(
      z.object({
        amount: z.string().min(1),
        currency: z.string().default("USD"),
        paymentMethod: z.enum(["bank_transfer", "crypto", "paypal", "skrill"]),
        destinationAddress: z.string().optional(),
        transactionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      // Check sufficient balance
      const user = await db
        .select({ realBalance: users.realBalance })
        .from(users)
        .where(eq(users.id, ctx.user.id));
      const currentBalance = parseFloat(user[0]?.realBalance ?? "0");
      const withdrawalAmount = parseFloat(input.amount);
      if (withdrawalAmount > currentBalance) {
        return { success: false, error: "Insufficient balance" };
      }
      const [withdrawal] = await db.insert(withdrawals).values({
        userId: ctx.user.id,
        amount: input.amount,
        currency: input.currency,
        paymentMethod: input.paymentMethod,
        destinationAddress: input.destinationAddress,
        transactionId: input.transactionId,
        status: "pending",
      });
      return { success: true, withdrawal };
    }),

  updateWithdrawalStatus: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, status } = input;
      const completedAt = status === "completed" ? new Date() : undefined;
      await db
        .update(withdrawals)
        .set({ status, completedAt })
        .where(and(eq(withdrawals.id, id), eq(withdrawals.userId, ctx.user.id)));

      // If completed, deduct from user balance
      if (status === "completed") {
        const withdrawal = await db
          .select()
          .from(withdrawals)
          .where(and(eq(withdrawals.id, id), eq(withdrawals.userId, ctx.user.id)));
        if (withdrawal.length > 0) {
          const currentUser = await db
            .select({ realBalance: users.realBalance })
            .from(users)
            .where(eq(users.id, ctx.user.id));
          const currentBalance = parseFloat(currentUser[0]?.realBalance ?? "0");
          const withdrawalAmount = parseFloat(withdrawal[0].amount);
          if (currentBalance >= withdrawalAmount) {
            await db
              .update(users)
              .set({ realBalance: String(currentBalance - withdrawalAmount) })
              .where(eq(users.id, ctx.user.id));
          }
        }
      }
      return { success: true };
    }),

  // ── Transactions (combined deposits + withdrawals) ─────────────
  listTransactions: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const deps = await db
      .select()
      .from(deposits)
      .where(eq(deposits.userId, ctx.user.id))
      .orderBy(desc(deposits.createdAt));
    const wds = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, ctx.user.id))
      .orderBy(desc(withdrawals.createdAt));

    const transactions = [
      ...deps.map((d) => ({
        ...d,
        type: "deposit" as const,
        createdAt: d.createdAt,
      })),
      ...wds.map((w) => ({
        ...w,
        type: "withdrawal" as const,
        createdAt: w.createdAt,
      })),
    ].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
    return transactions;
  }),
});

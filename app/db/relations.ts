import { relations } from "drizzle-orm";
import {
  users,
  strategies,
  trades,
  positions,
  deposits,
  withdrawals,
  backtestResults,
  derivConnections,
  tradeAuditLogs,
} from "./schema";

export const usersRelations = relations(users, ({ many, one }) => ({
  strategies: many(strategies),
  trades: many(trades),
  positions: many(positions),
  deposits: many(deposits),
  withdrawals: many(withdrawals),
  backtestResults: many(backtestResults),
  derivConnection: one(derivConnections),
}));

export const strategiesRelations = relations(strategies, ({ one, many }) => ({
  user: one(users, {
    fields: [strategies.userId],
    references: [users.id],
  }),
  trades: many(trades),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  user: one(users, {
    fields: [trades.userId],
    references: [users.id],
  }),
  strategy: one(strategies, {
    fields: [trades.strategyId],
    references: [strategies.id],
  }),
}));

export const positionsRelations = relations(positions, ({ one }) => ({
  user: one(users, {
    fields: [positions.userId],
    references: [users.id],
  }),
}));

export const depositsRelations = relations(deposits, ({ one }) => ({
  user: one(users, {
    fields: [deposits.userId],
    references: [users.id],
  }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, {
    fields: [withdrawals.userId],
    references: [users.id],
  }),
}));

export const backtestResultsRelations = relations(backtestResults, ({ one }) => ({
  user: one(users, {
    fields: [backtestResults.userId],
    references: [users.id],
  }),
}));

export const derivConnectionsRelations = relations(derivConnections, ({ one }) => ({
  user: one(users, {
    fields: [derivConnections.userId],
    references: [users.id],
  }),
}));

export const tradeAuditLogsRelations = relations(tradeAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [tradeAuditLogs.userId],
    references: [users.id],
  }),
}));

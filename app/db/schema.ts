import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  bigint,
  json,
  boolean,
  int,
} from "drizzle-orm/mysql-core";

// ── Users ──────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Trading-specific fields
  demoBalance: decimal("demo_balance", { precision: 18, scale: 8 }).default("10000.00").notNull(),
  realBalance: decimal("real_balance", { precision: 18, scale: 8 }).default("0.00").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  tradingMode: mysqlEnum("trading_mode", ["demo", "real"]).default("demo").notNull(),
  riskAcknowledged: boolean("risk_acknowledged").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Strategies (Bot Configurations) ────────────────────────────────
export const strategies = mysqlTable("strategies", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  strategyType: mysqlEnum("strategy_type", ["grid", "martingale", "ai_signals", "custom"]).default("grid").notNull(),
  assetSymbol: varchar("asset_symbol", { length: 20 }).notNull(),
  entryConditions: json("entry_conditions").$type<{
    indicator: string;
    operator: string;
    value: number;
  }[]>(),
  exitConditions: json("exit_conditions").$type<{
    type: string;
    value: number;
  }[]>(),
  tradeSize: decimal("trade_size", { precision: 18, scale: 8 }).default("0.01").notNull(),
  maxDailyLoss: decimal("max_daily_loss", { precision: 18, scale: 8 }).default("100.00").notNull(),
  takeProfit: decimal("take_profit", { precision: 18, scale: 8 }).default("10.00"),
  stopLoss: decimal("stop_loss", { precision: 18, scale: 8 }).default("5.00"),
  isActive: boolean("is_active").default(false).notNull(),
  status: mysqlEnum("status", ["running", "stopped", "error", "paused"]).default("stopped").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = typeof strategies.$inferInsert;

// ── Trades ─────────────────────────────────────────────────────────
export const trades = mysqlTable("trades", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  strategyId: bigint("strategy_id", { mode: "number", unsigned: true }),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  direction: mysqlEnum("direction", ["buy", "sell"]).notNull(),
  entryPrice: decimal("entry_price", { precision: 18, scale: 8 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 18, scale: 8 }),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  pnl: decimal("pnl", { precision: 18, scale: 8 }).default("0.00"),
  status: mysqlEnum("status", ["open", "closed", "pending", "cancelled"]).default("open").notNull(),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = typeof trades.$inferInsert;

// ── Positions ──────────────────────────────────────────────────────
export const positions = mysqlTable("positions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  avgEntryPrice: decimal("avg_entry_price", { precision: 18, scale: 8 }).notNull(),
  currentPrice: decimal("current_price", { precision: 18, scale: 8 }),
  unrealizedPnl: decimal("unrealized_pnl", { precision: 18, scale: 8 }).default("0.00"),
  side: mysqlEnum("side", ["long", "short"]).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export type Position = typeof positions.$inferSelect;
export type InsertPosition = typeof positions.$inferInsert;

// ── Deposits ───────────────────────────────────────────────────────
export const deposits = mysqlTable("deposits", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["bank_transfer", "credit_card", "crypto", "paypal", "skrill"]).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = typeof deposits.$inferInsert;

// ── Withdrawals ────────────────────────────────────────────────────
export const withdrawals = mysqlTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["bank_transfer", "crypto", "paypal", "skrill"]).notNull(),
  destinationAddress: varchar("destination_address", { length: 500 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = typeof withdrawals.$inferInsert;

// ── Backtest Results ───────────────────────────────────────────────
export const backtestResults = mysqlTable("backtest_results", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  strategyId: bigint("strategy_id", { mode: "number", unsigned: true }),
  strategyName: varchar("strategy_name", { length: 255 }).notNull(),
  assetSymbol: varchar("asset_symbol", { length: 20 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPnl: decimal("total_pnl", { precision: 18, scale: 8 }).default("0.00"),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).default("0.00"),
  sharpeRatio: decimal("sharpe_ratio", { precision: 5, scale: 2 }).default("0.00"),
  maxDrawdown: decimal("max_drawdown", { precision: 5, scale: 2 }).default("0.00"),
  profitFactor: decimal("profit_factor", { precision: 5, scale: 2 }).default("0.00"),
  totalTrades: int("total_trades").default(0),
  avgTradeDuration: int("avg_trade_duration").default(0),
  report: json("report").$type<{
    equityCurve: { timestamp: string; value: number }[];
    monthlyBreakdown: { month: string; pnl: number; trades: number }[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BacktestResult = typeof backtestResults.$inferSelect;
export type InsertBacktestResult = typeof backtestResults.$inferInsert;

// ── Deriv Connections ──────────────────────────────────────────────
export const derivConnections = mysqlTable("deriv_connections", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().unique(),
  apiToken: varchar("api_token", { length: 500 }),
  appId: varchar("app_id", { length: 100 }),
  accountId: varchar("account_id", { length: 255 }),
  isDemo: boolean("is_demo").default(true).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type DerivConnection = typeof derivConnections.$inferSelect;
export type InsertDerivConnection = typeof derivConnections.$inferInsert;

// ── Trade Audit Logs ───────────────────────────────────────────────
export const tradeAuditLogs = mysqlTable("trade_audit_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  strategyId: bigint("strategy_id", { mode: "number", unsigned: true }),
  tradeId: bigint("trade_id", { mode: "number", unsigned: true }),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  direction: mysqlEnum("direction", ["buy", "sell"]).notNull(),
  entryPrice: decimal("entry_price", { precision: 18, scale: 8 }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  environment: mysqlEnum("environment", ["demo", "real"]).notNull(),
  status: mysqlEnum("status", ["executed", "confirmed", "failed", "cancelled"]).default("executed").notNull(),
  apiResponse: json("api_response").$type<Record<string, unknown>>(),
  clientIp: varchar("client_ip", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TradeAuditLog = typeof tradeAuditLogs.$inferSelect;
export type InsertTradeAuditLog = typeof tradeAuditLogs.$inferInsert;

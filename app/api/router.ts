import { authRouter } from "./auth-router";
import { tradingRouter } from "./trading-router";
import { walletRouter } from "./wallet-router";
import { analyticsRouter } from "./analytics-router";
import { backtestRouter } from "./backtest-router";
import { derivRouter } from "./deriv-router";
import { auditRouter } from "./audit-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  trading: tradingRouter,
  wallet: walletRouter,
  analytics: analyticsRouter,
  backtest: backtestRouter,
  deriv: derivRouter,
  audit: auditRouter,
});

export type AppRouter = typeof appRouter;

import { configureStore, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// ── Types ────────────────────────────────────────────────────────
interface Strategy {
  id: number;
  name: string;
  strategyType: string;
  assetSymbol: string;
  isActive: boolean;
  status: string;
  tradeSize: string;
  maxDailyLoss: string;
  takeProfit: string | null;
  stopLoss: string | null;
  createdAt: Date | string;
}

interface Trade {
  id: number;
  symbol: string;
  direction: string;
  entryPrice: string;
  exitPrice: string | null;
  pnl: string;
  status: string;
  openedAt: Date | string;
  closedAt: Date | string | null;
}

interface Position {
  id: number;
  symbol: string;
  quantity: string;
  avgEntryPrice: string;
  currentPrice: string | null;
  unrealizedPnl: string;
  side: string;
  lastUpdated: Date | string;
}

interface Balance {
  demoBalance: string;
  realBalance: string;
  currency: string;
}

interface Transaction {
  id: number;
  type: "deposit" | "withdrawal";
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: Date | string | null;
}

interface PerformanceMetrics {
  totalTrades: number;
  winTrades: number;
  winRate: string;
  totalPnl: string;
  avgPnl: string;
  openPositions: number;
  activeStrategies: number;
  strategyBreakdown: Array<{
    strategyName: string;
    strategyId: number | null;
    totalTrades: number;
    totalPnl: string;
    avgPnl: string;
  }>;
}

interface AppState {
  strategies: Strategy[];
  trades: Trade[];
  positions: Position[];
  balance: Balance;
  transactions: Transaction[];
  performance: PerformanceMetrics | null;
  equityCurve: Array<{ timestamp: string; value: number }>;
  loading: {
    strategies: boolean;
    trades: boolean;
    positions: boolean;
    balance: boolean;
    transactions: boolean;
    performance: boolean;
  };
  error: string | null;
}

const initialState: AppState = {
  strategies: [],
  trades: [],
  positions: [],
  balance: { demoBalance: "10000.00", realBalance: "0.00", currency: "USD" },
  transactions: [],
  performance: null,
  equityCurve: [],
  loading: {
    strategies: false,
    trades: false,
    positions: false,
    balance: false,
    transactions: false,
    performance: false,
  },
  error: null,
};

// ── Slice ────────────────────────────────────────────────────────
const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setLoading: (
      state,
      action: PayloadAction<{ key: keyof AppState["loading"]; value: boolean }>
    ) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    setStrategies: (state, action: PayloadAction<Strategy[]>) => {
      state.strategies = action.payload;
    },
    setTrades: (state, action: PayloadAction<Trade[]>) => {
      state.trades = action.payload;
    },
    setPositions: (state, action: PayloadAction<Position[]>) => {
      state.positions = action.payload;
    },
    setBalance: (state, action: PayloadAction<Balance>) => {
      state.balance = action.payload;
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    setPerformance: (state, action: PayloadAction<PerformanceMetrics | null>) => {
      state.performance = action.payload;
    },
    setEquityCurve: (
      state,
      action: PayloadAction<Array<{ timestamp: string; value: number }>>
    ) => {
      state.equityCurve = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateStrategyStatus: (
      state,
      action: PayloadAction<{ id: number; isActive: boolean; status: string }>
    ) => {
      const idx = state.strategies.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.strategies[idx].isActive = action.payload.isActive;
        state.strategies[idx].status = action.payload.status;
      }
    },
    addTrade: (state, action: PayloadAction<Trade>) => {
      state.trades.unshift(action.payload);
    },
  },
});

export const {
  setLoading,
  setStrategies,
  setTrades,
  setPositions,
  setBalance,
  setTransactions,
  setPerformance,
  setEquityCurve,
  setError,
  updateStrategyStatus,
  addTrade,
} = appSlice.actions;

// ── Store ────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

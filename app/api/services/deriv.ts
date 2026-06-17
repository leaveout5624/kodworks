/**
 * Deriv WebSocket Service
 * Handles real-time price ticks and order execution via Deriv's WebSocket API.
 * Supports both DEMO and REAL trading environments.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const WebSocketImpl = require('ws') as {
  new(url: string): {
    on(event: string, callback: (...args: unknown[]) => void): void;
    send(data: string): void;
    close(): void;
    readyState: number;
  };
};

interface DerivConfig {
  appId: string;
  apiToken?: string;
  accountId?: string;
  environment?: 'demo' | 'real';
}

type DerivEventCallback = (data: Record<string, unknown>) => void;

export class DerivService {
  private ws: ReturnType<typeof WebSocketImpl.prototype.on> | null = null;
  private callbacks: Map<string, DerivEventCallback[]> = new Map();
  private requestMap: Map<number, (data: Record<string, unknown>) => void> = new Map();
  private reqId = 1;
  private reconnectAttempts = 0;
  private maxReconnects = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isConnected = false;
  private isDestroyed = false;
  private currentEnvironment: 'demo' | 'real';
  private config: DerivConfig;

  constructor(config: DerivConfig) {
    this.config = config;
    this.currentEnvironment = config.environment ?? 'demo';
  }

  get environment(): 'demo' | 'real' {
    return this.currentEnvironment;
  }

  setEnvironment(env: 'demo' | 'real'): void {
    if (this.currentEnvironment !== env) {
      this.currentEnvironment = env;
      if (this.isConnected) {
        this.disconnect();
        this.connect().catch(() => {});
      }
    }
  }

  getWebSocketUrl(): string {
    const baseUrl = 'wss://ws.derivws.com/websockets/v3';
    return `${baseUrl}?app_id=${this.config.appId}&l=EN&brand=deriv`;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isDestroyed) {
        reject(new Error('Service destroyed'));
        return;
      }

      const url = this.getWebSocketUrl();
      const ws = new WebSocketImpl(url);
      this.ws = ws as unknown as typeof this.ws;

      ws.on('open', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected', { environment: this.currentEnvironment });
        this.startPing();
        resolve();
      });

      ws.on('message', (...args: unknown[]) => {
        try {
          const data = args[0] as { toString(): string };
          const parsed = JSON.parse(data.toString()) as Record<string, unknown> & { req_id?: number };
          this.handleMessage(parsed);
        } catch {
          // ignore parse errors
        }
      });

      ws.on('close', () => {
        this.isConnected = false;
        this.stopPing();
        this.emit('disconnected', {});
        this.scheduleReconnect();
      });

      ws.on('error', (...args: unknown[]) => {
        const err = args[0] as { message: string };
        this.emit('error', { message: err.message });
        reject(err);
      });
    });
  }

  private handleMessage(data: Record<string, unknown> & { req_id?: number }): void {
    if (data.req_id && this.requestMap.has(data.req_id)) {
      const resolver = this.requestMap.get(data.req_id)!;
      resolver(data);
      this.requestMap.delete(data.req_id);
      return;
    }

    if (data.tick) this.emit('tick', data.tick as Record<string, unknown>);
    if (data.proposal) this.emit('proposal', data.proposal as Record<string, unknown>);
    if (data.buy) this.emit('buy', data.buy as Record<string, unknown>);
    if (data.sell) this.emit('sell', data.sell as Record<string, unknown>);
    if (data.error) this.emit('error', data.error as Record<string, unknown>);
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      this.sendRaw({ ping: 1 });
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnects || this.isDestroyed) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {});
    }, delay);
  }

  private sendRaw(data: Record<string, unknown>): void {
    if (this.ws) {
      const ws = this.ws as unknown as { readyState: number; send: (data: string) => void };
      if (ws.readyState === 1) {
        ws.send(JSON.stringify(data));
      }
    }
  }

  send(method: string, params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const reqId = this.reqId++;
      this.requestMap.set(reqId, resolve);
      this.sendRaw({ [method]: 1, ...params, req_id: reqId });
      setTimeout(() => {
        if (this.requestMap.has(reqId)) {
          this.requestMap.delete(reqId);
          reject(new Error(`Request ${reqId} timed out`));
        }
      }, 10000);
    });
  }

  subscribeTicks(symbol: string): void {
    this.sendRaw({ ticks: symbol, subscribe: 1 });
  }

  unsubscribeTicks(symbol: string): void {
    this.sendRaw({ ticks: symbol, subscribe: 0 });
  }

  async authorize(): Promise<Record<string, unknown>> {
    if (!this.config.apiToken) throw new Error('No API token configured');
    return this.send('authorize', { authorize: this.config.apiToken });
  }

  async sendBuyRequest(proposal: Record<string, unknown>): Promise<Record<string, unknown>> {
    const result = await this.send('buy', proposal);
    this.emit('order_executed', {
      ...result,
      _environment: this.currentEnvironment,
      _timestamp: new Date().toISOString(),
    });
    return result;
  }

  async sendSellRequest(contractId: string, price?: number): Promise<Record<string, unknown>> {
    const params: Record<string, unknown> = { sell: contractId };
    if (price !== undefined) params.price = price;
    const result = await this.send('sell', params);
    this.emit('sell_executed', {
      ...result,
      _environment: this.currentEnvironment,
      _timestamp: new Date().toISOString(),
    });
    return result;
  }

  on(event: string, callback: DerivEventCallback): () => void {
    const existing = this.callbacks.get(event) ?? [];
    existing.push(callback);
    this.callbacks.set(event, existing);
    return () => {
      const updated = (this.callbacks.get(event) ?? []).filter((cb) => cb !== callback);
      this.callbacks.set(event, updated);
    };
  }

  private emit(event: string, data: Record<string, unknown>): void {
    const cbs = this.callbacks.get(event) ?? [];
    cbs.forEach((cb) => {
      try { cb(data); } catch { /* ignore */ }
    });
  }

  disconnect(): void {
    this.isDestroyed = true;
    this.stopPing();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      const ws = this.ws as unknown as { close: () => void };
      ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

const serviceMap = new Map<string, DerivService>();

export function getDerivService(config?: DerivConfig & { userId?: string }): DerivService {
  const key = config?.userId ?? 'default';
  if (!serviceMap.has(key) && config) {
    serviceMap.set(key, new DerivService(config));
  }
  const svc = serviceMap.get(key);
  if (!svc) {
    throw new Error('DerivService not initialized');
  }
  return svc;
}

export function setUserEnvironment(userId: string, env: 'demo' | 'real'): DerivService {
  const svc = serviceMap.get(userId);
  if (svc) {
    svc.setEnvironment(env);
    return svc;
  }
  throw new Error(`No DerivService found for user ${userId}`);
}

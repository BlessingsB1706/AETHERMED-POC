/**
 * Server health client. The Server Health page only uses this interface.
 * Demo mode simulates metrics; with VITE_DEMO_MODE=false it calls GET {VITE_API_URL}/health,
 * which should return HealthSnapshot (and must require an admin session server-side).
 */
export type ServiceState = 'operational' | 'degraded' | 'down';

export interface ServiceHealth {
  name: string;
  description: string;
  state: ServiceState;
  latencyMs: number;
  uptime30d: number;
}

export interface HealthSnapshot {
  checkedAt: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  requestsPerMin: number;
  errorRate: number;
  p95LatencyMs: number;
  uptimeSeconds: number;
  version: string;
  region: string;
  services: ServiceHealth[];
}

export interface HealthClient {
  check(): Promise<HealthSnapshot>;
}

const SERVICES: Omit<ServiceHealth, 'latencyMs' | 'state'>[] = [
  { name: 'API gateway', description: 'Public REST API', uptime30d: 99.98 },
  { name: 'Auth', description: 'Sign-in, sessions, MFA', uptime30d: 99.99 },
  { name: 'Database', description: 'Postgres primary + replica', uptime30d: 99.97 },
  { name: 'AI inference', description: 'Aether AI + diagnostic models', uptime30d: 99.62 },
  { name: 'File storage', description: 'Scans, datasets (encrypted)', uptime30d: 99.99 },
  { name: 'Email & notifications', description: 'Transactional mail, push', uptime30d: 99.9 },
];
const BASE_LATENCY = [48, 35, 12, 420, 60, 140];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const drift = (v: number, step: number, lo: number, hi: number) => clamp(v + (Math.random() - 0.5) * step, lo, hi);

let state = { cpu: 42, memory: 61, disk: 58, network: 30, rpm: 1240, err: 0.3, p95: 180 };
const bootedAt = Date.now() - 1000 * 60 * 60 * 24 * 12.4;

export const mockHealthClient: HealthClient = {
  async check() {
    await new Promise((r) => setTimeout(r, 250));
    state = {
      cpu: drift(state.cpu, 14, 15, 92),
      memory: drift(state.memory, 4, 40, 88),
      disk: drift(state.disk, 0.4, 55, 62),
      network: drift(state.network, 12, 8, 85),
      rpm: Math.round(drift(state.rpm, 180, 600, 2400)),
      err: Number(drift(state.err, 0.2, 0.05, 2.5).toFixed(2)),
      p95: Math.round(drift(state.p95, 40, 110, 420)),
    };
    return {
      checkedAt: new Date().toISOString(),
      cpu: Math.round(state.cpu),
      memory: Math.round(state.memory),
      disk: Math.round(state.disk),
      network: Math.round(state.network),
      requestsPerMin: state.rpm,
      errorRate: state.err,
      p95LatencyMs: state.p95,
      uptimeSeconds: Math.round((Date.now() - bootedAt) / 1000),
      version: 'v0.1.0-demo',
      region: 'eu-west (demo)',
      services: SERVICES.map((s, i) => {
        const latencyMs = Math.round(BASE_LATENCY[i] * (0.8 + Math.random() * 0.5) * (i === 3 && state.cpu > 80 ? 2 : 1));
        const st: ServiceState = i === 3 && latencyMs > 700 ? 'degraded' : 'operational';
        return { ...s, latencyMs, state: st };
      }),
    };
  },
};

export const httpHealthClient: HealthClient = {
  async check() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/health`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Health endpoint returned ${res.status}`);
    return (await res.json()) as HealthSnapshot;
  },
};

export const healthClient: HealthClient = import.meta.env.VITE_DEMO_MODE === 'false' ? httpHealthClient : mockHealthClient;

export function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

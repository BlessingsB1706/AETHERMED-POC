import { describe, expect, it } from 'vitest';
import { formatUptime, mockHealthClient } from './health';

describe('health client', () => {
  it('returns bounded metrics for every service', async () => {
    const s = await mockHealthClient.check();
    expect(s.services).toHaveLength(6);
    for (const v of [s.cpu, s.memory, s.disk, s.network]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it('formats uptime', () => {
    expect(formatUptime(90061)).toBe('1d 1h 1m');
  });
});

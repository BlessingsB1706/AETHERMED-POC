import { describe, expect, it } from 'vitest';
import { mockAiClient } from './ai';

describe('mockAiClient', () => {
  it('answers known questions case-insensitively', async () => {
    const reply = await mockAiClient.reply(
      [{ id: '1', role: 'user', content: 'HOW DO I SIGN UP?' }],
      'public-demo',
    );
    expect(reply).toMatch(/Get Started/);
  });

  it('falls back with a safety pointer for unknown questions', async () => {
    const reply = await mockAiClient.reply([{ id: '1', role: 'user', content: 'random' }], 'public-demo');
    expect(reply).toMatch(/medical professional/);
  });
});

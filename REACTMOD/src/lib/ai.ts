/**
 * Aether AI client. The UI only talks to this interface, so swapping the mock for a real
 * backend (which holds the LLM key, applies safety rules and logs for audit) is a one-file change.
 * Never call an LLM provider directly from the browser: the key would be public.
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface AiClient {
  reply(history: ChatMessage[], context: 'public-demo' | 'patient' | 'professional'): Promise<string>;
}

const CANNED: Record<string, string> = {
  'what are the early signs of hypertension?':
    'Hypertension is often silent. Some people notice morning headaches, shortness of breath or nosebleeds, but these are non-specific. Regular blood pressure checks are the only reliable way to detect it.',
  'how does the ai diagnostic tool work?':
    'The diagnostic tool will combine symptoms, vitals and lab results to suggest likely findings with a confidence score. Every result is reviewed by a licensed professional before it reaches a patient.',
  'can you help me interpret an ecg scan?':
    'In the full platform you will be able to upload an ECG. Findings such as possible atrial fibrillation or ischemia are flagged for a clinician to confirm; the AI never issues a final diagnosis on its own.',
  'is this available for my phone?':
    'Yes. AetherMed works in any mobile browser, and an installable app is on the roadmap.',
  'what datasets do you use?':
    'Only de-identified data contributed under signed data-sharing agreements, with consent recorded for every record.',
  'how do i sign up?':
    'Close this chat and choose "Get Started" to pick your account type: patient, student, professional or institution.',
};

const FALLBACK =
  'Thanks for the question. Sign in to your dashboard for a fuller answer. For anything urgent, contact a medical professional or your local emergency number.';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockAiClient: AiClient = {
  async reply(history) {
    await sleep(900);
    const last = [...history].reverse().find((m) => m.role === 'user');
    return (last && CANNED[last.content.trim().toLowerCase()]) || FALLBACK;
  },
};

/** Real client: POST to our own backend, which proxies the model. */
export const httpAiClient: AiClient = {
  async reply(history, context) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/ai/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context, messages: history.map(({ role, content }) => ({ role, content })) }),
    });
    if (!res.ok) throw new Error(`AI service error ${res.status}`);
    const data = (await res.json()) as { reply: string };
    return data.reply;
  },
};

export const aiClient: AiClient = import.meta.env.VITE_DEMO_MODE === 'false' ? httpAiClient : mockAiClient;

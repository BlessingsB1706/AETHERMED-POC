import { Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { aiClient, type ChatMessage } from '../lib/ai';

interface Props {
  context: 'public-demo' | 'patient' | 'professional';
  greeting: string;
  suggestions?: string[];
  /** Max user messages before asking to sign in (public demo only). */
  limit?: number;
}

let nextId = 0;
const uid = () => `m${++nextId}`;

/**
 * Shared chat UI. Messages are rendered as React text nodes, so user input is always escaped
 * (the POC injected raw input with insertAdjacentHTML, which was an XSS hole).
 */
export function ChatPanel({ context, greeting, suggestions = [], limit }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: uid(), role: 'assistant', content: greeting }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const used = messages.filter((m) => m.role === 'user').length;
  const locked = limit !== undefined && used >= limit;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy || locked) return;
    const history = [...messages, { id: uid(), role: 'user' as const, content }];
    setMessages(history);
    setInput('');
    setBusy(true);
    setError(null);
    try {
      const reply = await aiClient.reply(history, context);
      setMessages((m) => [...m, { id: uid(), role: 'assistant', content: reply }]);
    } catch {
      setError('Aether AI is unavailable right now. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5" aria-live="polite">
        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-none bg-medical-600 px-4 py-2.5 text-sm text-white">{m.content}</p>
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-3">
              <img src="/aether_ai.png" alt="" className="mt-1 h-8 w-8 shrink-0 rounded-full border border-slate-200 bg-white object-cover" />
              <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-none border border-slate-100 bg-white p-3.5 text-sm text-slate-700 shadow-sm">{m.content}</p>
            </div>
          ),
        )}
        {busy && (
          <div className="flex items-center gap-1 pl-11" aria-label="Aether AI is typing">
            {[0, 1, 2].map((i) => <span key={i} className="typing-dot h-2 w-2 rounded-full bg-slate-300" />)}
          </div>
        )}
        {error && <p className="text-center text-xs text-red-600">{error}</p>}
        <div ref={endRef} />
      </div>

      {suggestions.length > 0 && !locked && used === 0 && (
        <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-4 py-3">
          {suggestions.map((s) => (
            <button key={s} onClick={() => void send(s)} disabled={busy} className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 hover:border-medical-200 hover:bg-medical-50 hover:text-medical-600">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-slate-100 bg-white p-4">
        {locked ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <p className="text-sm font-semibold text-slate-800">Demo limit reached.</p>
            <Link to="/login" className="rounded-full bg-medical-600 px-6 py-2 text-sm font-semibold text-white hover:bg-medical-700">Sign in to continue</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="relative flex items-center">
            <label htmlFor={`chat-${context}`} className="sr-only">Message Aether AI</label>
            <input
              id={`chat-${context}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={2000}
              placeholder="Type your medical question..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-3.5 pl-5 pr-12 text-sm outline-none focus:border-medical-400 focus:ring-1 focus:ring-medical-400"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-medical-600 text-white hover:bg-medical-700 disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
        <p className="mt-2 text-center text-[11px] text-slate-400">
          {limit !== undefined && !locked && `${limit - used} demo messages left · `}
          Aether AI can be wrong and does not replace a clinician.
        </p>
      </div>
    </div>
  );
}

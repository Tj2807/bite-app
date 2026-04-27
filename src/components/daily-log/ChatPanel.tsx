'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChatMessage, LoggedMealCard } from '@/types';

interface ChatPanelProps {
  onMealLogged: () => void;
}

export function ChatPanel({ onMealLogged }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Good morning. Taking a moment before your first meal. What are you planning to nourish yourself with today?",
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to get response');
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        logged_meal: data.logged_meal ?? null,
        created_at: new Date().toISOString(),
      }]);

      if (data.logged_meal) onMealLogged();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ ${msg}`,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, onMealLogged]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Chat Header ──────────────────────────────────────────────────── */}
      <div
        className="px-8 py-5 flex items-center gap-4 shrink-0"
        style={{
          borderBottom: '1px solid rgba(193,200,194,0.2)',
          backgroundColor: 'var(--color-surface-bright)',
        }}
      >
        <div
          className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
          style={{ border: '2px solid var(--color-primary-fixed)', backgroundColor: '#F5F1E6' }}
        >
          <Image src="/logo.png" alt="Bite" width={48} height={48} className="w-full h-full object-cover p-1" />
        </div>
        <div>
          <h2 className="text-headline-sm" style={{ color: 'var(--color-primary)' }}>Bite Assistant</h2>
          <p className="text-label-sm flex items-center gap-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--color-secondary-fixed)' }} />
            Mindful guide active
          </p>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin"
        style={{ background: 'linear-gradient(to bottom, var(--color-surface), rgba(244,244,240,0.3))' }}
      >
        {messages.map(msg => (
          <div key={msg.id} className="animate-chat">
            {msg.role === 'assistant'
              ? <AssistantBubble msg={msg} />
              : <UserBubble content={msg.content} />}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-4 max-w-[85%] animate-chat">
            <AvatarMini />
            <div
              className="py-4 px-6 rounded-2xl rounded-tl-sm flex items-center gap-2"
              style={{ backgroundColor: 'rgba(239,238,234,0.5)', color: 'var(--color-on-surface-variant)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full dot-1" style={{ backgroundColor: 'rgba(21,53,38,0.4)' }} />
              <span className="w-1.5 h-1.5 rounded-full dot-2" style={{ backgroundColor: 'rgba(21,53,38,0.6)' }} />
              <span className="w-1.5 h-1.5 rounded-full dot-3" style={{ backgroundColor: 'rgba(21,53,38,0.8)' }} />
              <span className="text-label-sm ml-2" style={{ color: 'rgba(21,53,38,0.7)' }}>Bite is thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div
        className="p-6 shrink-0"
        style={{
          borderTop: '1px solid rgba(193,200,194,0.2)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Log a meal or share a thought…"
            className="w-full rounded-full py-4 pl-6 pr-14 text-body-md transition-all"
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              border: 'none',
              color: 'var(--color-on-surface)',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="absolute right-2 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              boxShadow: '0 2px 8px rgba(44,76,59,0.15)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AvatarMini() {
  return (
    <div
      className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden"
      style={{ backgroundColor: 'var(--color-primary-fixed)' }}
    >
      <Image src="/logo.png" alt="B" width={32} height={32} className="w-full h-full object-cover p-0.5 rounded-full" />
    </div>
  );
}

function AssistantBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex gap-4 max-w-[85%]">
      <AvatarMini />
      <div className="space-y-2">
        <div
          className="py-4 px-6 rounded-2xl rounded-tl-sm text-body-md"
          style={{
            backgroundColor: 'var(--color-surface-container)',
            color: 'var(--color-on-surface)',
            boxShadow: '0 2px 8px rgba(44,76,59,0.03)',
            border: '1px solid rgba(193,200,194,0.2)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {msg.content}
        </div>
        {msg.logged_meal && <LoggedMealChip meal={msg.logged_meal} />}
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex gap-4 max-w-[85%] ml-auto justify-end">
      <div
        className="py-4 px-6 rounded-2xl rounded-tr-sm text-body-md"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          boxShadow: '0 2px 8px rgba(44,76,59,0.08)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {content}
      </div>
    </div>
  );
}

function LoggedMealChip({ meal }: { meal: LoggedMealCard }) {
  const n = meal.nutrition;
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid rgba(193,200,194,0.3)',
      }}
    >
      <span
        className="material-symbols-outlined mt-0.5 text-sm flex-shrink-0"
        style={{ color: 'var(--color-secondary)', fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
      >
        check_circle
      </span>
      <div className="min-w-0">
        <p className="text-body-md font-medium truncate" style={{ color: 'var(--color-on-surface)' }}>
          {meal.name}
        </p>
        <p className="text-label-sm mt-0.5" style={{ color: 'var(--color-outline)' }}>
          ~{meal.calories} kcal
          {n && ` · ${n.protein_g?.toFixed(0)}g P · ${n.carbs_g?.toFixed(0)}g C · ${n.fat_g?.toFixed(0)}g F`}
        </p>
      </div>
    </div>
  );
}

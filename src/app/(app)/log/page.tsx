'use client';

import { useState } from 'react';
import { ChatPanel }  from '@/components/daily-log/ChatPanel';
import { TodayPanel } from '@/components/daily-log/TodayPanel';

type MobileTab = 'chat' | 'today';

export default function DailyLogPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileTab, setMobileTab] = useState<MobileTab>('chat');

  return (
    <div className="flex h-full w-full">

      {/* ── Chat Panel ──────────────────────────────────────────────────────
          Mobile: full width, hidden when "today" tab is active
          Desktop: left 55%, always visible                                 */}
      <div className={[
        'flex-col h-full',
        'md:flex md:flex-1 md:max-w-[55%] md:border-r md:border-bite-outline-light',
        mobileTab === 'chat' ? 'flex flex-1' : 'hidden',
      ].join(' ')}>
        <ChatPanel
          onMealLogged={() => setRefreshKey(k => k + 1)}
          mobileTab={mobileTab}
          onTabChange={setMobileTab}
        />
      </div>

      {/* ── Today Panel ─────────────────────────────────────────────────────
          Mobile: full width, visible only when "today" tab is active,
                  prefixed with a mobile header that holds the toggle
          Desktop: right 45%, always visible (mobile header hidden)         */}
      <div className={[
        'flex-col h-full overflow-hidden',
        'md:flex md:flex-1',
        mobileTab === 'today' ? 'flex flex-1' : 'hidden',
      ].join(' ')}>

        {/* Mobile-only header row for the Today view */}
        <div
          className="md:hidden px-4 py-4 flex items-center gap-3 shrink-0"
          style={{
            borderBottom: '1px solid rgba(193,200,194,0.2)',
            backgroundColor: 'var(--color-surface-bright)',
          }}
        >
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
            style={{ border: '2px solid var(--color-primary-fixed)', backgroundColor: '#F5F1E6' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Bite" width={40} height={40} className="w-full h-full object-cover p-1" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-headline-sm" style={{ color: 'var(--color-primary)' }}>Bite Assistant</h2>
            <p className="text-label-sm flex items-center gap-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--color-secondary-fixed)' }} />
              Mindful guide active
            </p>
          </div>
          <TabToggle tab={mobileTab} onTabChange={setMobileTab} />
        </div>

        <div className="flex-1 overflow-hidden">
          <TodayPanel refreshKey={refreshKey} />
        </div>
      </div>

    </div>
  );
}

// ── Shared toggle pill ────────────────────────────────────────────────────────

export function TabToggle({ tab, onTabChange }: { tab: MobileTab; onTabChange: (t: MobileTab) => void }) {
  return (
    <div
      className="flex items-center rounded-full p-1 flex-shrink-0"
      style={{ backgroundColor: 'var(--color-surface-container-high)' }}
    >
      {(['chat', 'today'] as MobileTab[]).map(t => (
        <button
          key={t}
          onClick={() => onTabChange(t)}
          className="py-1.5 px-4 rounded-full font-medium capitalize transition-all duration-200"
          style={{
            fontSize: '11px',
            backgroundColor: tab === t ? 'var(--color-primary)' : 'transparent',
            color: tab === t ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
            boxShadow: tab === t ? '0 1px 3px rgba(44,76,59,0.2)' : 'none',
          }}
        >
          {t === 'chat' ? 'Chat' : 'Today'}
        </button>
      ))}
    </div>
  );
}

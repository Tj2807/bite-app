'use client';

import { useState } from 'react';
import { ChatPanel }  from '@/components/daily-log/ChatPanel';
import { TodayPanel } from '@/components/daily-log/TodayPanel';

export default function DailyLogPage() {
  // Incrementing this key triggers TodayPanel to re-fetch meals
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex h-full w-full">
      {/* ── Chat panel ───────────────────────────────────────────────────────── */}
      {/* Mobile: full width. Desktop: left 55% */}
      <div className="flex-1 md:max-w-[55%] md:border-r md:border-bite-outline-light h-full">
        <ChatPanel onMealLogged={() => setRefreshKey(k => k + 1)} />
      </div>

      {/* ── Today's tracker panel ─────────────────────────────────────────── */}
      {/* Hidden on mobile (accessible via bottom nav future extension),
          shown on desktop as right panel */}
      <div className="hidden md:block md:flex-1 h-full overflow-hidden">
        <TodayPanel refreshKey={refreshKey} />
      </div>
    </div>
  );
}

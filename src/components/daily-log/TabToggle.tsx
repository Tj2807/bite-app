'use client';

export type MobileTab = 'chat' | 'today';

export function TabToggle({
  tab,
  onTabChange,
}: {
  tab: MobileTab;
  onTabChange: (t: MobileTab) => void;
}) {
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

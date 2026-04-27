'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Using Material Symbols (loaded via <head> in layout.tsx)
const navItems = [
  { href: '/',         icon: 'menu_book',   label: 'Log'      },
  { href: '/trends',   icon: 'trending_up', label: 'Trends'   },
  { href: '/settings', icon: 'settings',    label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col h-screen py-8 space-y-4 items-center z-20 transition-all duration-300"
      style={{
        width: '72px',
        backgroundColor: 'var(--color-surface-bright)',
        borderRight: '1px solid var(--color-tertiary-fixed)',
      }}
    >
      {/* Logo mark */}
      <div className="flex justify-center items-center mb-2">
        <Image
          src="/logo.png"
          alt="Bite"
          width={36}
          height={36}
          className="rounded-lg object-contain"
          title="Bite"
        />
      </div>

      {/* Nav icons */}
      <nav className="flex flex-col flex-1 space-y-2 w-full px-3">
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className="flex justify-center items-center p-3 rounded-lg transition-all duration-200 hover:translate-x-0.5"
              style={{
                backgroundColor: active ? 'var(--color-tertiary-fixed)' : 'transparent',
                color: active ? 'var(--color-primary)' : '#78716c',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-tertiary-fixed)';
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '24px',
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {icon}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe"
      style={{
        backgroundColor: 'var(--color-surface-bright)',
        borderTop: '1px solid var(--color-tertiary-fixed)',
        boxShadow: '0 -4px 12px rgba(44,76,59,0.05)',
      }}
    >
      {navItems.map(({ href, icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center px-5 py-1 rounded-2xl transition-all duration-150 scale-95"
            style={{
              color: active ? 'var(--color-primary)' : '#a8a29e',
              backgroundColor: active ? 'var(--color-tertiary-fixed)' : 'transparent',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '24px',
                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {icon}
            </span>
            <span
              className="text-label-sm mt-1 uppercase tracking-widest"
              style={{ fontSize: '11px' }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

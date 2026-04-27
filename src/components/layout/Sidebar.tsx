'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Using Material Symbols (loaded via <head> in layout.tsx)
const navItems = [
  { href: '/log',      icon: 'menu_book',   label: 'Chat'   },
  { href: '/trends',   icon: 'trending_up', label: 'Trends' },
  { href: '/settings', icon: 'settings',    label: 'Goals'  },
];

// ── Tooltip wrapper ───────────────────────────────────────────────────────────
function TooltipItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group flex justify-center">
      {children}
      {/* Tooltip bubble */}
      <span
        className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2
                   whitespace-nowrap rounded-md px-2.5 py-1.5
                   opacity-0 group-hover:opacity-100
                   transition-opacity duration-150 z-50"
        style={{
          backgroundColor: '#2C4C3B',
          color: '#FAF9F5',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.01em',
          boxShadow: '0 4px 12px rgba(44,76,59,0.18)',
        }}
      >
        {label}
        {/* Arrow */}
        <span
          className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
          style={{ borderRightColor: '#2C4C3B' }}
        />
      </span>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    // Clear Supabase session (no-op for guests) + clear guest cookie
    await Promise.all([
      supabase.auth.signOut(),
      fetch('/api/auth/signout', { method: 'POST' }),
    ]);
    router.push('/');
  };

  return (
    <aside
      className="hidden md:flex flex-col h-screen py-8 space-y-4 items-center z-20 transition-all duration-300"
      style={{
        width: '72px',
        backgroundColor: 'var(--color-surface-bright)',
        borderRight: '1px solid var(--color-tertiary-fixed)',
      }}
    >
      {/* Logo mark — plain img avoids Next.js Image optimisation edge-cases */}
      <div className="flex justify-center items-center mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Bite"
          width={36}
          height={36}
          className="rounded-lg object-contain"
        />
      </div>

      {/* Nav icons */}
      <nav className="flex flex-col flex-1 space-y-2 w-full px-3">
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <TooltipItem key={href} label={label}>
              <Link
                href={href}
                className="flex justify-center items-center p-3 rounded-lg transition-all duration-200 hover:translate-x-0.5 w-full"
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
            </TooltipItem>
          );
        })}
      </nav>

      {/* Logout */}
      <TooltipItem label="Log out">
        <button
          onClick={handleLogout}
          className="flex justify-center items-center p-3 rounded-lg transition-all duration-200 mx-3 mb-2 w-full"
          style={{ color: '#a8a29e' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-tertiary-fixed)';
            (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#a8a29e';
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 0" }}>
            logout
          </span>
        </button>
      </TooltipItem>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    // Clear Supabase session (no-op for guests) + clear guest cookie
    await Promise.all([
      supabase.auth.signOut(),
      fetch('/api/auth/signout', { method: 'POST' }),
    ]);
    router.push('/');
  };

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
      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center px-5 py-1 rounded-2xl transition-all duration-150 scale-95"
        style={{ color: '#a8a29e' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 0" }}>
          logout
        </span>
        <span className="text-label-sm mt-1 uppercase tracking-widest" style={{ fontSize: '11px' }}>Out</span>
      </button>
    </nav>
  );
}

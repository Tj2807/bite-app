'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const router = useRouter();

  // If the user is already logged in, send them straight to the app
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/log');
    });
  }, [router]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div
      className="min-h-full flex flex-col antialiased selection:bg-[#d7e5bb] selection:text-[#5a6745]"
      style={{ backgroundColor: '#FAF9F5' }}
    >
      {/* ── Main hero ────────────────────────────────────────────────────── */}
      <main className="flex-grow flex flex-col justify-center items-center px-6 py-20 md:py-32">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center">

          {/* Logo card */}
          <div
            className="mb-14 md:mb-16 flex items-center justify-center rounded-3xl"
            style={{
              width: '192px',
              height: '192px',
              backgroundColor: '#F4F4F0',
              border: '1px solid rgba(193,200,194,0.35)',
              boxShadow: '0 8px 32px rgba(44,76,59,0.06)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Bite: Mindful Eating"
              width={140}
              height={140}
              className="object-contain"
            />
          </div>

          {/* Wordmark */}
          <h1
            className="mb-6 md:mb-8 tracking-wide font-medium"
            style={{
              fontFamily: 'var(--font-playfair), var(--font-serif), serif',
              fontSize: 'clamp(72px, 16vw, 120px)',
              lineHeight: 1.05,
              color: '#2C4C3B',
              letterSpacing: '-0.01em',
            }}
          >
            Bite
          </h1>

          {/* Tagline */}
          <p
            className="mb-14 md:mb-16 mx-auto"
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: 'clamp(16px, 2.5vw, 22px)',
              lineHeight: 1.65,
              fontWeight: 300,
              letterSpacing: '0.02em',
              color: '#5C5E5C',
              maxWidth: '480px',
            }}
          >
            Part guide, part coach, all nutritionist. Meet Bite.
          </p>

          {/* CTA — Google sign-in */}
          <button
            onClick={handleLogin}
            className="inline-flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            style={{
              backgroundColor: '#2C4C3B',
              color: '#FAF9F5',
              padding: '18px 48px',
              borderRadius: '9999px',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              boxShadow: '0 8px 24px rgba(44,76,59,0.18)',
              border: 'none',
            }}
          >
            {/* Google G icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#fff" fillOpacity=".9"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#fff" fillOpacity=".75"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#fff" fillOpacity=".6"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#fff" fillOpacity=".85"/>
            </svg>
            Login to meet Bite
          </button>
        </div>
      </main>

      {/* ── Footer credit ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-5 left-0 right-0 flex justify-center pointer-events-none select-none">
        <span
          className="flex items-center gap-1.5 italic uppercase"
          style={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '10px',
            letterSpacing: '0.09em',
            color: 'rgba(92,94,92,0.55)',
          }}
        >
          Made with&nbsp;
          <span
            className="material-symbols-outlined not-italic"
            style={{ fontSize: '11px', fontVariationSettings: "'FILL' 1", color: '#566342' }}
          >
            favorite
          </span>
          &nbsp;by Tejas
        </span>
      </div>
    </div>
  );
}

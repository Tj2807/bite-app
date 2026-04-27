import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
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
            <Image
              src="/logo.png"
              alt="Bite: Mindful Eating"
              width={140}
              height={140}
              className="object-contain"
              priority
            />
          </div>

          {/* Wordmark */}
          <h1
            className="mb-6 md:mb-8 tracking-wide font-medium"
            style={{
              fontFamily: '"Playfair Display", "Noto Serif", serif',
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

          {/* CTA button */}
          <Link
            href="/log"
            className="inline-block transition-all duration-300 hover:-translate-y-1"
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
              textDecoration: 'none',
            }}
            onMouseEnter={undefined}
          >
            Say hello to Bite
          </Link>
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

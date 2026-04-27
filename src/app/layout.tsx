import type { Metadata } from 'next';
import { Noto_Serif, Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';

// ── Fonts — self-hosted by Next.js at build time ──────────────────────────────
const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bite — Mindful Eating',
  description: 'Your AI-powered mindful nutrition coach',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full ${notoSerif.variable} ${plusJakartaSans.variable} ${playfairDisplay.variable}`}
    >
      <head>
        {/* Material Symbols for icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="h-full antialiased" style={{ backgroundColor: 'var(--color-background)' }}>
        {children}
      </body>
    </html>
  );
}

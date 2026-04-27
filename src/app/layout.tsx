import type { Metadata } from 'next';
import './globals.css';
import { Sidebar, BottomNav } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Bite — Mindful Eating',
  description: 'Your AI-powered mindful nutrition coach',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Material Symbols for icons — matching stitch design exactly */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="h-full flex antialiased" style={{ backgroundColor: 'var(--color-background)' }}>
        <Sidebar />
        <main className="flex-1 h-full overflow-hidden flex flex-col pb-16 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bite — Mindful Eating',
  description: 'Your AI-powered mindful nutrition coach',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
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

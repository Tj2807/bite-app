import { Sidebar, BottomNav } from '@/components/layout/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex">
      <Sidebar />
      <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

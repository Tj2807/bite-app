import { Sidebar, BottomNav } from './Sidebar';

/**
 * AppShell — wraps a page with the sidebar + bottom nav.
 * Used directly by pages that live outside the (app) route group
 * (e.g. /trends) so they still get the shared navigation.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden flex flex-col pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

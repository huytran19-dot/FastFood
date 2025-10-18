import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

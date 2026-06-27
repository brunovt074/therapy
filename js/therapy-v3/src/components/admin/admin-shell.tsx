"use client";
import { AdminSidebar } from "./admin-sidebar";
import { AdminBottomNav } from "./admin-bottom-nav";

interface AdminShellProps {
  children: React.ReactNode;
  userRole?: string;
  onLogout: () => void;
}

export function AdminShell({ children, userRole, onLogout }: AdminShellProps) {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar userRole={userRole} onLogout={onLogout} />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{children}</div>
      </main>
      <AdminBottomNav onLogout={onLogout} />
    </div>
  );
}

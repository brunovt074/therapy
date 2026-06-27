"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Ban,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Turnos", icon: Calendar },
  { href: "/admin/patients", label: "Pacientes", icon: Users },
  { href: "/admin/specialties", label: "Especialidades", icon: Stethoscope },
  { href: "/admin/blocked-slots", label: "Bloqueos", icon: Ban },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

interface AdminSidebarProps {
  userRole?: string;
  onLogout: () => void;
}

export function AdminSidebar({ userRole, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border-color)]">
      <div className="p-6">
        <h2 className="font-display text-xl text-[var(--text-emphasis)]">
          Therapy Admin
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">{userRole}</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-color)]">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-error)] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

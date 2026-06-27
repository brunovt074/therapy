"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as RadixDialog from "@radix-ui/react-dialog";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  MoreHorizontal,
  Ban,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Turnos", icon: Calendar },
  { href: "/admin/patients", label: "Pacientes", icon: Users },
  { href: "/admin/specialties", label: "Especialidades", icon: Stethoscope },
];

const secondaryNav = [
  { href: "/admin/blocked-slots", label: "Bloqueos", icon: Ban },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

interface AdminBottomNavProps {
  onLogout: () => void;
}

export function AdminBottomNav({ onLogout }: AdminBottomNavProps) {
  const pathname = usePathname();
  const secondaryActive = secondaryNav.some((i) => pathname === i.href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
      <div className="flex items-stretch">
        {primaryNav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-[56px] text-[10px] font-medium transition-colors",
                active
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <RadixDialog.Root>
          <RadixDialog.Trigger asChild>
            <button
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-[56px] text-[10px] font-medium transition-colors",
                secondaryActive
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              )}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span>Más</span>
            </button>
          </RadixDialog.Trigger>

          <RadixDialog.Portal>
            <RadixDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
            <RadixDialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] rounded-t-xl p-4 pb-8">
              <RadixDialog.Title className="sr-only">
                Más opciones
              </RadixDialog.Title>
              <div className="w-10 h-1 bg-[var(--border-color)] rounded-full mx-auto mb-5" />
              <div className="space-y-1">
                {secondaryNav.map((item) => (
                  <RadixDialog.Close asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </RadixDialog.Close>
                ))}
                <div className="border-t border-[var(--border-color-subtle)] my-2" />
                <RadixDialog.Close asChild>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--color-error)] transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                </RadixDialog.Close>
              </div>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        </RadixDialog.Root>
      </div>
    </nav>
  );
}

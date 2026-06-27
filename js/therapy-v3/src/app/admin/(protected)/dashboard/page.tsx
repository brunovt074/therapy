"use client";

import { useStats } from "@/hooks/use-stats";
import { Card } from "@/components/ui/card";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";

function statusLabel(s: string): string {
  switch (s) {
    case "pending":
      return "Pendiente";
    case "confirmed":
      return "Confirmado";
    case "cancelled":
      return "Cancelado";
    case "completed":
      return "Completado";
    case "no_show":
      return "No asistió";
    default:
      return s;
  }
}

function KpiCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-tertiary)]">{title}</p>
          <p className="text-2xl font-display text-[var(--text-emphasis)] mt-1">
            {value}
          </p>
        </div>
        <div className="p-2 bg-[var(--bg-tertiary)] rounded-md shrink-0">
          <Icon className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 bg-[var(--bg-secondary)] rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--text-emphasis)] mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Turnos hoy"
          value={stats?.appointments_today ?? 0}
          icon={Calendar}
        />
        <KpiCard
          title="Pendientes hoy"
          value={stats?.pending_today ?? 0}
          icon={Clock}
        />
        <KpiCard
          title="Confirmados hoy"
          value={stats?.confirmed_today ?? 0}
          icon={CheckCircle}
        />
        <KpiCard
          title="Total pacientes"
          value={stats?.total_patients ?? 0}
          icon={Users}
        />
      </div>

      {stats?.next_appointment && (
        <Card className="p-4 sm:p-5">
          <h2 className="font-medium text-[var(--text-primary)] mb-2">
            Próximo turno
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            ID: {stats.next_appointment.id} — Estado:{" "}
            {statusLabel(stats.next_appointment.status)}
          </p>
        </Card>
      )}
    </div>
  );
}

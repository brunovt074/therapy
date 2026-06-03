"use client";

import { useStats } from "@/hooks/use-stats";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";

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
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-tertiary)]">{title}</p>
          <p className="text-2xl font-display text-[var(--text-emphasis)] mt-1">
            {value}
          </p>
        </div>
        <div className="p-2 bg-[var(--bg-tertiary)] rounded-md">
          <Icon className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[var(--bg-secondary)] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--text-emphasis)] mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-5">
          <h2 className="font-medium text-[var(--text-primary)] mb-2">
            Próximo turno
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            ID: {stats.next_appointment.id} — Estado: {stats.next_appointment.status}
          </p>
        </div>
      )}
    </div>
  );
}

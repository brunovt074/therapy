"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePatient, useUpdatePatient, useDeletePatient } from "@/hooks/use-patients";
import { PatientForm } from "@/components/admin/patient-form";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: patient, isLoading } = usePatient(id);
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12 text-[var(--text-tertiary)]">
        Paciente no encontrado.
      </div>
    );
  }

  function handleDelete() {
    deletePatient.mutate(id, {
      onSuccess: () => {
        toast.success("Paciente eliminado");
        router.push("/admin/patients");
      },
    });
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4">
        <h1 className="font-display text-2xl text-[var(--text-emphasis)]">
          {patient.full_name}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-[var(--border-color)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-red-300 rounded-md text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 max-w-lg">
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b border-[var(--border-color-subtle)]">
            <span className="text-sm text-[var(--text-secondary)]">Teléfono</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{patient.phone}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-color-subtle)]">
            <span className="text-sm text-[var(--text-secondary)]">Email</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{patient.email ?? "—"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-color-subtle)]">
            <span className="text-sm text-[var(--text-secondary)]">Fecha de nacimiento</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{patient.birth_date ?? "—"}</span>
          </div>
          <div className="py-2 border-b border-[var(--border-color-subtle)]">
            <span className="text-sm text-[var(--text-secondary)] block mb-1">Observaciones</span>
            <p className="text-sm text-[var(--text-primary)]">{patient.notes ?? "Sin observaciones"}</p>
          </div>
          <div className="py-2">
            <span className="text-sm text-[var(--text-secondary)] block mb-1">Historia clínica</span>
            <p className="text-sm text-[var(--text-primary)]">{patient.medical_history ?? "Sin historia clínica"}</p>
          </div>
        </div>
      </div>

      {showForm && (
        <PatientForm
          initialData={patient}
          onCancel={() => setShowForm(false)}
          onSubmit={(data) => {
            updatePatient.mutate(
              { id, data },
              { onSuccess: () => setShowForm(false) }
            );
          }}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] w-full max-w-sm p-6">
            <h3 className="font-medium text-[var(--text-primary)] mb-2">¿Eliminar paciente?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              El paciente será desactivado. Sus turnos existentes no se verán afectados.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deletePatient.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deletePatient.isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

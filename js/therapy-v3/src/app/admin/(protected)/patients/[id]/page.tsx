"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePatient, useUpdatePatient, useDeletePatient } from "@/hooks/use-patients";
import { PatientUpdateInput } from "@/types/patient";
import { PatientForm } from "@/components/admin/patient-form";
import { Loader2, Pencil, Trash2, X } from "lucide-react";

function DeleteConfirmDialog({
  appointmentCount,
  onConfirm,
  onCancel,
  isLoading,
}: {
  appointmentCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const message =
    appointmentCount === 0
      ? "¿Estás seguro que querés eliminar este paciente?"
      : `Este paciente tiene ${appointmentCount} turno${appointmentCount === 1 ? "" : "s"} registrado${appointmentCount === 1 ? "" : "s"}. Si lo eliminás, se perderán también. ¿Querés continuar?`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h3 className="font-medium text-[var(--text-primary)]">Eliminar paciente</h3>
          <button onClick={onCancel} className="p-1 hover:bg-[var(--bg-tertiary)] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-[var(--text-secondary)]">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: patient, isLoading } = usePatient(id);
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  async function handleUpdate(data: PatientUpdateInput) {
    try {
      await updatePatient.mutateAsync({ id, data });
      setShowEditForm(false);
    } catch {
      // error toast handled in hook
    }
  }

  async function handleDelete() {
    try {
      await deletePatient.mutateAsync(id);
      router.push("/admin/patients");
    } catch {
      // error toast handled in hook
      setShowDeleteDialog(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--text-emphasis)]">
          {patient.full_name}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditForm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md"
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
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {patient.phone}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-color-subtle)]">
            <span className="text-sm text-[var(--text-secondary)]">Email</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {patient.email ?? "—"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-color-subtle)]">
            <span className="text-sm text-[var(--text-secondary)]">Fecha de nacimiento</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {patient.birth_date ?? "—"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-color-subtle)]">
            <span className="text-sm text-[var(--text-secondary)]">Turnos</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {patient.appointment_count}
            </span>
          </div>
          <div className="py-2 border-b border-[var(--border-color-subtle)]">
            <span className="text-sm text-[var(--text-secondary)] block mb-1">
              Observaciones
            </span>
            <p className="text-sm text-[var(--text-primary)]">
              {patient.notes ?? "Sin observaciones"}
            </p>
          </div>
          <div className="py-2">
            <span className="text-sm text-[var(--text-secondary)] block mb-1">
              Historia clínica
            </span>
            <p className="text-sm text-[var(--text-primary)]">
              {patient.medical_history ?? "Sin historia clínica"}
            </p>
          </div>
        </div>
      </div>

      {showEditForm && (
        <PatientForm
          initialData={patient}
          onSubmit={(data) => handleUpdate(data as PatientUpdateInput)}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      {showDeleteDialog && (
        <DeleteConfirmDialog
          appointmentCount={patient.appointment_count}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isLoading={deletePatient.isPending}
        />
      )}
    </div>
  );
}

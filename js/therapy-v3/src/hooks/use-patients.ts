import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi } from "@/lib/api/patients";

export function usePatients(q?: string, page = 1, per_page = 20) {
  return useQuery({
    queryKey: ["patients", q, page, per_page],
    queryFn: () => patientsApi.list(q, page, per_page),
  });
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: () => patientsApi.get(id),
    enabled: !!id,
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof patientsApi.update>[1] }) =>
      patientsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["patients", id] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

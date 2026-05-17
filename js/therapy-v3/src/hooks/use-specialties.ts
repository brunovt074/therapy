import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { specialtiesApi } from "@/lib/api/specialties";

export function useActiveSpecialties() {
  return useQuery({
    queryKey: ["specialties", "active"],
    queryFn: specialtiesApi.getActive,
  });
}

export function useAllSpecialties() {
  return useQuery({
    queryKey: ["specialties", "all"],
    queryFn: specialtiesApi.getAll,
  });
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: specialtiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
    },
  });
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof specialtiesApi.update>[1] }) =>
      specialtiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
    },
  });
}

export function useDeactivateSpecialty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: specialtiesApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
    },
  });
}

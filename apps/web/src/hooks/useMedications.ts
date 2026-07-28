import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Medication, MedicationInput, MedicationStatus } from "../types/medication";

const MEDICATIONS_KEY = ["medications"];
const DASHBOARD_KEY = ["dashboard-summary"];

export function useMedications() {
  return useQuery({
    queryKey: MEDICATIONS_KEY,
    queryFn: () => api.get<Medication[]>("/medications"),
  });
}

function useInvalidateMedications() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: MEDICATIONS_KEY });
    queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
  };
}

export function useCreateMedication() {
  const invalidate = useInvalidateMedications();
  return useMutation({
    mutationFn: (input: MedicationInput) => api.post<Medication>("/medications", input),
    onSuccess: invalidate,
  });
}

export function useUpdateMedication() {
  const invalidate = useInvalidateMedications();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MedicationInput }) =>
      api.patch<Medication>(`/medications/${id}`, input),
    onSuccess: invalidate,
  });
}

export function useUpdateMedicationStatus() {
  const invalidate = useInvalidateMedications();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MedicationStatus }) =>
      api.patch<Medication>(`/medications/${id}/status`, { status }),
    onSuccess: invalidate,
  });
}

export function useDeleteMedication() {
  const invalidate = useInvalidateMedications();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/medications/${id}`),
    onSuccess: invalidate,
  });
}

export function useMarkDose() {
  const invalidate = useInvalidateMedications();
  return useMutation({
    mutationFn: ({ medicationId, scheduledFor }: { medicationId: string; scheduledFor: string }) =>
      api.post(`/medications/${medicationId}/doses`, { scheduledFor }),
    onSuccess: invalidate,
  });
}

export function useUnmarkDose() {
  const invalidate = useInvalidateMedications();
  return useMutation({
    mutationFn: ({ medicationId, scheduledFor }: { medicationId: string; scheduledFor: string }) =>
      api.delete(`/medications/${medicationId}/doses?scheduledFor=${encodeURIComponent(scheduledFor)}`),
    onSuccess: invalidate,
  });
}

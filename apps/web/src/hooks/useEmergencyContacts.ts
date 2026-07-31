import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { EmergencyContact, EmergencyContactInput } from "../types/emergencyContact";

const EMERGENCY_CONTACTS_KEY = ["emergency-contacts"];

export function useEmergencyContacts() {
  return useQuery({
    queryKey: EMERGENCY_CONTACTS_KEY,
    queryFn: () => api.get<EmergencyContact[]>("/emergency-contacts"),
  });
}

export function useCreateEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmergencyContactInput) =>
      api.post<EmergencyContact>("/emergency-contacts", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EMERGENCY_CONTACTS_KEY }),
  });
}

export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/emergency-contacts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EMERGENCY_CONTACTS_KEY }),
  });
}

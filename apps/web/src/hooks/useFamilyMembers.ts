import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { FamilyMember, FamilyMemberInput } from "../types/familyMember";

const FAMILY_MEMBERS_KEY = ["family-members"];

export function useFamilyMembers() {
  return useQuery({
    queryKey: FAMILY_MEMBERS_KEY,
    queryFn: () => api.get<FamilyMember[]>("/family-members"),
  });
}

function useInvalidateFamilyMembers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: FAMILY_MEMBERS_KEY });
}

export function useCreateFamilyMember() {
  const invalidate = useInvalidateFamilyMembers();
  return useMutation({
    mutationFn: (input: FamilyMemberInput) => api.post<FamilyMember>("/family-members", input),
    onSuccess: invalidate,
  });
}

export function useUpdateFamilyMember() {
  const invalidate = useInvalidateFamilyMembers();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: FamilyMemberInput }) =>
      api.patch<FamilyMember>(`/family-members/${id}`, input),
    onSuccess: invalidate,
  });
}

export function useDeleteFamilyMember() {
  const invalidate = useInvalidateFamilyMembers();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/family-members/${id}`),
    onSuccess: invalidate,
  });
}

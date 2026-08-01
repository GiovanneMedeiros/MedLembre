import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { AdminStats, AdminUser } from "../types/admin";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get<AdminStats>("/admin/stats"),
    refetchInterval: 30_000,
    retry: false,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "usuarios"],
    queryFn: () => api.get<AdminUser[]>("/admin/usuarios"),
    retry: false,
  });
}

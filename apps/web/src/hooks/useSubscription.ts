import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { BillingPeriod, CheckoutResult, Plano, SubscriptionInfo } from "../types/subscription";

const SUBSCRIPTION_KEY = ["subscription"];

export function useSubscription() {
  return useQuery({
    queryKey: SUBSCRIPTION_KEY,
    queryFn: () => api.get<SubscriptionInfo>("/subscriptions/me"),
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (input: { plano: Plano; periodicidade: BillingPeriod }) =>
      api.post<CheckoutResult>("/subscriptions/checkout", input),
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<SubscriptionInfo>("/subscriptions/cancel"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY }),
  });
}

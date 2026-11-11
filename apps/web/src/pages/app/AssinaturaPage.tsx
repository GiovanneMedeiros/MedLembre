import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, CreditCard, Crown, Star } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { SegmentedToggle } from "../../components/ui/SegmentedToggle";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PageHeader } from "../../components/app/PageHeader";
import { Lift } from "../../components/ui/Lift";
import { CardsSkeleton } from "../../components/ui/CardsSkeleton";
import { PLANS } from "../../data/plans";
import { formatCurrency } from "../../lib/format";
import { cn } from "../../lib/cn";
import { ApiError } from "../../lib/api";
import { trackEvent } from "../../lib/fbPixel";
import { useCancelSubscription, useCreateCheckout, useSubscription } from "../../hooks/useSubscription";
import type { Plano } from "../../types/subscription";

type Cycle = "monthly" | "annual";

const PLAN_ID_TO_ENUM: Record<string, Plano> = {
  gratis: "GRATIS",
  essencial: "ESSENCIAL",
  familia: "FAMILIA",
  premium: "PREMIUM",
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  ATIVA: { label: "Ativa", className: "bg-emerald-50 text-emerald-700" },
  INADIMPLENTE: { label: "Pagamento pendente", className: "bg-amber-50 text-amber-700" },
  CANCELADA: { label: "Cancelada", className: "bg-ink-900/[0.06] text-ink-500" },
};

export function AssinaturaPage() {
  const [searchParams] = useSearchParams();
  const checkoutResult = searchParams.get("checkout");

  const { data: subscription, isLoading } = useSubscription();
  const createCheckout = useCreateCheckout();
  const cancelSubscription = useCancelSubscription();

  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (checkoutResult === "sucesso") {
      trackEvent("Purchase", { currency: "BRL" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubscribe(planId: string) {
    setCheckoutError(null);
    setPendingPlanId(planId);
    try {
      const periodicidade = cycle === "annual" ? "ANUAL" : "MENSAL";
      trackEvent("InitiateCheckout", { plano: planId, periodicidade });
      const result = await createCheckout.mutateAsync({
        plano: PLAN_ID_TO_ENUM[planId],
        periodicidade,
      });
      window.location.href = result.checkoutUrl;
    } catch (error) {
      setCheckoutError(
        error instanceof ApiError ? error.message : "Não foi possível iniciar o checkout. Tente novamente.",
      );
      setPendingPlanId(null);
    }
  }

  async function handleCancel() {
    await cancelSubscription.mutateAsync();
    setShowCancelDialog(false);
  }

  const currentStatus = subscription ? STATUS_LABEL[subscription.status] : null;

  return (
    <div className="pb-16">
      <PageHeader title="Assinatura" icon={CreditCard} description="Gerencie seu plano e forma de pagamento." />

      <Container className="pt-6 sm:pt-8">
        {isLoading && <CardsSkeleton count={1} className="mb-8 sm:grid-cols-1 lg:grid-cols-1" itemClassName="h-28" />}

        {checkoutResult === "sucesso" && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Pagamento confirmado! Seu plano será atualizado em instantes.
          </div>
        )}
        {checkoutResult === "cancelado" && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Checkout cancelado. Nenhuma cobrança foi feita.
          </div>
        )}
        {checkoutError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {checkoutError}
          </div>
        )}

        {subscription && (
          <div className="relative mb-10 flex animate-rise flex-wrap items-center justify-between gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-6 text-white shadow-lift sm:p-7">
            <div className="pointer-events-none absolute -top-14 -right-14 h-48 w-48 rounded-full border-[18px] border-white/[0.08]" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full border-[14px] border-white/[0.06]" aria-hidden="true" />
            <div className="relative flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 animate-float items-center justify-center rounded-2xl bg-white/15">
                <Crown className="h-7 w-7" aria-hidden="true" />
              </span>
            <div>
              <p className="text-sm font-medium text-white/75">Plano atual</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-2xl font-extrabold">
                  {PLANS.find((p) => PLAN_ID_TO_ENUM[p.id] === subscription.plano)?.name ?? subscription.plano}
                </h2>
                {currentStatus && (
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", currentStatus.className)}>
                    {currentStatus.label}
                  </span>
                )}
              </div>
              {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
                <p className="mt-1 text-sm text-amber-100">
                  Sua assinatura será cancelada em{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}.
                </p>
              )}
            </div>
            </div>

            {subscription.plano !== "GRATIS" && !subscription.cancelAtPeriodEnd && (
              <Button variant="secondary" size="md" className="relative" onClick={() => setShowCancelDialog(true)}>
                Cancelar assinatura
              </Button>
            )}
          </div>
        )}

        <div className="flex justify-center">
          <SegmentedToggle
            value={cycle}
            onChange={(value) => setCycle(value as Cycle)}
            options={[
              { value: "monthly", label: "Mensal" },
              {
                value: "annual",
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    Anual
                    <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      -25%
                    </span>
                  </span>
                ),
              },
            ]}
          />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, i) => {
            const isAnnual = cycle === "annual" && plan.annualPrice !== null;
            const displayPrice = isAnnual ? plan.annualPrice! / 12 : plan.monthlyPrice;
            const isCurrent = subscription?.plano === PLAN_ID_TO_ENUM[plan.id];
            const isFree = plan.id === "gratis";
            const isPending = createCheckout.isPending && pendingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className="animate-rise"
                style={{ animationDelay: `${0.1 + i * 0.08}s`, animationFillMode: "backwards" }}
              >
              <Lift>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border bg-white p-6",
                  plan.highlighted
                    ? "border-brand-300 shadow-glow ring-1 ring-brand-200"
                    : "border-ink-900/[0.06] shadow-soft",
                  isCurrent && "ring-2 ring-emerald-400",
                )}
              >
                {plan.highlighted && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
                    <span className="absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-brand-100/60 to-transparent" />
                  </div>
                )}
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-3 py-1 text-[11px] font-bold text-white shadow-soft">
                    <Star className="h-3 w-3 fill-current" />
                    Mais popular
                  </span>
                )}

                <h3 className="text-base font-semibold text-ink-900">{plan.name}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{plan.description}</p>

                <div key={cycle} className="mt-5 flex animate-rise items-baseline gap-1" style={{ animationDuration: "0.4s" }}>
                  <span className="font-heading text-3xl font-extrabold text-ink-900 tabular-nums">{formatCurrency(displayPrice)}</span>
                  {plan.monthlyPrice > 0 && <span className="text-sm text-ink-500">/mês</span>}
                </div>

                {plan.monthlyPrice === 0 && <p className="mt-1 text-xs text-ink-300">Grátis por 48 horas.</p>}
                {isAnnual && plan.annualPrice !== null && (
                  <p className="mt-1 text-xs text-ink-300">
                    {formatCurrency(plan.annualPrice)} cobrado por ano
                  </p>
                )}

                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-ink-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="mt-7 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Seu plano atual
                  </div>
                ) : isFree ? (
                  <div className="mt-7 flex h-11 w-full items-center justify-center rounded-full text-sm text-ink-300">
                    —
                  </div>
                ) : (
                  <Button
                    variant={plan.highlighted ? "primary" : "secondary"}
                    size="md"
                    className="mt-7 w-full"
                    disabled={createCheckout.isPending}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {isPending ? "Redirecionando…" : "Assinar plano"}
                  </Button>
                )}
              </div>
              </Lift>
              </div>
            );
          })}
        </div>
      </Container>

      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Cancelar assinatura"
        description="Você continuará com acesso ao plano atual até o fim do período já pago. Depois disso, sua conta volta para o plano Grátis."
        confirmLabel="Cancelar assinatura"
        loadingLabel="Cancelando..."
        isLoading={cancelSubscription.isPending}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
      />
    </div>
  );
}

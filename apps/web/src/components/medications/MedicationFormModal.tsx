import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../ui/Modal";
import { FormField } from "../auth/FormField";
import { FormAlert } from "../auth/FormAlert";
import { SubmitButton } from "../auth/SubmitButton";
import { inputClassName } from "../auth/inputClassName";
import { TimeListInput } from "./TimeListInput";
import { WeekdayToggle } from "./WeekdayToggle";
import { ColorPicker } from "./ColorPicker";
import { PhotoUpload } from "../ui/PhotoUpload";
import { Pill } from "lucide-react";
import { Link } from "react-router-dom";
import { medicationSchema, type MedicationFormValues } from "../../lib/validation/medication";
import { useCreateMedication, useUpdateMedication } from "../../hooks/useMedications";
import { useSubscription } from "../../hooks/useSubscription";
import type { Medication } from "../../types/medication";
import { ApiError } from "../../lib/api";
import { todayLocalDateString } from "../../lib/date";

interface MedicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication?: Medication | null;
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function getEmptyValues(): MedicationFormValues {
  return {
    nome: "",
    dosagem: "",
    observacao: "",
    cor: "brand",
    fotoUrl: "",
    estoqueQuantidade: "",
    estoqueAlertaLimiar: "",
    horarios: [],
    diasSemana: [],
    dataInicio: todayLocalDateString(),
    dataFim: "",
  };
}

export function MedicationFormModal({ isOpen, onClose, medication }: MedicationFormModalProps) {
  const isEditing = Boolean(medication);
  const createMedication = useCreateMedication();
  const updateMedication = useUpdateMedication();
  const { data: subscription } = useSubscription();
  const estoqueEnabled = subscription?.capabilities.estoqueEnabled ?? false;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: getEmptyValues(),
  });

  useEffect(() => {
    if (!isOpen) return;

    setServerError(null);

    if (medication) {
      reset({
        nome: medication.nome,
        dosagem: medication.dosagem,
        observacao: medication.observacao ?? "",
        cor: medication.cor,
        fotoUrl: medication.fotoUrl ?? "",
        estoqueQuantidade:
          medication.estoqueQuantidade !== null ? String(medication.estoqueQuantidade) : "",
        estoqueAlertaLimiar:
          medication.estoqueAlertaLimiar !== null ? String(medication.estoqueAlertaLimiar) : "",
        horarios: medication.horarios,
        diasSemana: medication.diasSemana,
        dataInicio: toDateInputValue(medication.dataInicio),
        dataFim: toDateInputValue(medication.dataFim),
      });
    } else {
      reset(getEmptyValues());
    }
  }, [isOpen, medication, reset]);

  async function onSubmit(values: MedicationFormValues) {
    setServerError(null);

    const input = {
      nome: values.nome,
      dosagem: values.dosagem,
      observacao: values.observacao || undefined,
      cor: values.cor,
      fotoUrl: values.fotoUrl || undefined,
      estoqueQuantidade:
        estoqueEnabled && values.estoqueQuantidade ? Number(values.estoqueQuantidade) : undefined,
      estoqueAlertaLimiar:
        estoqueEnabled && values.estoqueAlertaLimiar ? Number(values.estoqueAlertaLimiar) : undefined,
      horarios: values.horarios,
      diasSemana: values.diasSemana,
      dataInicio: values.dataInicio,
      dataFim: values.dataFim || undefined,
    };

    try {
      if (medication) {
        await updateMedication.mutateAsync({ id: medication.id, input });
      } else {
        await createMedication.mutateAsync(input);
      }
      onClose();
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Não foi possível salvar. Tente novamente.");
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar medicamento" : "Adicionar medicamento"}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && <FormAlert variant="error">{serverError}</FormAlert>}

        <FormField label="Nome do medicamento" htmlFor="nome" error={errors.nome?.message}>
          <input
            id="nome"
            type="text"
            className={inputClassName}
            placeholder="Ex: Losartana"
            {...register("nome")}
          />
        </FormField>

        <FormField label="Dosagem" htmlFor="dosagem" error={errors.dosagem?.message}>
          <input
            id="dosagem"
            type="text"
            className={inputClassName}
            placeholder="Ex: 50mg"
            {...register("dosagem")}
          />
        </FormField>

        <FormField label="Observação (opcional)" htmlFor="observacao" error={errors.observacao?.message}>
          <textarea
            id="observacao"
            rows={2}
            className={`${inputClassName} h-auto resize-none py-2.5`}
            placeholder="Ex: Tomar em jejum"
            {...register("observacao")}
          />
        </FormField>

        <FormField label="Foto (opcional)" htmlFor="fotoUrl" error={errors.fotoUrl?.message}>
          <Controller
            control={control}
            name="fotoUrl"
            render={({ field }) => (
              <PhotoUpload
                value={field.value ?? ""}
                onChange={field.onChange}
                bucket="medication-photos"
                shape="square"
                fallbackIcon={<Pill className="h-7 w-7" aria-hidden="true" />}
              />
            )}
          />
        </FormField>

        <FormField label="Cor de identificação" htmlFor="cor" error={errors.cor?.message}>
          <Controller
            control={control}
            name="cor"
            render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} />}
          />
        </FormField>

        {estoqueEnabled ? (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Estoque atual (opcional)"
              htmlFor="estoqueQuantidade"
              error={errors.estoqueQuantidade?.message}
            >
              <input
                id="estoqueQuantidade"
                type="number"
                min={0}
                inputMode="numeric"
                className={inputClassName}
                placeholder="Ex: 30"
                {...register("estoqueQuantidade")}
              />
            </FormField>
            <FormField
              label="Avisar quando restar"
              htmlFor="estoqueAlertaLimiar"
              error={errors.estoqueAlertaLimiar?.message}
            >
              <input
                id="estoqueAlertaLimiar"
                type="number"
                min={1}
                inputMode="numeric"
                className={inputClassName}
                placeholder="Ex: 5"
                {...register("estoqueAlertaLimiar")}
              />
            </FormField>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-ink-900/[0.12] px-4 py-3 text-xs text-ink-500">
            <span className="font-semibold text-brand-600">Planos pagos:</span> controle quantas doses restam e
            receba um alerta pra repor a tempo.{" "}
            <Link to="/dashboard/assinatura" className="font-semibold text-brand-600 hover:text-brand-700">
              Fazer upgrade
            </Link>
          </div>
        )}

        <FormField label="Horários" htmlFor="horarios" error={errors.horarios?.message}>
          <Controller
            control={control}
            name="horarios"
            render={({ field }) => <TimeListInput value={field.value} onChange={field.onChange} />}
          />
        </FormField>

        <FormField label="Dias da semana" htmlFor="diasSemana" error={errors.diasSemana?.message}>
          <Controller
            control={control}
            name="diasSemana"
            render={({ field }) => <WeekdayToggle value={field.value} onChange={field.onChange} />}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Data de início" htmlFor="dataInicio" error={errors.dataInicio?.message}>
            <input id="dataInicio" type="date" className={inputClassName} {...register("dataInicio")} />
          </FormField>

          <FormField label="Data de término (opcional)" htmlFor="dataFim" error={errors.dataFim?.message}>
            <input id="dataFim" type="date" className={inputClassName} {...register("dataFim")} />
          </FormField>
        </div>

        <div className="mt-1">
          <SubmitButton isLoading={isSubmitting} loadingText="Salvando...">
            {isEditing ? "Salvar alterações" : "Adicionar medicamento"}
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}

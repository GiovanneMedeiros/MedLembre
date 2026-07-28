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
import { medicationSchema, type MedicationFormValues } from "../../lib/validation/medication";
import { useCreateMedication, useUpdateMedication } from "../../hooks/useMedications";
import type { Medication } from "../../types/medication";
import { ApiError } from "../../lib/api";

interface MedicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication?: Medication | null;
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

const EMPTY_VALUES: MedicationFormValues = {
  nome: "",
  dosagem: "",
  observacao: "",
  horarios: [],
  diasSemana: [],
  dataInicio: new Date().toISOString().slice(0, 10),
  dataFim: "",
};

export function MedicationFormModal({ isOpen, onClose, medication }: MedicationFormModalProps) {
  const isEditing = Boolean(medication);
  const createMedication = useCreateMedication();
  const updateMedication = useUpdateMedication();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!isOpen) return;

    setServerError(null);

    if (medication) {
      reset({
        nome: medication.nome,
        dosagem: medication.dosagem,
        observacao: medication.observacao ?? "",
        horarios: medication.horarios,
        diasSemana: medication.diasSemana,
        dataInicio: toDateInputValue(medication.dataInicio),
        dataFim: toDateInputValue(medication.dataFim),
      });
    } else {
      reset(EMPTY_VALUES);
    }
  }, [isOpen, medication, reset]);

  async function onSubmit(values: MedicationFormValues) {
    setServerError(null);

    const input = {
      nome: values.nome,
      dosagem: values.dosagem,
      observacao: values.observacao || undefined,
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

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../ui/Modal";
import { FormField } from "../auth/FormField";
import { FormAlert } from "../auth/FormAlert";
import { SubmitButton } from "../auth/SubmitButton";
import { inputClassName } from "../auth/inputClassName";
import { familyMemberSchema, type FamilyMemberFormValues } from "../../lib/validation/familyMember";
import { PhotoUpload } from "./PhotoUpload";
import { formatWhatsAppInput, normalizePhoneDigits } from "../../lib/phone";
import { useCreateFamilyMember, useUpdateFamilyMember } from "../../hooks/useFamilyMembers";
import type { FamilyMember } from "../../types/familyMember";
import { ApiError } from "../../lib/api";

interface FamilyMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyMember?: FamilyMember | null;
}

const EMPTY_VALUES: FamilyMemberFormValues = { nome: "", telefone: "", fotoUrl: "" };

export function FamilyMemberFormModal({ isOpen, onClose, familyMember }: FamilyMemberFormModalProps) {
  const isEditing = Boolean(familyMember);
  const createFamilyMember = useCreateFamilyMember();
  const updateFamilyMember = useUpdateFamilyMember();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FamilyMemberFormValues>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!isOpen) return;

    setServerError(null);

    if (familyMember) {
      reset({
        nome: familyMember.nome,
        telefone: familyMember.whatsapp ? formatWhatsAppInput(familyMember.whatsapp) : "",
        fotoUrl: familyMember.fotoUrl ?? "",
      });
    } else {
      reset(EMPTY_VALUES);
    }
  }, [isOpen, familyMember, reset]);

  async function onSubmit(values: FamilyMemberFormValues) {
    setServerError(null);

    const input = {
      nome: values.nome,
      whatsapp: values.telefone ? normalizePhoneDigits(values.telefone) : undefined,
      fotoUrl: values.fotoUrl || undefined,
    };

    try {
      if (familyMember) {
        await updateFamilyMember.mutateAsync({ id: familyMember.id, input });
      } else {
        await createFamilyMember.mutateAsync(input);
      }
      onClose();
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Não foi possível salvar. Tente novamente.");
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar familiar" : "Adicionar familiar"}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && <FormAlert variant="error">{serverError}</FormAlert>}

        <FormField label="Nome" htmlFor="nome" error={errors.nome?.message}>
          <input id="nome" type="text" className={inputClassName} placeholder="Ex: Maria" {...register("nome")} />
        </FormField>

        <FormField
          label="Telefone (opcional)"
          htmlFor="telefone"
          error={errors.telefone?.message}
          hint="Só um contato — as notificações chegam no seu app, não no telefone dela."
        >
          <Controller
            control={control}
            name="telefone"
            render={({ field }) => (
              <input
                id="telefone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                className={inputClassName}
                placeholder="(11) 91234-5678"
                value={field.value ?? ""}
                onChange={(event) => field.onChange(formatWhatsAppInput(event.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>

        <FormField label="Foto (opcional)" htmlFor="fotoUrl" error={errors.fotoUrl?.message}>
          <Controller
            control={control}
            name="fotoUrl"
            render={({ field }) => <PhotoUpload value={field.value ?? ""} onChange={field.onChange} />}
          />
        </FormField>

        <div className="mt-1">
          <SubmitButton isLoading={isSubmitting} loadingText="Salvando...">
            {isEditing ? "Salvar alterações" : "Adicionar familiar"}
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}

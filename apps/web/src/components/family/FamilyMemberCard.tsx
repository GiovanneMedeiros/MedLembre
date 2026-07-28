import { MessageCircle, Pencil, Trash2, User } from "lucide-react";
import type { FamilyMember } from "../../types/familyMember";
import { formatWhatsAppInput } from "../../lib/phone";

interface FamilyMemberCardProps {
  familyMember: FamilyMember;
  onEdit: () => void;
  onDelete: () => void;
}

export function FamilyMemberCard({ familyMember, onEdit, onDelete }: FamilyMemberCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-ink-900/[0.06] bg-white p-5 shadow-soft">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-brand-700">
        {familyMember.fotoUrl ? (
          <img src={familyMember.fotoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <User className="h-6 w-6" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-bold text-ink-900">{familyMember.nome}</h3>
        <div className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
          <MessageCircle className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
          {formatWhatsAppInput(familyMember.whatsapp)}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${familyMember.nome}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-300 hover:bg-ink-900/[0.04] hover:text-ink-900"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Excluir ${familyMember.nome}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-300 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

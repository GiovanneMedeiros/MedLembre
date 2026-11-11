import { Pencil, Phone, Trash2 } from "lucide-react";
import type { FamilyMember } from "../../types/familyMember";
import { formatWhatsAppInput } from "../../lib/phone";

interface FamilyMemberCardProps {
  familyMember: FamilyMember;
  onEdit: () => void;
  onDelete: () => void;
}

// Cada familiar ganha um degradê estável, escolhido a partir do nome.
const GRADIENTS = [
  "from-brand-400 to-brand-600",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-purple-400 to-fuchsia-600",
  "from-pink-400 to-rose-600",
];

function gradientFor(nome: string) {
  let hash = 0;
  for (const ch of nome) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

function initials(nome: string) {
  const parts = nome.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function FamilyMemberCard({ familyMember, onEdit, onDelete }: FamilyMemberCardProps) {
  return (
    <div className="group flex h-full items-center gap-4 rounded-3xl border border-ink-900/[0.06] bg-white p-5 shadow-soft">
      <div
        className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-soft transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 ${gradientFor(familyMember.nome)}`}
      >
        {familyMember.fotoUrl ? (
          <img src={familyMember.fotoUrl} alt="" width={56} height={56} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true">{initials(familyMember.nome)}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-heading text-lg font-bold text-ink-900">{familyMember.nome}</h3>
        {familyMember.whatsapp ? (
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
            <Phone className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
            <span className="tabular-nums">{formatWhatsAppInput(familyMember.whatsapp)}</span>
          </div>
        ) : (
          <p className="mt-0.5 text-sm text-ink-300">Sem WhatsApp cadastrado</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${familyMember.nome}`}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-300 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-900"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Excluir ${familyMember.nome}`}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-300 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

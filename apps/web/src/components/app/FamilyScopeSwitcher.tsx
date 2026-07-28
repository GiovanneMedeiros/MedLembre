import { useState } from "react";
import { Check, ChevronDown, User, Users } from "lucide-react";
import { useFamilyScope } from "../../contexts/FamilyScopeContext";
import { useFamilyMembers } from "../../hooks/useFamilyMembers";

export function FamilyScopeSwitcher() {
  const { familyMemberId, setFamilyMemberId, currentLabel, canSwitch } = useFamilyScope();
  const { data: familyMembers } = useFamilyMembers();
  const [isOpen, setIsOpen] = useState(false);

  if (!canSwitch) return null;

  return (
    <div className="relative px-3 pb-2">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-ink-900/[0.06] bg-cream px-3 py-2.5 text-left hover:border-brand-200"
      >
        <Users className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900">{currentLabel}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-300" aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-3 right-3 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-ink-900/[0.06] bg-white py-1 shadow-lift">
            <button
              type="button"
              onClick={() => {
                setFamilyMemberId(null);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-900/[0.03]"
            >
              <User className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">Minha conta</span>
              {familyMemberId === null && <Check className="h-4 w-4 text-brand-600" aria-hidden="true" />}
            </button>

            {familyMembers?.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  setFamilyMemberId(member.id);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-900/[0.03]"
              >
                <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1 truncate">{member.nome}</span>
                {familyMemberId === member.id && <Check className="h-4 w-4 text-brand-600" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

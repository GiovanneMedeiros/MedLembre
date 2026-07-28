export interface FamilyMember {
  id: string;
  userId: string;
  nome: string;
  whatsapp: string;
  fotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMemberInput {
  nome: string;
  whatsapp: string;
  fotoUrl?: string;
}

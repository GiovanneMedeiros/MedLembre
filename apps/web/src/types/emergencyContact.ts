export interface EmergencyContact {
  id: string;
  userId: string;
  nome: string;
  whatsapp: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContactInput {
  nome: string;
  whatsapp: string;
}

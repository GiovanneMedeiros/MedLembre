import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface OwnerContact {
  nome: string | null;
  whatsapp: string | null;
}

@Injectable()
export class SupabaseAdminService {
  private readonly logger = new Logger(SupabaseAdminService.name);
  private readonly client: SupabaseClient | null;

  constructor(configService: ConfigService) {
    const url = configService.get<string>('SUPABASE_URL');
    const secretKey = configService.get<string>('SUPABASE_SECRET_KEY');

    this.client =
      url && secretKey
        ? createClient(url, secretKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : null;

    if (!this.client) {
      this.logger.warn(
        'SUPABASE_URL/SUPABASE_SECRET_KEY não configurados — recursos de admin desativados.',
      );
    }
  }

  async getOwnerContact(userId: string): Promise<OwnerContact> {
    if (!this.client) return { nome: null, whatsapp: null };

    const { data, error } = await this.client.auth.admin.getUserById(userId);
    if (error || !data.user) {
      this.logger.warn(
        `Não foi possível carregar o usuário ${userId}: ${error?.message}`,
      );
      return { nome: null, whatsapp: null };
    }

    const metadata = data.user.user_metadata ?? {};
    return {
      nome: (metadata.nome as string | undefined) ?? null,
      whatsapp: (metadata.whatsapp as string | undefined) ?? null,
    };
  }

  async deleteUser(userId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Supabase admin não configurado — não é possível excluir a conta.');
    }

    const { error } = await this.client.auth.admin.deleteUser(userId);
    if (error) {
      throw new Error(`Falha ao excluir usuário no Supabase: ${error.message}`);
    }
  }
}

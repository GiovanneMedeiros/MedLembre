import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface OwnerContact {
  nome: string | null;
  whatsapp: string | null;
}

export interface AdminUserSummary {
  id: string;
  email: string | null;
  nome: string | null;
  criadoEm: string;
  emailConfirmado: boolean;
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

  async getUserEmail(userId: string): Promise<string | null> {
    if (!this.client) return null;

    const { data, error } = await this.client.auth.admin.getUserById(userId);
    if (error || !data.user) return null;

    return data.user.email ?? null;
  }

  /**
   * Lista todos os usuários do Supabase Auth, paginando internamente.
   * Usado só pelo painel /adm — não pensado pra bases com muitos milhares
   * de contas (não há necessidade disso na escala atual do produto).
   */
  async listUsers(): Promise<AdminUserSummary[]> {
    if (!this.client) return [];

    const perPage = 200;
    let page = 1;
    const all: AdminUserSummary[] = [];

    while (true) {
      const { data, error } = await this.client.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error || !data) {
        this.logger.warn(`Falha ao listar usuários: ${error?.message}`);
        break;
      }

      for (const user of data.users) {
        all.push({
          id: user.id,
          email: user.email ?? null,
          nome: (user.user_metadata?.nome as string | undefined) ?? null,
          criadoEm: user.created_at,
          emailConfirmado: Boolean(user.email_confirmed_at),
        });
      }

      if (data.users.length < perPage) break;
      page += 1;
    }

    return all;
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

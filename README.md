# MedLembre

<div align="center">

### Gestão inteligente de medicamentos e rotina de cuidado

Uma solução moderna para organizar tratamentos, reduzir erros de medicação e facilitar o acompanhamento de pacientes, familiares e cuidadores.

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%20%2F%206-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-ea2845?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![pnpm](https://img.shields.io/badge/pnpm-Workspace-f69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

[Visão geral](#-visão-geral) · [Funcionalidades](#-funcionalidades) · [Arquitetura](#-arquitetura) · [Tecnologias](#-tecnologias) · [Como executar](#-como-executar) · [Estrutura](#-estrutura-do-repositório)

</div>

---

## 💙 Visão geral

O **MedLembre** foi pensado para transformar a rotina de cuidado em uma experiência mais segura, organizada e acessível. A plataforma centraliza o cadastro de medicamentos, o acompanhamento de doses, os lembretes de administração e o histórico de uso, ajudando pessoas em tratamento, familiares e cuidadores a manterem o controle com mais clareza e menos fricção.

O projeto é estruturado em um monorepo com uma aplicação web em **React** e uma API em **NestJS**, usando **PostgreSQL** como banco de dados principal, **Prisma** para a camada de dados e **Supabase** para autenticação e identidade. A solução foi desenhada para evoluir com escalabilidade, boa experiência de uso e integração com canais de comunicação e recursos premium.

> O MedLembre é uma ferramenta de apoio à organização e ao acompanhamento da rotina de medicamentos. Não substitui orientação médica, prescrição, diagnóstico ou acompanhamento profissional.

## ✨ Funcionalidades

- **Gestão de medicamentos:** cadastro completo de remédios com nome, dose, frequência, dias de uso e período de tratamento.
- **Controle de doses:** registro de administração, histórico de consumo e visualização do status da rotina.
- **Lembretes inteligentes:** alertas programados para reforçar a adesão ao tratamento e reduzir esquecimentos.
- **Painel de acompanhamento:** visão consolidada de doses pendentes, atrasadas e próximas de execução.
- **Cuidado compartilhado:** suporte para acompanhamento por familiares e cuidadores com contexto compartilhado da rotina.
- **Notificações multi-canal:** integração com WhatsApp, SMS e web push para reforço de alertas.
- **Planos e assinaturas:** estrutura preparada para planos, limites de uso e integrações de checkout e webhook.
- **Área administrativa:** suporte a gestão de usuários, métricas e visão operacional da aplicação.
- **Experiência web moderna:** landing page, autenticação, recuperação de senha e interface protegida para uso diário.

A disponibilidade de recursos avançados, como notificações, pagamentos e integrações por canal, depende das credenciais e configurações dos provedores externos configurados no ambiente.

## 🏗️ Arquitetura

A solução segue uma arquitetura modular e escalável, com separação clara entre camadas de apresentação, aplicação e dados.

- **Frontend (apps/web):** interface responsiva em React + Vite + TypeScript, foco em experiência do usuário e navegação intuitiva.
- **Backend (apps/api):** API REST em NestJS, responsável por regras de negócio, autenticação e serviços de domínio.
- **Dados (PostgreSQL + Prisma):** persistência confiável e modelagem estruturada para o ciclo completo da rotina de medicamentos.
- **Autenticação (Supabase Auth):** gestão segura de usuários, sessões e identidade digital.
- **Integrações externas:** notificações, comunicação e pagamentos conectados por provedores específicos conforme o ambiente.
- **Monorepo (pnpm + Turborepo):** organização eficiente para múltiplos pacotes e evolução do produto de forma sustentável.

## 🧰 Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query |
| Backend | NestJS 11, TypeScript, Passport/JWT |
| Dados | PostgreSQL, Prisma 7, `@prisma/adapter-pg` |
| Autenticação | Supabase Auth |
| Validação compartilhada | Zod |
| Monorepo | pnpm workspaces, Turborepo |
| Integrações | WhatsApp Cloud API, Twilio, Web Push, pagamentos e outros serviços externos |

## 🚀 Como executar

### Pré-requisitos

- **Node.js 22.x**
- **pnpm 11.17.0**
- Instância de **PostgreSQL** acessível
- Projeto **Supabase** configurado para autenticação

Recursos opcionais, como WhatsApp, SMS, e-mail, web push e pagamentos, exigem credenciais adicionais e não são obrigatórios para rodar a base da aplicação.

### 1. Instale as dependências

Na raiz do projeto:

```bash
pnpm install
```

### 2. Configure as variáveis de ambiente

Crie os arquivos de ambiente a partir dos templates:

**PowerShell**

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

**macOS / Linux**

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Preencha os valores reais antes de iniciar os serviços:

| Arquivo | Variáveis principais |
| --- | --- |
| `apps/api/.env` | `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_JWKS_URL`, `SUPABASE_SECRET_KEY`, `WEB_ORIGIN` |
| `apps/web/.env` | `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |

- `DATABASE_URL`: conexão principal do PostgreSQL usada pela API.
- `DIRECT_URL`: conexão direta usada pelo Prisma em operações de migração.
- `SUPABASE_JWKS_URL`: endpoint das chaves públicas JWT do projeto Supabase.
- `VITE_API_URL`: endereço da API, normalmente `http://localhost:3333`.

> O Prisma lê `DIRECT_URL` durante a geração do cliente. Por isso, o arquivo `apps/api/.env` deve ser preenchido antes de uma instalação limpa e da execução do comando `pnpm install`.

### 3. Prepare o banco de dados

Com `DATABASE_URL` e `DIRECT_URL` corretamente configurados, aplique as migrações:

```bash
pnpm --filter @medlembre/api exec prisma migrate deploy
```

### 4. Inicie a aplicação

Na raiz do monorepo:

```bash
pnpm dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3333](http://localhost:3333)

Se quiser executar apenas um serviço:

```bash
pnpm --filter @medlembre/web dev
pnpm --filter @medlembre/api dev
```

## 🧪 Build e testes

```bash
# Build geral do monorepo
pnpm build

# Testes da API
pnpm --filter @medlembre/api test

# Testes E2E da API
pnpm --filter @medlembre/api test:e2e
```

## 🗂️ Estrutura do repositório

```text
medlembre/
├── apps/
│   ├── api/       # API NestJS, Prisma e migrações do banco
│   └── web/       # Aplicação web em React + Vite
├── packages/
│   └── shared/    # Tipos e validações compartilhadas
├── package.json   # Scripts e configuração do workspace
├── pnpm-workspace.yaml
├── turbo.json     # Pipeline do monorepo
├── pnpm-lock.yaml
└── README.md
```

## 🔐 Configuração e segurança

- Mantenha segredos e chaves privadas apenas no backend.
- Utilize credenciais separadas para desenvolvimento e produção.
- Configure URLs de origem, webhooks e integrações de acordo com o ambiente.
- Ative somente serviços externos que estejam devidamente configurados.
- Nunca exponha chaves sensíveis no frontend ou em repositórios públicos.

## 📄 Licença

Este repositório não declara uma licença open source. Antes de reutilizar, distribuir ou adaptar o projeto, consulte o responsável pela manutenção do código.

---

<div align="center">

Feito para apoiar uma rotina de cuidado mais simples, segura e organizada.

</div>

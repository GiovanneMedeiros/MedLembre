# MedLembre

<div align="center">

### Gestão inteligente de medicamentos e rotina de cuidado

Uma plataforma moderna para organizar tratamentos, reduzir erros de medicação e facilitar a rotina de pacientes, familiares e cuidadores.

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%20%2F%206-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-ea2845?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![pnpm](https://img.shields.io/badge/pnpm-Workspace-f69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

[Visão geral](#-visão-geral) · [Funcionalidades](#-funcionalidades) · [Arquitetura](#-arquitetura) · [Tecnologias](#-tecnologias) · [Como executar](#-como-executar) · [Roadmap](#-roadmap)

</div>

---

## 💙 Visão geral

O **MedLembre** é uma solução de gestão de medicamentos e acompanhamento de rotina de cuidado, desenvolvida para tornar a adesão ao tratamento mais simples, segura e organizada. A plataforma centraliza o cadastro de medicamentos, lembretes, histórico de doses e acompanhamento da rotina de uso, reduzindo erros e melhorando o controle para pacientes, familiares e cuidadores.

A arquitetura do projeto foi pensada para ser escalável e sustentável, com uma aplicação web moderna em **React**, uma API em **NestJS**, banco de dados em **PostgreSQL** e autenticação em **Supabase**. O objetivo é entregar uma experiência funcional e confiável para uso diário, com base em boas práticas de engenharia, arquitetura modular e desenvolvimento orientado a produto.

> O MedLembre é uma ferramenta de apoio à organização e acompanhamento de tratamentos. Não substitui orientação médica, prescrição, diagnóstico ou acompanhamento profissional.

## ✨ Por que este projeto importa

O uso de múltiplos medicamentos, horários e cuidados pode gerar confusão e aumentar o risco de falhas na rotina de tratamento. O MedLembre foi desenhado para:

- reduzir esquecimentos e atrasos na administração das doses;
- melhorar a organização da rotina de medicamentos;
- facilitar o acompanhamento de familiares e cuidadores;
- aumentar a clareza sobre o histórico de uso e pendências;
- dar visibilidade a uma experiência mais segura e consistente.

## 🧩 Funcionalidades principais

- **Gestão de medicamentos:** cadastro de remédios com nome, dose, frequência, período de uso e status.
- **Controle de doses:** registro de administração e consulta ao histórico de doses tomadas.
- **Lembretes inteligentes:** alertas para reforçar a adesão ao tratamento e reduzir esquecimentos.
- **Painel de acompanhamento:** visão consolidada de pendências, doses atrasadas e próximos lembretes.
- **Cuidado compartilhado:** suporte para acompanhamento por familiares e cuidadores.
- **Notificações multi-canal:** integração com WhatsApp, SMS e web push para reforçar alertas.
- **Planos e assinaturas:** estrutura preparada para cobrança, limites por plano e integrações de checkout/webhook.
- **Área administrativa:** visualização de métricas e suporte ao gerenciamento da aplicação.
- **Experiência web moderna:** autenticação, recuperação de senha, landing page e fluxo protegido para uso contínuo.

## 🏗️ Arquitetura

O projeto segue uma abordagem modular, centrada em separação de responsabilidades e escalabilidade.

- **Frontend (`apps/web`):** aplicação web em React + Vite + TypeScript.
- **Backend (`apps/api`):** API em NestJS responsável por regras de negócio e integrações.
- **Dados:** persistência em PostgreSQL com Prisma para modelagem e acesso ao banco.
- **Autenticação:** identidade e sessões geridas com Supabase Auth.
- **Integrações externas:** WhatsApp, SMS, notificações web e serviços financeiros conforme o ambiente.
- **Monorepo:** organização com pnpm workspaces e Turborepo para manter um projeto escalável e sustentável.

## 🧰 Stack tecnológica

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query |
| Backend | NestJS 11, TypeScript, Passport/JWT |
| Banco de dados | PostgreSQL, Prisma 7, `@prisma/adapter-pg` |
| Autenticação | Supabase Auth |
| Validação compartilhada | Zod |
| Monorepo | pnpm workspaces, Turborepo |
| Integrações | WhatsApp Cloud API, Twilio, Web Push, pagamentos e serviços externos |

## 🚀 Como executar

### Pré-requisitos

- **Node.js 22.x**
- **pnpm 11.17.0**
- Instância de **PostgreSQL** acessível
- Projeto **Supabase** configurado para autenticação

Recursos opcionais, como WhatsApp, SMS, e-mail, web push e pagamentos, exigem credenciais adicionais e não são obrigatórios para executar a base da aplicação.

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

Para rodar apenas um serviço:

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
│   ├── api/        # API NestJS, Prisma e migrações do banco
│   └── web/        # Aplicação web em React + Vite
├── packages/
│   └── shared/     # Tipos e validações compartilhadas
├── package.json    # Scripts e configuração do workspace
├── pnpm-workspace.yaml
├── turbo.json      # Pipeline do monorepo
├── pnpm-lock.yaml
├── README.md
└── .gitignore
```

## 🛣️ Roadmap

- [ ] refinamento da experiência de onboarding e autenticação;
- [ ] gestão avançada de lembretes e recorrência de doses;
- [ ] relatórios e acompanhamento de aderência ao tratamento;
- [ ] integração com canais de comunicação mais amplos;
- [ ] expansão de dashboards para supervisão familiar e administrativa;
- [ ] melhorias na experiência mobile e usabilidade em produção.

## 🔐 Configuração e segurança

- mantenha segredos e chaves privadas apenas no backend;
- utilize credenciais separadas para desenvolvimento e produção;
- configure URLs de origem, webhooks e integrações de acordo com o ambiente;
- ative somente serviços externos devidamente configurados;
- nunca exponha chaves sensíveis no frontend ou em repositórios públicos.

## 📄 Licença

Este repositório não declara uma licença open source. Antes de reutilizar, distribuir ou adaptar o projeto, consulte o responsável pela manutenção do código.

---

<div align="center">

Feito para apoiar uma rotina de cuidado mais simples, segura e organizada.

</div>

# PARCENDi CRM 5.0

Uma plataforma completa de CRM Multi-Tenant pronta para produção, construída com Next.js 15, TypeScript, Supabase e PostgreSQL.

## 🚀 Stack Técnico

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling utilities
- **Shadcn UI** - Componentes UI acessíveis
- **Recharts** - Visualização de dados

### Backend & Banco de Dados
- **Supabase** - Backend BaaS com autenticação
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Isolamento multi-tenant

### Integrações
- **WhatsApp Business API** (em implementação)
- **Meta Ads** (em implementação)
- **Google Ads** (em implementação)

## 📋 Módulos Implementados

### Fase 1 (Concluída)
- ✅ Autenticação & Multi-Tenant
- ✅ Schema PostgreSQL completo
- ✅ RLS Policies
- ✅ Leads CRUD
- ✅ Businesses CRUD
- ✅ Customers CRUD
- ✅ Dashboards com gráficos
- ✅ APIs REST completas

### Fase 2 (Em Desenvolvimento)
- 🔄 Documents Management
- 🔄 Commissions System
- 🔄 Cross-Sell Opportunities
- 🔄 Renewals Automation
- 🔄 Tasks & Communications

## 🔐 Perfis de Usuário

1. **ADMIN_CEO** - Acesso total, gestão de configurações críticas
2. **DIRECAO** - Acesso global, sem alterar configurações críticas
3. **OPERADORA** - Apenas leads e negócios atribuídos
4. **ESPECIALISTA** - Apenas processos atribuídos
5. **UNIDADE** - Apenas dados da sua unidade
6. **FRANQUIA** - Acesso extremamente limitado
7. **PARCEIRO_EXTERNO** - Acesso mínimo

## 📁 Estrutura de Pastas

```
├── app/
│   ├── api/                    # API Routes (Next.js)
│   │   ├── leads/
│   │   ├── businesses/
│   │   ├── customers/
│   │   └── ...
│   ├── dashboard/              # Dashboard principal
│   ├── leads/                  # Página de leads
│   ├── deals/                  # Página de negócios
│   ├── customers/              # Página de clientes
│   └── layout.tsx              # Root layout
│
├── components/
│   ├── common/                 # Componentes reutilizáveis
│   ├── leads/                  # Componentes específicos de leads
│   ├── deals/                  # Componentes de negócios
│   ├── dashboards/             # Dashboards e gráficos
│   └── ui/                     # Shadcn UI components
│
├── lib/
│   ├── supabase/               # Configuração Supabase
│   │   ├── client.ts           # Cliente browser
│   │   └── server.ts           # Cliente servidor
│   ├── services/               # Lógica de negócio
│   │   ├── leads.ts
│   │   ├── businesses.ts
│   │   ├── customers.ts
│   │   └── auth.ts
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # Definições de tipos TypeScript
│   ├── validators/             # Validação com Zod
│   └── constants/              # Constantes da aplicação
│
├── public/                     # Assets estáticos
├── supabase/
│   ├── migrations/             # Migrações SQL
│   │   ├── 001_initial_schema.sql
│   │   └── 002_rls_policies.sql
│   └── seed.sql                # Dados de exemplo
│
└── package.json
```

## 🔧 Instalação & Setup

### Pré-requisitos
- Node.js 18+
- pnpm (ou npm/yarn)
- Conta Supabase

### 1. Clonar o Projeto
```bash
git clone <repo-url>
cd parcendi-crm-50
```

### 2. Instalar Dependências
```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Editar `.env.local` com suas credenciais Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Setup do Banco de Dados
```bash
# No painel Supabase, executar as migrações:
# 1. SQL Editor -> New Query
# 2. Copiar conteúdo de: supabase/migrations/001_initial_schema.sql
# 3. Executar
# 4. Repetir para: supabase/migrations/002_rls_policies.sql
```

### 5. Seed de Dados (Opcional)
```bash
# SQL Editor -> New Query
# Copiar conteúdo de: supabase/seed.sql
# Executar
```

### 6. Executar em Desenvolvimento
```bash
pnpm dev
```

Abra http://localhost:3000

## 📊 Estrutura de Dados

### Tabelas Principais

**leads** - Gestão de potenciais clientes
- Origem (Website, WhatsApp, Meta Ads, etc)
- Segmento (Energia, Telecom, Crédito, Imobiliário, Seguros)
- Estado do pipeline
- Score de qualidade
- Histórico de interações

**businesses** - Oportunidades de negócio
- Vinculação com lead
- Valor de faturação
- Comissões
- Estado no pipeline
- Responsável e executor

**customers** - Base de clientes
- Informações de contacto
- Segmento
- Histórico de negócios

**documents** - Gestão de documentação
- Tipo de documento
- Estado (Validado, Inválido, etc)
- Histórico de mudanças
- Conformidade RGPD

**commissions** - Cálculo de comissões
- Comissão bruta/líquida
- Repartição por roles
- Retenções (marketing, social)
- Estado (Prevista, Paga, etc)

## 🔄 Fluxos de Automação

1. **Nova Lead** → Criar tarefa de contacto automaticamente
2. **Sem Contacto** → Alerta no dashboard
3. **Documentação Recebida** → Criar tarefa de análise
4. **Proposta Enviada** → Agendar follow-up
5. **Renovação** → Criar tarefa automática + alerta
6. **Cross-sell** → Novo negócio vinculado

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# 1. Push para GitHub
git push origin main

# 2. Conectar com Vercel
# https://vercel.com/dashboard

# 3. Configurar variáveis de ambiente
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 📱 APIs Disponíveis

### Leads
- `GET /api/leads` - Listar leads
- `POST /api/leads` - Criar lead
- `GET /api/leads/[id]` - Obter detalhe
- `PATCH /api/leads/[id]` - Atualizar
- `DELETE /api/leads/[id]` - Soft delete

### Businesses
- `GET /api/businesses` - Listar negócios
- `POST /api/businesses` - Criar negócio
- `GET /api/businesses/[id]` - Detalhe
- `PATCH /api/businesses/[id]` - Atualizar
- `DELETE /api/businesses/[id]` - Soft delete

### Customers
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Criar cliente
- `GET /api/customers/[id]` - Detalhe
- `PATCH /api/customers/[id]` - Atualizar
- `DELETE /api/customers/[id]` - Soft delete

## 🔐 Permissões (RLS)

Cada tabela tem políticas RLS que garantem:
- Isolamento multi-tenant (cada organização vê apenas seus dados)
- Isolamento por role (operadores veem apenas dados atribuídos)
- Isolamento por unidade (unidades veem apenas seus dados)

## 📚 Documentação

- [Types](./lib/types/index.ts) - Definições de tipos
- [Constants](./lib/constants/index.ts) - Valores constantes
- [Validators](./lib/validators/index.ts) - Schemas de validação
- [Services](./lib/services/) - Lógica de negócio

## 🐛 Troubleshooting

### Erro de autenticação
- Verificar variáveis de ambiente `.env.local`
- Garantir que RLS está ativa em Supabase

### Erro de RLS Policy
- Verificar se `user_profiles` tem entrada para o usuário
- Confirmar que `organization_id` está preenchido

### Dados não aparecem
- Verificar console para erros
- Validar permissões no Supabase
- Confirmar dados existem no banco

## 🤝 Contribuindo

1. Criar branch: `git checkout -b feature/nova-feature`
2. Commit: `git commit -am 'Adicionar nova feature'`
3. Push: `git push origin feature/nova-feature`
4. Abrir Pull Request

## 📝 Licença

Proprietary - PARCENDi

## 📞 Suporte

Para dúvidas e sugestões, contactar a equipa de desenvolvimento.

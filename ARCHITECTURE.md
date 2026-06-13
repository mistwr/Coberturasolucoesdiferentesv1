# 🏗️ Architecture Overview - PARCENDi CRM 5.0

Documentação arquitetural completa do PARCENDi CRM 5.0.

## 📐 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                       │
│  Next.js 15 Frontend (TypeScript + React + Tailwind)            │
│  - Dashboard com gráficos (Recharts)                            │
│  - Componentes React reutilizáveis                              │
│  - Client-side SWR para data fetching                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTP/JSON via API
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      API Layer                                  │
│  Next.js App Router (/app/api/*)                                │
│  - REST endpoints                                               │
│  - Input validation (Zod)                                       │
│  - Authentication checks                                        │
│  - Error handling                                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    Business Logic Layer                         │
│  Services (/lib/services/*)                                     │
│  - Leads, Businesses, Customers, etc                            │
│  - Database operations                                          │
│  - Business rule enforcement                                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                  Data Access Layer (ORM)                        │
│  Supabase JavaScript Client                                     │
│  - Query builder                                                │
│  - Type-safe operations                                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                  Database Layer                                 │
│  PostgreSQL via Supabase                                        │
│  - RLS policies (multi-tenant security)                         │
│  - 25+ tables (normalized schema)                               │
│  - Soft delete support                                          │
│  - Audit trail logging                                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🗂️ Estrutura de Diretórios

### Root Level
```
parcendi-crm-50/
├── app/                          # Next.js App Router
├── components/                   # React components
├── lib/                         # Shared utilities & services
├── public/                      # Static assets
├── supabase/                    # Database migrations & seed
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── README.md                    # Documentação principal
├── QUICKSTART.md               # Guia de setup
├── API_REFERENCE.md            # Documentação de APIs
├── INTEGRATIONS.md             # Guia de integrações
└── ARCHITECTURE.md             # Este ficheiro
```

### `/app` - Next.js Application

```
app/
├── api/                         # API routes
│   ├── leads/
│   │   ├── route.ts            # GET /api/leads, POST /api/leads
│   │   └── [id]/route.ts       # GET, PATCH, DELETE /api/leads/:id
│   ├── businesses/
│   ├── customers/
│   ├── tasks/
│   ├── commissions/
│   ├── documents/
│   └── webhooks/               # Webhook endpoints (WhatsApp, Meta, etc)
│
├── dashboard/
│   └── page.tsx                # Dashboard principal
│
├── leads/
│   └── page.tsx                # Página de leads
│
├── deals/
│   └── page.tsx                # Página de negócios
│
├── [outros módulos]/
│   └── page.tsx
│
├── layout.tsx                  # Root layout
└── globals.css                 # Global styles
```

### `/components` - React Components

```
components/
├── ui/                         # Shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   └── ...
│
├── common/                     # Shared components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   └── ...
│
├── leads/
│   ├── LeadsList.tsx           # Table listing
│   ├── LeadForm.tsx            # Create/Edit form
│   └── ...
│
├── deals/
├── customers/
├── dashboards/
│   ├── DashboardOverview.tsx   # Main dashboard
│   ├── PipelineChart.tsx
│   └── ...
│
└── forms/                      # Reusable forms
```

### `/lib` - Business Logic & Utilities

```
lib/
├── supabase/
│   ├── client.ts               # Browser client
│   └── server.ts               # Server client (SSR)
│
├── services/                   # Database operations
│   ├── auth.ts                 # Authentication
│   ├── leads.ts                # Leads CRUD
│   ├── businesses.ts           # Businesses CRUD
│   ├── customers.ts            # Customers CRUD
│   ├── tasks.ts                # Tasks CRUD
│   ├── communications.ts       # Communications CRUD
│   ├── commissions.ts          # Commissions CRUD
│   ├── documents.ts            # Documents CRUD
│   └── ...
│
├── hooks/
│   ├── useAuth.ts              # Auth hook
│   ├── useLeads.ts             # Leads hook
│   └── ...
│
├── types/
│   └── index.ts                # TypeScript types
│
├── validators/
│   └── index.ts                # Zod schemas
│
├── constants/
│   └── index.ts                # App constants
│
└── utils/
    └── cn.ts                   # Utility functions
```

### `/supabase` - Database

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql  # Tables, indexes
│   └── 002_rls_policies.sql    # Row Level Security
│
└── seed.sql                    # Demo data
```

## 🔐 Multi-Tenant Architecture

### Isolamento de Dados

Cada organização (tenant) tem seus próprios dados completamente isolados:

```
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Database                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Organization: PARCENDi                              │  │
│  │  - Users: 50                                         │  │
│  │  - Leads: 1000                                       │  │
│  │  - Businesses: 150                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Organization: ClienteXYZ                            │  │
│  │  - Users: 25                                         │  │
│  │  - Leads: 500                                        │  │
│  │  - Businesses: 75                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Organization: OutraEmpresa                          │  │
│  │  - Users: 100                                        │  │
│  │  - Leads: 2000                                       │  │
│  │  - Businesses: 300                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### RLS Policies

Todas as tabelas têm RLS policies que garantem:

1. **Isolamento por Organização**
   ```sql
   -- User só vê dados da sua organização
   organization_id = get_user_org_id()
   ```

2. **Isolamento por Role**
   ```sql
   -- OPERADORA só vê leads atribuídos a si
   responsavel_id = auth.uid() OR role = 'ADMIN_CEO'
   ```

3. **Isolamento por Unit**
   ```sql
   -- UNIDADE só vê dados da sua unidade
   unit_id = get_user_unit_id()
   ```

## 🗄️ Schema PostgreSQL

### Tabelas Principais

#### `organizations`
Multi-tenant parent. Cada organização é um tenant.
```sql
id, name, slug, logo_url, created_at, updated_at, created_by, deleted_at
```

#### `user_profiles`
Sincroniza com Supabase Auth. Cada user tem um perfil e role.
```sql
id (FK auth.users), organization_id, unit_id, email, full_name, 
avatar_url, role, active, created_at, updated_at, deleted_at
```

#### `leads`
Potenciais clientes. Múltiplas origens (Website, WhatsApp, Meta, etc).
```sql
id, organization_id, unit_id, id_parcendi (unique), nome, email, 
telefone, origem, segmento, responsavel_id, estado, score, 
rgpd_consent, tags[], notas, created_at, updated_at, created_by, deleted_at
```

#### `businesses`
Oportunidades de negócio vinculadas a leads.
```sql
id, organization_id, unit_id, lead_id, customer_id, segmento, 
estado, valor_faturacao, comissao_bruta, responsavel_id, executor_id, 
data_prevista_fechamento, data_real_fechamento, notas, 
created_at, updated_at, created_by, deleted_at
```

#### `customers`
Base de clientes (leads convertidas).
```sql
id, organization_id, unit_id, nome, email, telefone, segmento, 
nif, morada, created_at, updated_at, created_by, deleted_at
```

#### `commissions`
Cálculo de comissões por negócio.
```sql
id, organization_id, business_id, comissao_bruta, comissao_liquida, 
comissao_parcendi, comissao_originador, comissao_executor, 
comissao_unidade, retencao_marketing, retencao_social, bonus_recrutamento,
estado, created_at, updated_at, deleted_at
```

#### `documents`
Gestão de documentos com RGPD compliance.
```sql
id, organization_id, business_id, customer_id, tipo_documento, 
estado, storage_path, upload_by, upload_date, historico (JSONB), 
created_at, updated_at, deleted_at
```

#### `tasks`
Tarefas e follow-ups automáticos.
```sql
id, organization_id, unit_id, titulo, descricao, atribuido_a, 
prioridade, estado, data_prazo, lead_id, business_id, customer_id, 
created_at, updated_at, created_by, deleted_at
```

#### `communications`
Histórico de comunicações (Email, WhatsApp, SMS, etc).
```sql
id, organization_id, lead_id, business_id, customer_id, tipo, 
canal, assunto, conteudo, status, data_agendada, criado_por, 
created_at, updated_at, deleted_at
```

#### `cross_sells`
Oportunidades de cross-sell entre segmentos.
```sql
id, organization_id, customer_id, business_origem_id, 
segmento_origem, segmento_destino, originador_id, executor_id, 
potencial_faturacao, estado, created_at, updated_at, deleted_at
```

#### `renewals`
Monitorização de renovações de contratos.
```sql
id, organization_id, business_id, customer_id, data_termino_contrato, 
dias_antecedencia, estado, oportunidade_cross_sell, 
created_at, updated_at, deleted_at
```

#### `audit_trail`
Rastreamento de todas as mudanças (compliance).
```sql
id, organization_id, usuario_id, tabela, registro_id, tipo_acao, 
dados_anteriores (JSONB), dados_novos (JSONB), timestamp
```

## 🔄 Data Flow

### Flow de Criação de Lead

```
1. User clica "New Lead"
   ↓
2. Form submission
   ↓
3. POST /api/leads
   ↓
4. Validação com Zod
   ↓
5. createLead service
   ↓
6. Supabase client.from("leads").insert()
   ↓
7. RLS policy verifica organization_id
   ↓
8. INSERT em leads table
   ↓
9. Trigger opcional: criar tarefa automática
   ↓
10. Response com dados do lead criado
   ↓
11. Update UI (React state/SWR revalidation)
```

### Flow de Atualização de Pipeline

```
1. User arrasta lead para "Proposta Enviada"
   ↓
2. PATCH /api/leads/:id com novo estado
   ↓
3. Validação de permissões
   ↓
4. updateLead service
   ↓
5. Supabase client.from("leads").update()
   ↓
6. RLS policy verifica acesso
   ↓
7. UPDATE leads table, set deleted_at = null (se era soft-deleted)
   ↓
8. Trigger: criar communication "PROPOSTA_ENVIADA"
   ↓
9. Trigger: criar task "Follow-up agendado"
   ↓
10. Response com lead atualizado
```

## 🔐 Autenticação & Autorização

### Flow de Login

```
1. User acede a http://localhost:3000
   ↓
2. Redirect para /auth/login
   ↓
3. Supabase Auth UI ou form custom
   ↓
4. signIn(email, password)
   ↓
5. Supabase autentica contra auth.users
   ↓
6. JWT token retornado
   ↓
7. Token guardado em cookie (httpOnly)
   ↓
8. Redirect para /dashboard
   ↓
9. getCurrentUser() carrega user_profiles
   ↓
10. Render página com contexto do user
```

### Verificação de Permissões

```
Para cada requisição:
1. Bearer token extraído do header
2. Supabase valida JWT
3. auth.uid() retorna ID do user
4. user_profiles carregado via RLS
5. Role verificado: ADMIN_CEO? DIRECAO? OPERADORA?
6. Endpoint executado com contexto seguro
```

## 📊 Performance Considerations

### Indexes
- Criados em `organization_id`, `unit_id`, `responsavel_id`
- Full-text search em `nome`, `email` para leads/customers

### Query Optimization
- Selects específicos (não SELECT *)
- Limit/offset para paginação
- RLS reduz dados por padrão

### Caching Estratégias
- SWR no cliente para revalidação automática
- ISR (Incremental Static Regeneration) para dashboards

## 🚀 Deployment

### Ambiente
```
Development:  localhost:3000    (pnpm dev)
Staging:      staging.domain    (Vercel)
Production:   crm.domain        (Vercel)
```

### CI/CD Pipeline
```
Git push
  ↓
GitHub Actions (opcional)
  ↓
Vercel deploy
  ↓
Build & lint checks
  ↓
Deploy preview
  ↓
Merge to main → Production deployment
```

### Environment Variables
```
Production (Vercel):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- API Keys das integrações
```

## 🛡️ Security Measures

1. **RLS Policies** - Isolamento multi-tenant
2. **Input Validation** - Zod schemas
3. **CORS** - Supabase handled
4. **HTTPS** - Always in production
5. **Rate Limiting** - TODO: Implementar com Upstash
6. **RGPD** - Soft delete, audit trail, consent tracking
7. **Secrets Management** - Environment variables, never hardcoded

## 🔌 Extensibility

### Adicionar Novo Módulo

1. **Criar SQL table** em `supabase/migrations/`
2. **Criar TypeScript type** em `lib/types/`
3. **Criar service** em `lib/services/`
4. **Criar API route** em `app/api/`
5. **Criar component** em `components/`
6. **Criar page** em `app/`

### Adicionar Nova Integração

1. **Criar webhook route** em `app/api/webhooks/`
2. **Implementar sincronização** de dados
3. **Registar no Supabase** ou plataforma externa
4. **Testar e documentar** em `INTEGRATIONS.md`

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

**Desenvolvido com ❤️ usando Next.js, TypeScript e Supabase**

# 🚀 Setup Rápido - PARCENDi CRM 5.0

Siga este guia passo a passo para configurar o PARCENDi CRM em seu ambiente local.

## Pré-requisitos

- Node.js 18+ instalado
- Conta Supabase (gratuita em https://supabase.com)
- Git instalado

## 📝 Passo 1: Clonar e Instalar

```bash
# Clonar o repositório
git clone <repo-url>
cd parcendi-crm-50

# Instalar dependências
pnpm install
```

## 🔐 Passo 2: Configurar Supabase

### 2.1 Criar Projeto Supabase

1. Ir para https://app.supabase.com
2. Clique em "New Project"
3. Escolha um nome (ex: `parcendi-crm-dev`)
4. Defina uma senha (salve em local seguro!)
5. Clique em "Create new project" (demora ~2 minutos)

### 2.2 Obter Credenciais

1. No projeto Supabase, ir para **Settings → API**
2. Copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` (em API keys) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2.3 Criar Arquivo `.env.local`

```bash
# Copiar template
cp .env.example .env.local

# Editar com suas credenciais
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 🗄️ Passo 3: Executar Migrações SQL

### 3.1 Abrir SQL Editor no Supabase

1. No painel Supabase → **SQL Editor**
2. Clique em **New Query**

### 3.2 Executar Schema Principal

```bash
# 1. Copiar TODO o conteúdo de: supabase/migrations/001_initial_schema.sql
# 2. Colar no SQL Editor do Supabase
# 3. Clique em "Run"
# ✅ Aguardar "Success"
```

### 3.3 Executar RLS Policies

```bash
# 1. Copiar TODO o conteúdo de: supabase/migrations/002_rls_policies.sql
# 2. Colar num NOVO Query do Supabase
# 3. Clique em "Run"
# ✅ Aguardar "Success"
```

### 3.4 Carregar Dados de Exemplo

```bash
# 1. Copiar TODO o conteúdo de: supabase/seed.sql
# 2. Colar num NOVO Query do Supabase
# 3. Clique em "Run"
# ✅ Aguardar "Success"
```

## 👥 Passo 4: Criar Usuário de Teste

### 4.1 No Painel Supabase

1. Ir para **Authentication → Users**
2. Clique em **Add user**
3. Preencha:
   - Email: `admin@parcendi.com`
   - Password: (qualquer senha)
4. Clique em **Create user**

### 4.2 Copiar ID do Usuário

1. Clique no utilizador criado
2. Copie o **User ID** (UUID)
3. Guarde para o passo 4.3

### 4.3 Atualizar ID nos Seeds

1. SQL Editor → New Query
2. Execute:

```sql
-- Substituir 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' com o ID copiado
UPDATE user_profiles 
SET id = 'SEU_USER_ID_AQUI'
WHERE email = 'admin@parcendi.com';
```

## 🎮 Passo 5: Testar Localmente

### 5.1 Iniciar Dev Server

```bash
pnpm dev
```

### 5.2 Abrir no Browser

- Abra: http://localhost:3000
- Você será redirecionado para login

### 5.3 Fazer Login

- Email: `admin@parcendi.com`
- Password: (a senha que definiu no passo 4.1)

### 5.4 Explorar

✅ **Você conseguirá:**
- ✅ Ver Dashboard com gráficos
- ✅ Aceder a Leads
- ✅ Criar novo Lead
- ✅ Ver Businesses
- ✅ Navegar entre módulos

## 🔧 Troubleshooting

### Erro: "Unauthorized" no login

**Solução:**
1. Verificar que `.env.local` está correto
2. Confirmar que as credenciais Supabase foram copiadas corretamente
3. Verificar que o utilizador foi criado em Supabase

### Erro: "RLS violation" ao carregar dados

**Solução:**
1. Confirmar que RLS policies (002_rls_policies.sql) foram executadas
2. Verificar que `user_profiles` tem uma entrada para o utilizador
3. Garantir que `organization_id` está preenchido

### Erro: "relation ... does not exist"

**Solução:**
1. Confirmar que schema (001_initial_schema.sql) foi executado
2. Verificar SQL Editor para erros

### Dados de exemplo não aparecem

**Solução:**
1. Confirmar que seed.sql foi executado
2. Verificar que os IDs das foreign keys estão corretos

## 📊 Próximos Passos

Após confirmação que está tudo funcionando:

1. **Explorar Dashboard** - Ver gráficos e KPIs
2. **Criar Leads** - Adicione dados de teste
3. **Gestão de Equipa** - Configure utilizadores com diferentes roles
4. **Integrações** - Configure WhatsApp, Meta Ads, etc (ver INTEGRATIONS.md)
5. **Deploy** - Publique em Vercel

## 🚀 Deploy em Vercel

```bash
# 1. Push para GitHub
git push origin main

# 2. Conectar em Vercel
# https://vercel.com/new → Importar repositório

# 3. Configurar Environment Variables
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Deploy automático quando push para main
```

## 📚 Recursos

- [README.md](./README.md) - Documentação completa
- [INTEGRATIONS.md](./INTEGRATIONS.md) - Guia de APIs externas
- [lib/types/index.ts](./lib/types/index.ts) - Definições de tipos
- [supabase/migrations/](./supabase/migrations/) - Scripts SQL

## 💬 Suporte

Se encontrar problemas:

1. Verificar [TROUBLESHOOTING](./README.md#-troubleshooting)
2. Consultar logs: `pnpm dev` (terminal)
3. Verificar Supabase Console
4. Contactar equipa de desenvolvimento

---

**🎉 Parabéns! PARCENDi CRM está pronto para uso!**

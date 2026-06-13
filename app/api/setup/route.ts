import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'
import { NextResponse } from 'next/server'

// Rota de setup única — cria schema + utilizador admin
// Aceder: GET /api/setup  (remover depois do primeiro uso)
export async function GET() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const dbUrl = process.env.POSTGRES_URL_NON_POOLING!

  if (!serviceRoleKey || !supabaseUrl || !dbUrl) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const results: Record<string, string> = {}

  // 1. Criar schema via postgres directo
  try {
    const sql = postgres(dbUrl, { ssl: 'require' })

    await sql`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT,
        full_name TEXT,
        role TEXT NOT NULL DEFAULT 'OPERADORA'
          CHECK (role IN ('ADMIN_CEO','DIRECAO','OPERADORA','ESPECIALISTA','UNIDADE','FRANQUIA','PARCEIRO_EXTERNO')),
        unidade TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`

    // Drop e recriar políticas
    await sql`DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles`
    await sql`DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles`
    await sql`DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles`
    await sql`DROP POLICY IF EXISTS "profiles_admin_all"  ON public.profiles`

    await sql`CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)`
    await sql`CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id)`
    await sql`CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id)`
    await sql`
      CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN_CEO','DIRECAO'))
      )
    `

    // Trigger para criar perfil automaticamente
    await sql`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (NEW.id, NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
          COALESCE(NEW.raw_user_meta_data->>'role', 'OPERADORA'))
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
      END;
      $$
    `
    await sql`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`
    await sql`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()
    `

    await sql.end()
    results.schema = 'OK — tabela profiles + trigger criados'
  } catch (e: unknown) {
    results.schema = `ERRO: ${e instanceof Error ? e.message : String(e)}`
  }

  // 2. Criar utilizador admin via Supabase Auth Admin API
  const adminEmail = 'netmikeejj@gmail.com'
  const adminPassword = 'Parcendi2025!'

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    // Verificar se já existe
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers()
    const alreadyExists = existing?.users?.some((u) => u.email === adminEmail)

    if (alreadyExists) {
      results.admin_user = `EXISTE — ${adminEmail} já está registado`
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // confirmar email automaticamente
        user_metadata: {
          full_name: 'Admin CEO',
          role: 'ADMIN_CEO',
        },
      })

      if (error) {
        results.admin_user = `ERRO: ${error.message}`
      } else {
        results.admin_user = `OK — utilizador criado: ${data.user?.email}`

        // Inserir perfil manualmente (caso o trigger não corra)
        if (data.user?.id) {
          await supabaseAdmin.from('profiles').upsert({
            id: data.user.id,
            email: adminEmail,
            full_name: 'Admin CEO',
            role: 'ADMIN_CEO',
          })
          results.admin_profile = 'OK — perfil ADMIN_CEO inserido'
        }
      }
    }
  } catch (e: unknown) {
    results.admin_user = `ERRO: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json({
    message: 'Setup PARCENDi CRM concluido',
    results,
    credentials: {
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN_CEO',
    },
  })
}

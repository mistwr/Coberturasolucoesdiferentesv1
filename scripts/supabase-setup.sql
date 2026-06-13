-- ============================================================
-- PARCENDi CRM 5.0 - Script de Setup do Supabase
-- Cole este script no SQL Editor do Supabase Dashboard
-- https://supabase.com/dashboard/project/csszqelialqykcaqrqxk/sql/new
-- ============================================================

-- 1. Criar tabela de perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  role        TEXT        NOT NULL DEFAULT 'OPERADORA'
                CHECK (role IN ('ADMIN_CEO','DIRECAO','OPERADORA','ESPECIALISTA','UNIDADE','FRANQUIA','PARCEIRO_EXTERNO')),
  unidade     TEXT,
  active      BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all"  ON public.profiles;

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('ADMIN_CEO','DIRECAO')
    )
  );

-- 4. Trigger: cria perfil automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'OPERADORA')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. Criar utilizador Admin CEO: netmikeejj@gmail.com
--
-- ATENÇÃO: O Supabase não permite criar utilizadores via SQL puro.
-- Para criar o utilizador admin, use o Authentication Dashboard:
--
-- 1. Vá a: https://supabase.com/dashboard/project/csszqelialqykcaqrqxk/auth/users
-- 2. Clique em "Add user" → "Create new user"
-- 3. Email:    netmikeejj@gmail.com
-- 4. Password: PARCENDi2025!
-- 5. Marque "Auto Confirm User"
-- 6. Clique "Create User"
--
-- Depois de criar o utilizador, copie o UUID dele e corra:
-- (substitua <USER_UUID> pelo UUID real)
-- ============================================================

-- Cole este bloco DEPOIS de criar o utilizador no dashboard:
/*
INSERT INTO public.profiles (id, email, full_name, role, active)
VALUES (
  '<USER_UUID>',       -- substitua pelo UUID do utilizador criado
  'netmikeejj@gmail.com',
  'Admin CEO',
  'ADMIN_CEO',
  true
)
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Admin CEO',
  role      = 'ADMIN_CEO',
  active    = true;
*/

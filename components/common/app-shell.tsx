import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from './app-sidebar'
import { AppTopbar } from './app-topbar'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Tentar buscar perfil (pode ainda não existir se schema não foi criado)
  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle()
    : { data: null }

  const fullName = profile?.full_name ?? user?.user_metadata?.full_name ?? null

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <AppSidebar
        userEmail={user?.email ?? null}
        userFullName={fullName}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

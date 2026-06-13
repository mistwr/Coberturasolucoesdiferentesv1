'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCircle,
  FileText,
  Wallet,
  Repeat,
  RefreshCw,
  CheckSquare,
  MessageSquare,
  UsersRound,
  Handshake,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/deals', label: 'Negócios', icon: Briefcase },
  { href: '/customers', label: 'Clientes', icon: UserCircle },
  { href: '/documents', label: 'Documentos', icon: FileText },
  { href: '/commissions', label: 'Comissões', icon: Wallet },
  { href: '/cross-sell', label: 'Cross-Sell', icon: Repeat },
  { href: '/renewals', label: 'Renovações', icon: RefreshCw },
  { href: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { href: '/communications', label: 'Comunicação', icon: MessageSquare },
  { href: '/teams', label: 'Equipas', icon: UsersRound },
  { href: '/partners', label: 'Parceiros', icon: Handshake },
  { href: '/settings', label: 'Definições', icon: Settings },
]

interface AppSidebarProps {
  userEmail?: string | null
  userFullName?: string | null
}

export function AppSidebar({ userEmail, userFullName }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = userFullName
    ? userFullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail?.slice(0, 2).toUpperCase() ?? 'AD'

  const displayName = userFullName ?? userEmail ?? 'Admin CEO'
  const displayEmail = userEmail ?? 'admin@parcendi.pt'

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
          P
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">PARCENDi</span>
          <span className="text-xs text-sidebar-foreground/60">CRM 5.0</span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Utilizador + logout */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
            {initials}
          </div>
          <div className="flex flex-col leading-tight min-w-0 flex-1">
            <span className="text-sm font-medium truncate">{displayName}</span>
            <span className="text-xs text-sidebar-foreground/60 truncate">{displayEmail}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Terminar sessão"
            className="shrink-0 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

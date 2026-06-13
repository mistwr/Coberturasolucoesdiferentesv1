'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bell, Menu } from 'lucide-react'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'Leads',
  '/deals': 'Negócios',
  '/customers': 'Clientes',
  '/documents': 'Documentos',
  '/commissions': 'Comissões',
  '/cross-sell': 'Cross-Sell',
  '/renewals': 'Renovações',
  '/tasks': 'Tarefas',
  '/communications': 'Comunicação',
  '/teams': 'Equipas',
  '/partners': 'Parceiros',
  '/settings': 'Definições',
}

export function AppTopbar() {
  const pathname = usePathname()
  const title = titles[pathname] ?? 'PARCENDi CRM'

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold md:hidden"
          aria-label="PARCENDi"
        >
          P
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Pesquisar..."
            className="h-9 w-48 rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring lg:w-64"
          />
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}

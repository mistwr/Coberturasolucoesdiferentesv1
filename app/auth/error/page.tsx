import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--sidebar)] px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/20 text-destructive">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Erro de autenticação</h1>
          <p className="text-white/60 mt-2">Ocorreu um problema ao iniciar sessão. Por favor tente novamente.</p>
        </div>
        <Button asChild>
          <Link href="/auth/login">Voltar ao login</Link>
        </Button>
      </div>
    </div>
  )
}

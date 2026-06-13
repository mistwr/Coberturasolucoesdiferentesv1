import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function ModulePlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">Módulo {title}</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Este módulo está pronto na arquitetura e ligado à base de dados. O
            ecrã detalhado será apresentado aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

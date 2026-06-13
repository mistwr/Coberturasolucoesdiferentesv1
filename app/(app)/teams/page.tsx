import { UsersRound } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/module-placeholder'

export default function TeamsPage() {
  return (
    <ModulePlaceholder
      icon={UsersRound}
      title="Equipas"
      description="Gestão de equipas, papéis e permissões multi-tenant."
    />
  )
}

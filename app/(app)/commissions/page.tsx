import { Wallet } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/module-placeholder'

export default function CommissionsPage() {
  return (
    <ModulePlaceholder
      icon={Wallet}
      title="Comissões"
      description="Cálculo e repartição de comissões com exportação contabilística."
    />
  )
}

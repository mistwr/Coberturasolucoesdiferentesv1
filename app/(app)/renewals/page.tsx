import { RefreshCw } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/module-placeholder'

export default function RenewalsPage() {
  return (
    <ModulePlaceholder
      icon={RefreshCw}
      title="Renovações"
      description="Monitorização de datas de término e alertas automáticos de renovação."
    />
  )
}

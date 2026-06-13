import { MessageSquare } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/module-placeholder'

export default function CommunicationsPage() {
  return (
    <ModulePlaceholder
      icon={MessageSquare}
      title="Comunicação"
      description="Histórico de emails, WhatsApp e chamadas com cada cliente."
    />
  )
}

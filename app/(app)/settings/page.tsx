import { Settings } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/module-placeholder'

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      icon={Settings}
      title="Definições"
      description="Configuração do tenant, segmentos, integrações e preferências."
    />
  )
}

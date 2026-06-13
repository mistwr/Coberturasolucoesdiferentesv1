import { FileText } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/module-placeholder'

export default function DocumentsPage() {
  return (
    <ModulePlaceholder
      icon={FileText}
      title="Documentos"
      description="Upload, validação e histórico de documentos com conformidade RGPD."
    />
  )
}

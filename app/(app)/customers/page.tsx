import { UserCircle } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/module-placeholder'

export default function CustomersPage() {
  return (
    <ModulePlaceholder
      icon={UserCircle}
      title="Clientes"
      description="Base de clientes com documentos, negócios e renovações associados."
    />
  )
}

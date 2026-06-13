import { CheckSquare } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/module-placeholder'

export default function TasksPage() {
  return (
    <ModulePlaceholder
      icon={CheckSquare}
      title="Tarefas"
      description="Tarefas e follow-ups atribuídos por equipa e responsável."
    />
  )
}

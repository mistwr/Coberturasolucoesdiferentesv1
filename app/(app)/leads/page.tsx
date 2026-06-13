import { LeadsList } from '@/components/leads/LeadsList'

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
        <p className="text-sm text-muted-foreground">
          Gestão e acompanhamento de todas as leads recebidas.
        </p>
      </div>
      <LeadsList />
    </div>
  )
}

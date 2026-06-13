'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search } from 'lucide-react'

type Lead = {
  id: string
  nome: string
  email: string
  telefone: string
  segmento: string
  origem: string
  estado: string
  responsavel: string
}

const SAMPLE_LEADS: Lead[] = [
  { id: 'PCD-1042', nome: 'Ana Marques', email: 'ana.marques@email.pt', telefone: '+351 912 345 678', segmento: 'Energia', origem: 'Website', estado: 'Nova Lead', responsavel: 'João Silva' },
  { id: 'PCD-1041', nome: 'Bruno Costa', email: 'bruno.costa@email.pt', telefone: '+351 933 222 111', segmento: 'Telecom', origem: 'Meta Ads', estado: 'Contactado', responsavel: 'Maria Santos' },
  { id: 'PCD-1040', nome: 'Carla Ferreira', email: 'carla.f@email.pt', telefone: '+351 961 887 766', segmento: 'Seguros', origem: 'WhatsApp', estado: 'Proposta Enviada', responsavel: 'João Silva' },
  { id: 'PCD-1039', nome: 'Diogo Pinto', email: 'diogo.pinto@email.pt', telefone: '+351 915 443 221', segmento: 'Crédito', origem: 'Simuladores', estado: 'Em Análise', responsavel: 'Rui Almeida' },
  { id: 'PCD-1038', nome: 'Eva Rodrigues', email: 'eva.r@email.pt', telefone: '+351 939 110 098', segmento: 'Imobiliário', origem: 'Parceiros', estado: 'Documentação Recebida', responsavel: 'Maria Santos' },
  { id: 'PCD-1037', nome: 'Filipe Sousa', email: 'filipe.sousa@email.pt', telefone: '+351 967 554 332', segmento: 'Energia', origem: 'Upload Faturas', estado: 'Contactar', responsavel: 'Rui Almeida' },
  { id: 'PCD-1036', nome: 'Gabriela Lopes', email: 'gabriela.l@email.pt', telefone: '+351 918 776 554', segmento: 'Telecom', origem: 'Google Ads', estado: 'Contrato Fechado', responsavel: 'João Silva' },
]

const estadoStyles: Record<string, string> = {
  'Nova Lead': 'bg-chart-1/10 text-chart-1',
  'Contactar': 'bg-chart-3/10 text-chart-3',
  'Contactado': 'bg-chart-3/10 text-chart-3',
  'Documentação Recebida': 'bg-chart-2/10 text-chart-2',
  'Em Análise': 'bg-chart-5/10 text-chart-5',
  'Proposta Enviada': 'bg-chart-1/10 text-chart-1',
  'Contrato Fechado': 'bg-chart-2/15 text-chart-2',
}

export function LeadsList() {
  const [query, setQuery] = useState('')

  const filtered = SAMPLE_LEADS.filter((l) =>
    `${l.nome} ${l.email} ${l.segmento} ${l.estado} ${l.id}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar leads..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Lead
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Contacto</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead className="hidden lg:table-cell">Origem</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead) => (
              <TableRow key={lead.id} className="cursor-pointer">
                <TableCell className="font-mono text-xs text-muted-foreground">{lead.id}</TableCell>
                <TableCell className="font-medium">{lead.nome}</TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  <div>{lead.email}</div>
                  <div>{lead.telefone}</div>
                </TableCell>
                <TableCell>{lead.segmento}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{lead.origem}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      estadoStyles[lead.estado] ?? 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {lead.estado}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{lead.responsavel}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

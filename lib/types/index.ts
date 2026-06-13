// Organizations
export interface Organization {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Users
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Leads
export interface Lead {
  id: string;
  id_parcendi: string;
  nome: string;
  telefone: string;
  email: string;
  origem: string;
  segmento: string;
  responsavel: string;
  unidade: string;
  estado: string;
  score: number;
  rgpd_consent: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateLeadInput {
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  segmento: string;
  responsavel?: string;
  unidade?: string;
  rgpd_consent?: boolean;
}

// Businesses (Deals)
export interface Business {
  id: string;
  lead_id: string;
  customer_id?: string;
  segmento: string;
  montante: number;
  moeda: string;
  estado_pipeline: string;
  data_conclusao_prevista?: string;
  responsavel: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Customers
export interface Customer {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nif?: string;
  morada?: string;
  segmento: string;
  score: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Tasks
export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  atribuido_a: string;
  responsavel_original: string;
  estado: string;
  prioridade: string;
  data_prazo?: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateTaskInput {
  titulo: string;
  descricao?: string;
  atribuido_a: string;
  estado?: string;
  prioridade: string;
  data_prazo?: string;
}

// Communications
export interface Communication {
  id: string;
  lead_id?: string;
  business_id?: string;
  customer_id?: string;
  canal: string;
  assunto: string;
  mensagem: string;
  status: string;
  criado_por: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateCommunicationInput {
  lead_id?: string;
  business_id?: string;
  customer_id?: string;
  canal: string;
  assunto: string;
  mensagem: string;
}

// Commissions
export interface Commission {
  id: string;
  business_id: string;
  comissao_bruta: number;
  comissao_liquida: number;
  comissao_parcendi: number;
  comissao_originador: number;
  comissao_executor: number;
  comissao_unidade: number;
  estado: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateCommissionInput {
  business_id: string;
  comissao_bruta: number;
  comissao_liquida: number;
  comissao_parcendi: number;
  comissao_originador?: number;
  comissao_executor?: number;
  comissao_unidade?: number;
}

// Documents
export interface Document {
  id: string;
  business_id?: string;
  customer_id?: string;
  tipo_documento: string;
  estado: string;
  upload_by: string;
  upload_date: string;
  storage_path: string;
  historico?: Array<any>;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateDocumentInput {
  business_id?: string;
  customer_id?: string;
  tipo_documento: string;
}

// Cross-Sell
export interface CrossSell {
  id: string;
  customer_id: string;
  segmento_origem: string;
  segmento_destino: string;
  originador: string;
  executor?: string;
  estado: string;
  potencial_faturacao: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Renewals
export interface Renewal {
  id: string;
  customer_id: string;
  business_id: string;
  data_termino_contrato: string;
  estado: string;
  segmento: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

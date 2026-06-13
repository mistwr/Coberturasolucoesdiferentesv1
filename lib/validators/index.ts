import { z } from 'zod';

export const CreateTaskSchema = z.object({
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  atribuido_a: z.string(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']),
  data_prazo: z.string().optional(),
});

export const UpdateTaskSchema = z.object({
  titulo: z.string().optional(),
  descricao: z.string().optional(),
  atribuido_a: z.string().optional(),
  estado: z.string().optional(),
  prioridade: z.string().optional(),
  data_prazo: z.string().optional(),
});

export const CreateCommissionSchema = z.object({
  business_id: z.string(),
  comissao_bruta: z.number(),
  comissao_liquida: z.number(),
  comissao_parcendi: z.number(),
  comissao_originador: z.number().optional(),
  comissao_executor: z.number().optional(),
});

export const CreateLeadSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  telefone: z.string(),
  origem: z.string(),
  segmento: z.string(),
  responsavel: z.string().optional(),
});

export const CreateBusinessSchema = z.object({
  lead_id: z.string(),
  segmento: z.string(),
  montante: z.number(),
  moeda: z.string().default('EUR'),
  data_conclusao_prevista: z.string().optional(),
});

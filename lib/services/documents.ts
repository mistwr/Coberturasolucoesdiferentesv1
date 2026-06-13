import { supabase } from "@/lib/supabase";
import type { Document, CreateDocumentInput } from "@/lib/types";

export async function getDocuments(organizationId: string, options?: {
  businessId?: string;
  customerId?: string;
  tipo?: string;
  estado?: string;
  limit?: number;
  offset?: number;
}) {
  const client = supabase;
  
  let query = client
    .from("documents")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("upload_date", { ascending: false });

  if (options?.businessId) {
    query = query.eq("business_id", options.businessId);
  }
  
  if (options?.customerId) {
    query = query.eq("customer_id", options.customerId);
  }

  if (options?.tipo) {
    query = query.eq("tipo_documento", options.tipo);
  }

  if (options?.estado) {
    query = query.eq("estado", options.estado);
  }

  if (options?.limit) {
    query = query.range(options.offset || 0, (options.offset || 0) + options.limit - 1);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Document[];
}

export async function getDocumentById(documentId: string) {
  const client = supabase;
  
  const { data, error } = await client
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (error) throw error;
  return data as Document;
}

export async function createDocument(
  organizationId: string,
  userId: string,
  input: CreateDocumentInput,
  storagePath: string
) {
  const client = supabase;
  
  const { data, error } = await client
    .from("documents")
    .insert({
      organization_id: organizationId,
      upload_by: userId,
      storage_path: storagePath,
      estado: "RECEBIDO",
      historico: [
        {
          tipo_acao: "CRIADO",
          usuario_id: userId,
          timestamp: new Date().toISOString(),
        },
      ],
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Document;
}

export async function updateDocumentStatus(documentId: string, newStatus: string, userId: string) {
  const client = supabase;
  
  const document = await getDocumentById(documentId);
  const historico = Array.isArray(document.historico) ? document.historico : [];
  
  historico.push({
    tipo_acao: `STATUS_ALTERADO_PARA_${newStatus}`,
    usuario_id: userId,
    timestamp: new Date().toISOString(),
  });

  const { data, error } = await client
    .from("documents")
    .update({
      estado: newStatus,
      historico,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .select()
    .single();

  if (error) throw error;
  return data as Document;
}

export async function softDeleteDocument(documentId: string) {
  const client = supabase;
  
  const { data, error } = await client
    .from("documents")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .select()
    .single();

  if (error) throw error;
  return data as Document;
}


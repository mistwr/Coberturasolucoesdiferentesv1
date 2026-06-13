import { supabase } from "@/lib/supabase";
import type { Communication, CreateCommunicationInput } from "@/lib/types";

export async function getCommunications(organizationId: string, options?: {
  leadId?: string;
  businessId?: string;
  canal?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const client = supabase;
  
  let query = client
    .from("communications")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (options?.leadId) {
    query = query.eq("lead_id", options.leadId);
  }
  
  if (options?.businessId) {
    query = query.eq("business_id", options.businessId);
  }

  if (options?.canal) {
    query = query.eq("canal", options.canal);
  }

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.limit) {
    query = query.range(options.offset || 0, (options.offset || 0) + options.limit - 1);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Communication[];
}

export async function getCommunicationById(communicationId: string) {
  const client = supabase;
  
  const { data, error } = await client
    .from("communications")
    .select("*")
    .eq("id", communicationId)
    .single();

  if (error) throw error;
  return data as Communication;
}

export async function createCommunication(
  organizationId: string,
  userId: string,
  input: CreateCommunicationInput
) {
  const client = supabase;
  
  const { data, error } = await client
    .from("communications")
    .insert({
      organization_id: organizationId,
      criado_por: userId,
      status: "RASCUNHO",
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Communication;
}

export async function updateCommunication(communicationId: string, updates: Partial<Communication>) {
  const client = supabase;
  
  const { data, error } = await client
    .from("communications")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", communicationId)
    .select()
    .single();

  if (error) throw error;
  return data as Communication;
}

export async function sendCommunication(communicationId: string) {
  return updateCommunication(communicationId, { 
    status: "ENVIADA" as any,
  });
}

export async function softDeleteCommunication(communicationId: string) {
  const client = supabase;
  
  const { data, error } = await client
    .from("communications")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", communicationId)
    .select()
    .single();

  if (error) throw error;
  return data as Communication;
}


import { supabase } from "@/lib/supabase";
import type { Commission, CreateCommissionInput } from "@/lib/types";

export async function getCommissions(organizationId: string, options?: {
  businessId?: string;
  estado?: string;
  limit?: number;
  offset?: number;
}) {
  const client = supabase;
  
  let query = client
    .from("commissions")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (options?.businessId) {
    query = query.eq("business_id", options.businessId);
  }
  
  if (options?.estado) {
    query = query.eq("estado", options.estado);
  }

  if (options?.limit) {
    query = query.range(options.offset || 0, (options.offset || 0) + options.limit - 1);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Commission[];
}

export async function getCommissionById(commissionId: string) {
  const client = supabase;
  
  const { data, error } = await client
    .from("commissions")
    .select("*")
    .eq("id", commissionId)
    .single();

  if (error) throw error;
  return data as Commission;
}

export async function createCommission(
  organizationId: string,
  input: CreateCommissionInput
) {
  const client = supabase;
  
  const { data, error } = await client
    .from("commissions")
    .insert({
      organization_id: organizationId,
      estado: "PREVISTA",
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Commission;
}

export async function updateCommission(commissionId: string, updates: Partial<Commission>) {
  const client = supabase;
  
  const { data, error } = await client
    .from("commissions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", commissionId)
    .select()
    .single();

  if (error) throw error;
  return data as Commission;
}

export async function updateCommissionStatus(commissionId: string, newStatus: string) {
  return updateCommission(commissionId, { estado: newStatus as any });
}

export async function getCommissionsSummary(organizationId: string) {
  const client = supabase;
  
  const { data, error } = await client
    .from("commissions")
    .select("estado, comissao_bruta, comissao_liquida, comissao_parcendi")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);

  if (error) throw error;

  // Calculate summary
  const summary = {
    total_bruta: 0,
    total_liquida: 0,
    total_parcendi: 0,
    by_status: {} as Record<string, number>,
  };

  (data as Commission[]).forEach((commission) => {
    summary.total_bruta += commission.comissao_bruta;
    summary.total_liquida += commission.comissao_liquida;
    summary.total_parcendi += commission.comissao_parcendi;
    
    summary.by_status[commission.estado] = (summary.by_status[commission.estado] || 0) + 1;
  });

  return summary;
}

export async function softDeleteCommission(commissionId: string) {
  const client = supabase;
  
  const { data, error } = await client
    .from("commissions")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", commissionId)
    .select()
    .single();

  if (error) throw error;
  return data as Commission;
}


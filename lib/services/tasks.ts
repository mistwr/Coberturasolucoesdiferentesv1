import { supabase } from "@/lib/supabase";
import type { Task, CreateTaskInput } from "@/lib/types";

export async function getTasks(organizationId: string, options?: {
  atribuidoA?: string;
  estado?: string;
  prioridade?: string;
  limit?: number;
  offset?: number;
}) {
  const client = supabase;
  
  let query = client
    .from("tasks")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("data_prazo", { ascending: true });

  if (options?.atribuidoA) {
    query = query.eq("atribuido_a", options.atribuidoA);
  }
  
  if (options?.estado) {
    query = query.eq("estado", options.estado);
  }

  if (options?.prioridade) {
    query = query.eq("prioridade", options.prioridade);
  }

  if (options?.limit) {
    query = query.range(options.offset || 0, (options.offset || 0) + options.limit - 1);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Task[];
}

export async function getTaskById(taskId: string) {
  const client = supabase;
  
  const { data, error } = await client
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error) throw error;
  return data as Task;
}

export async function createTask(organizationId: string, userId: string, input: CreateTaskInput) {
  const client = supabase;
  
  const { data, error } = await client
    .from("tasks")
    .insert({
      organization_id: organizationId,
      created_by: userId,
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  const client = await createClient();
  
  const { data, error } = await client
    .from("tasks")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  return updateTask(taskId, { estado: newStatus as any });
}

export async function softDeleteTask(taskId: string) {
  const client = supabase;
  
  const { data, error } = await client
    .from("tasks")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

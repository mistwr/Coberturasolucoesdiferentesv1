import { createClient as createServerClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a client instance (may be a placeholder if env vars are missing)
export const supabase = createServerClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for admin operations)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseServiceKey
  ? createServerClient(supabaseUrl, supabaseServiceKey)
  : supabase;


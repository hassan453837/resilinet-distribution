import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─── Browser client — uses cookies for session storage so PKCE verifier
//     is accessible to the server-side callback route. Safe in client components.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// ─── Service-role client — server only, bypasses RLS ─────────────────────────
export const createServerSupabaseClient = () =>
  createClient(supabaseUrl, serviceRoleKey ?? supabaseAnonKey);

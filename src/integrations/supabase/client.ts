// Local-auth mode: Supabase is used for DB only, not for authentication.
// Auth is handled via src/lib/localAuth.ts (localStorage sessions).
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      // Use anon key — make sure RLS policies allow anon reads/writes
      // or disable RLS on your tables in the Supabase dashboard
      apikey: SUPABASE_PUBLISHABLE_KEY,
    },
  },
});
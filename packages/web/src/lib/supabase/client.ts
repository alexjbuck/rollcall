import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const createSupabaseBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase env vars');
  }
  return createClientComponentClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });
};


// src/env/server.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

// Validate the variables at query time
export const getEnv = () => {
  const parsedEnv = envSchema.safeParse(process.env);
  if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables', z.treeifyError(parsedEnv.error));
    throw new Error('Invalid environment variables');
  }
  return parsedEnv.data;
}

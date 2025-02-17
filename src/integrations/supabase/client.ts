
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lbctdrswqfeamcywfuam.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiY3RkcnN3cWZlYW1jeXdmdWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MDEzNDEsImV4cCI6MjA1MzM3NzM0MX0.xjAbb9i3pYdAumdeke-y7cVScaxvkAnRfKQH1q-aXfI";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  }
);


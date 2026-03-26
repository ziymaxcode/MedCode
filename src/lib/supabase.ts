/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Hardcoded Mangalore Branch ID for this specific app instance
export const MANGALORE_BRANCH_ID = '00000000-0000-0000-0000-000000000001'; // Placeholder UUID, in real app this would be fetched or seeded

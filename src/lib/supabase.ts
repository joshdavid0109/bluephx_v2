// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const expoExtra: any = (Constants as any).expoConfig?.extra ?? (Constants as any).manifest?.extra ?? {};

const SUPABASE_URL = expoExtra.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = expoExtra.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase keys not found. Add them to app.json extras or env.');
}

export const supabase = createClient(String(SUPABASE_URL || ''), String(SUPABASE_ANON_KEY || ''));

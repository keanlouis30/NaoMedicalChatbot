import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Message {
  id: string;
  created_at: string;
  role: 'doctor' | 'patient';
  sender: 'user' | 'bot';
  original_text: string;
  translated_text: string | null;
  media_url: string | null;
  media_type: 'audio' | 'image' | 'video' | null;
}

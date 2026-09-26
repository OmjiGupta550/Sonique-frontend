import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://vybngwvfcuhjdpcmvypu.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5Ym5nd3ZmY3VoamRwY212eXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMTU5NjksImV4cCI6MjA5ODg5MTk2OX0.TGPOLzALF9VH-NbKhuQ1KGski5lI31H8eZcNbPH9BZE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

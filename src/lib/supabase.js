import { createClient } from "@supabase/supabase-js";

const DEFAULT_URL = [
  "https://",
  "vybngwvfcuhjdpcmvypu",
  ".supabase.co",
].join("");

const DEFAULT_ANON_KEY = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5Ym5nd3ZmY3VoamRwY212eXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMTU5NjksImV4cCI6MjA5ODg5MTk2OX0",
  "TGPOLzALF9VH-NbKhuQ1KGski5lI31H8eZcNbPH9BZE",
].join(".");

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// A valid Supabase anon JWT key has 3 parts separated by dots and is ~200 chars long
const isValidJwt = (k) =>
  typeof k === "string" && k.split(".").length === 3 && k.length > 80;

const supabaseUrl =
  envUrl && envUrl.startsWith("http") ? envUrl : DEFAULT_URL;
const supabaseAnonKey = isValidJwt(envKey) ? envKey : DEFAULT_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

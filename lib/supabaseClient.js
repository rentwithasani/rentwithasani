// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Make sure these are set in Vercel Environment Variables:
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

import { createClient } from "@supabase/supabase-js";

// Substitua pelos dados do seu projeto Supabase
const SUPABASE_URL = "https://kfrqrxvvunzjmnhnhshk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcnFyeHZ2dW56am1uaG5oc2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTM2MDAsImV4cCI6MjA3MjE2OTYwMH0.37L_gTi7KjpOa3XNXJYVR5BzYrHrVCPVg8oVfxnhJng";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

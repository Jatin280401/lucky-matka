import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  const { data, error } = await supabase.from('cities').select('*').limit(1);
  if (error) {
    console.error("Error fetching:", error);
  } else {
    console.log("Row structure:", JSON.stringify(data?.[0] || {}, null, 2));
  }
}

checkSchema();

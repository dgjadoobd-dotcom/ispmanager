
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log(`Testing connection to ${SUPABASE_URL}...`);
  const { data, error } = await supabase.from('tenants').select('count', { count: 'exact', head: true });
  
  if (error) {
    console.error("Connection Error:", error.message);
    if (error.message.includes("404")) {
       console.log("Table 'tenants' not found. This confirms the schema is missing.");
    }
  } else {
    console.log("Connection Success! Data:", data);
  }
}

test();

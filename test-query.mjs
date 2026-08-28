import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('transactions')
    .select('date, amount, establishment, source, status, description')
    .ilike('establishment', '%Leroy%');
    
  console.log("Leroy transactions:", data);

  const { data: d2 } = await supabase
    .from('transactions')
    .select('date, amount, establishment, source, status, description')
    .eq('amount', 20687);
    
  console.log("20687 transactions:", d2);
}
run();

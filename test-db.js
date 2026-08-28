import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { data } = await supabase.from('transactions').select('*').ilike('description', '%Leroy%');
  console.log("Leroy transactions:", data);

  const { data: d2 } = await supabase.from('transactions').select('*').eq('amount', 20687);
  console.log("20687 transactions:", d2);
}
run();

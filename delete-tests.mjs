import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL="([^"]+)"/);
const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="([^"]+)"/);

if (!urlMatch || !keyMatch) {
  console.error("Could not parse env file", {urlMatch, keyMatch});
  process.exit(1);
}

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  // Delete the 20687 one
  const { data: d1, error: e1 } = await supabase.from('transactions').delete().eq('amount', 20687);
  console.log("Deleted 20687:", e1 || d1);

  // Delete the 10000 one (Leroy Merlin)
  const { data: d2, error: e2 } = await supabase.from('transactions').delete().eq('amount', 10000).ilike('description', '%Leroy%');
  console.log("Deleted 10000 Leroy:", e2 || d2);
}
run();

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const env = fs.readFileSync('.env', 'utf8');
let url='', key='';
for (const line of env.split('\n')) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].replace(/"/g, '').trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].replace(/"/g, '').trim();
}
const supabase = createClient(url, key);
async function run() {
  const { data, error } = await supabase.from('transactions').select('doc_type').limit(1);
  console.log("Error:", error);
}
run();

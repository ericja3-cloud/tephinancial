import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const lines = env.split('\n');
let url = '';
let key = '';
for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].replace(/"/g, '').trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].replace(/"/g, '').trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].replace(/"/g, '').trim();
}

const supabase = createClient(url, key);
async function run() {
  const { data } = await supabase.from('transactions').select('*').or('establishment.is.null,establishment.eq.,description.is.null,description.eq.');
  console.log("Empty est/desc:", data?.length);
  if (data?.length > 0) {
    console.log(data.slice(0, 5).map(d => `${d.date} | ${d.amount} | est:${d.establishment} | desc:${d.description}`));
  }
}
run();

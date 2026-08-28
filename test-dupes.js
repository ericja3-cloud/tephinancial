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
  const { data } = await supabase.from('transactions').select('*').eq('status', 'pendente_revisao');
  console.log(`Found ${data?.length} pending in total.`);
  if (data && data.length > 0) {
    for (const d of data.slice(0, 5)) {
      console.log(`\nPENDING [${d.source}]: ${d.date} | ${d.amount} | est:${d.establishment} | desc:${d.description}`);
      const { data: others } = await supabase.from('transactions').select('*').eq('date', d.date).eq('amount', d.amount);
      console.log("Matching DB items:");
      others.forEach(o => console.log(`  - [${o.source}] ${o.status}: ${o.establishment} | ${o.description}`));
    }
  }
}
run();

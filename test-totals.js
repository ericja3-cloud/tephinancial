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
  const { data } = await supabase.from('transactions').select('*');
  let inc = 0, exp = 0;
  
  // Calculate this month's totals
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  
  data.forEach(t => {
     if (t.status === 'cancelado') return;
     if (t.date >= startOfMonth && t.date <= endOfMonth) {
        if (t.type === 'income') inc += Number(t.amount);
        if (t.type === 'expense') exp += Number(t.amount);
     }
  });
  console.log(`Current Month DB Totals: Income: ${inc}, Expense: ${exp}, Saldo: ${inc - exp}`);
}
run();

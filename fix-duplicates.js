import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env manually
const env = fs.readFileSync('.env', 'utf8');
const lines = env.split('\n');
let url = '';
let key = '';
for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].replace(/"/g, '').trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].replace(/"/g, '').trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].replace(/"/g, '').trim();
}

if (!url || !key) {
  console.error("Missing URL or KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  const { data: txs, error } = await supabase.from('transactions').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${txs.length} total transactions.`);

  const toDelete = [];
  const keepIds = new Set();

  for (let i = 0; i < txs.length; i++) {
    for (let j = i + 1; j < txs.length; j++) {
      const t1 = txs[i];
      const t2 = txs[j];
      
      // If we already marked one of them for deletion, skip
      if (toDelete.includes(t1.id) || toDelete.includes(t2.id)) continue;
      
      // Check date (ignore time)
      const d1 = t1.date.split('T')[0];
      const d2 = t2.date.split('T')[0];
      if (d1 !== d2) continue;
      
      // Check amount
      if (Math.abs(t1.amount - t2.amount) > 0.01) continue;
      
      // Fuzzy string check
      const e1 = (t1.establishment || t1.description || "").toLowerCase().trim();
      const e2 = (t2.establishment || t2.description || "").toLowerCase().trim();
      
      const isSameEst = e1 === e2 || e1.includes(e2) || e2.includes(e1);
      
      if (isSameEst) {
        console.log(`Found duplicate:\n  1. [${t1.source}] ${t1.date} | ${t1.amount} | ${e1}\n  2. [${t2.source}] ${t2.date} | ${t2.amount} | ${e2}`);
        
        // Decide which one to delete. Prefer keeping the "manual" or "confirmado" one over the "upload" or "pendente_revisao"
        let keep = t1;
        let drop = t2;
        
        if (t2.source === 'manual' && t1.source !== 'manual') { keep = t2; drop = t1; }
        else if (t2.status === 'confirmado' && t1.status !== 'confirmado') { keep = t2; drop = t1; }
        
        console.log(`  -> Deleting ID: ${drop.id} (keeping ${keep.id})`);
        toDelete.push(drop.id);
        keepIds.add(keep.id);
      }
    }
  }
  
  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} duplicates...`);
    const { error: delError } = await supabase.from('transactions').delete().in('id', toDelete);
    if (delError) {
      console.error("Delete failed:", delError);
    } else {
      console.log("Successfully deleted duplicates!");
    }
  } else {
    console.log("No duplicates found.");
  }
}

run();

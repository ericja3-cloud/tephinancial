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

if (!url || !key) {
  console.error("Missing URL or KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log("Deletando todas as transações com source = 'upload'...");
  const { data, error, count } = await supabase
    .from('transactions')
    .delete()
    .eq('source', 'upload')
    .select();
    
  if (error) {
    console.error("Erro ao deletar:", error);
  } else {
    console.log(`Sucesso! ${data?.length || 0} contas de extratos deletadas.`);
  }
}

run();

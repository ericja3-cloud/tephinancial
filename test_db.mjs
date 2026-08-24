import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?(.*?)"?$/);
  if (match) env[match[1]] = match[2];
});
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('notifications').select('*').limit(1);
  if (error) {
    console.error("Erro:", error.message);
  } else {
    console.log("Tabela existe! Dados:", data);
  }
}
run();

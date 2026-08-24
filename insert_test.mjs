import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?(.*?)"?$/);
  if (match) env[match[1]] = match[2];
});
const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const userId = users[0].id;
  
  const payload = {
    user_id: userId,
    doc_type: "despesa",
    type: "expense",
    payment_method: "Cartão de Crédito",
    target_source: "",
    description: "Comprovante de Pagamento do Ifood",
    establishment: "Ifood S.A.",
    amount: 85.9,
    date: new Date().toISOString().slice(0, 10),
    category: "Alimentação",
    classification: "PF",
    ai_confidence: "Baixa",
    source: "email",
    status: "pendente_revisao",
    receipt_url: "dummy_url",
  };

  const { error } = await supabase.from("transactions").insert([payload]);
  console.log("Insert error:", error);
}
run();

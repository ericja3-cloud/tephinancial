import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?(.*?)"?$/);
  if (match) env[match[1]] = match[2];
});

async function run() {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing config!");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error || !users || users.length === 0) {
    console.error("No users found or error fetching users:", error);
    process.exit(1);
  }

  const email = users[0].email;
  console.log(`Using email: ${email}`);

  // Using text/plain so it doesn't fail parsing as PDF
  const fakeContent = "Comprovante de pagamento Ifood\nValor: R$ 85,90\nData: 17/07/2026\nEstabelecimento: Ifood S.A.\nCategoria: Alimentação";
  const blob = new Blob([fakeContent], { type: 'text/plain' });

  const formData = new FormData();
  formData.append("to", "inbox@inbox.friccaozero.app");
  formData.append("from", `Teste <${email}>`);
  formData.append("subject", "Comprovante de Pagamento do Ifood");
  formData.append("anexo.txt", blob, "comprovante.txt");

  console.log("Enviando requisição...");
  try {
    const res = await fetch("http://localhost:8080/api/public/inbound-email", {
      method: "POST",
      body: formData
    });
    const text = await res.text();
    console.log("Resposta do servidor:", text);
  } catch(e) {
    console.error("Erro no fetch:", e);
  }
}
run();

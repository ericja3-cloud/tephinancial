import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Configurando perfil e transação de teste...");
  
  // Update user profile to have the phone number
  const { data: users, error: userError } = await supabase.from('profiles').select('id').limit(1);
  if (userError || !users?.length) throw new Error("User not found");
  const userId = users[0].id;
  
  await supabase.from('profiles').update({
    phone_number: '5511940385009',
    callmebot_apikey: '7877450'
  }).eq('id', userId);
  
  // Calculate tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];
  
  // Insert a test pending transaction for tomorrow
  const { error: insertError } = await supabase.from('transactions').insert({
    user_id: userId,
    amount: 199.90,
    description: 'Conta de Energia Elétrica (Teste Notificação)',
    category: 'Moradia',
    establishment: 'Enel',
    type: 'expense',
    status: 'pending',
    date: dateStr
  });
  
  if (insertError) throw insertError;
  
  console.log("Transação inserida! Agora executando o job de WhatsApp...");
  
  // Run the job logic
  const { execSync } = await import('child_process');
  execSync('node --env-file=.env test-whatsapp-job.mjs', { stdio: 'inherit' });
  
  console.log("Fim do teste!");
}

run().catch(console.error);

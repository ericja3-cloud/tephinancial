import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWhatsapp() {
  console.log("Iniciando teste do WhatsApp...");
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    console.log("Buscando transações para:", dateStr);

    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("id, amount, description, category, establishment, user_id, date, status")
      .eq("type", "expense")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(3);

    if (txError) throw txError;
    
    console.log(`Encontradas ${transactions?.length || 0} contas pendentes para amanhã.`);
    console.log("Transacoes recentes:", JSON.stringify(transactions, null, 2));

    for (const tx of transactions || []) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("phone_number, whatsapp_alerts, callmebot_apikey, full_name")
        .eq("id", tx.user_id)
        .single();
        
      const profile = profileData;
      console.log("Profile data:", profile);
      if (!profile?.whatsapp_alerts || !profile?.phone_number || !profile?.callmebot_apikey) {
        console.log("Usuário não tem alertas ativados ou faltam credenciais.");
        continue;
      }

      const amountFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(tx.amount);
      const name = profile.full_name ? profile.full_name.split(' ')[0] : 'usuário';
      
      const message = `Olá ${name}! 📅 Lembrete de vencimento amanhã:\n\n*${tx.description || tx.category}*\nValor: ${amountFormatted}\n\nAcesse o Tephinancial para marcar como pago.`;
      
      const url = `https://api.callmebot.com/whatsapp.php?phone=${profile.phone_number}&text=${encodeURIComponent(message)}&apikey=${profile.callmebot_apikey}`;
      console.log(`Enviando para ${profile.phone_number}...`);
      
      const response = await fetch(url);
      
      if (response.ok) {
        console.log("✅ Mensagem enviada com sucesso!");
      } else {
        console.error("❌ Erro ao enviar:", await response.text());
      }
    }
    console.log("Teste finalizado.");
  } catch (error) {
    console.error("Erro durante o teste:", error);
  }
}

testWhatsapp();

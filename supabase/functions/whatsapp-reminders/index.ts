import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get tomorrow's date in YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    // Find pending transactions (expenses) for tomorrow
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select(`
        id, amount, description, category, establishment,
        user_id,
        profiles!inner ( phone_number, whatsapp_alerts, callmebot_apikey, full_name )
      `)
      .eq("type", "expense")
      .eq("status", "pendente")
      .eq("date", dateStr);

    if (txError) throw txError;

    const sentMessages = [];

    for (const tx of transactions || []) {
      const profile = tx.profiles;
      
      // Check if user has alerts enabled and has credentials
      if (!profile?.whatsapp_alerts || !profile?.phone_number || !profile?.callmebot_apikey) {
        continue;
      }

      const amountFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(tx.amount);
      const name = profile.full_name ? profile.full_name.split(' ')[0] : 'usuário';
      
      const message = `Olá ${name}! 📅 Lembrete de vencimento amanhã:\n\n*${tx.description || tx.category}*\nValor: ${amountFormatted}\n\nAcesse o Tephinancial para marcar como pago.`;
      
      // CallMeBot API
      const url = `https://api.callmebot.com/whatsapp.php?phone=${profile.phone_number}&text=${encodeURIComponent(message)}&apikey=${profile.callmebot_apikey}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        sentMessages.push({ txId: tx.id, status: "sent" });
      } else {
        console.error(`Error sending to ${profile.phone_number}:`, await response.text());
        sentMessages.push({ txId: tx.id, status: "error" });
      }
    }

    return new Response(JSON.stringify({ success: true, sent: sentMessages }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";
import webpush from "npm:web-push";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Setup Web Push
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    
    if (vapidPublic && vapidPrivate) {
      webpush.setVapidDetails('mailto:suporte@tephinancial.com', vapidPublic, vapidPrivate);
    }

    // Get tomorrow's date in YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("id, amount, description, category, establishment, user_id")
      .eq("type", "expense")
      .eq("status", "pending")
      .eq("date", dateStr);

    if (txError) throw txError;

    const sentMessages = [];

    for (const tx of transactions || []) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone_number, whatsapp_alerts, callmebot_apikey, full_name")
        .eq("id", tx.user_id)
        .single();
      
      const amountFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(tx.amount);
      const name = profile?.full_name ? profile.full_name.split(' ')[0] : 'usuário';
      const title = `📅 Lembrete de vencimento amanhã`;
      const body = `Conta: ${tx.description || tx.category}\nValor: ${amountFormatted}`;
      const message = `Olá ${name}! ${title}:\n\n*${tx.description || tx.category}*\nValor: ${amountFormatted}\n\nAcesse o Tephinancial para marcar como pago.`;
      
      // 1. Send WhatsApp if enabled
      if (profile?.whatsapp_alerts && profile?.phone_number && profile?.callmebot_apikey) {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${profile.phone_number}&text=${encodeURIComponent(message)}&apikey=${profile.callmebot_apikey}`;
        const response = await fetch(url);
        if (response.ok) {
          sentMessages.push({ txId: tx.id, type: "whatsapp", status: "sent" });
        } else {
          console.error(`Error sending WA to ${profile.phone_number}:`, await response.text());
        }
      }
      
      // 2. Send Web Push
      if (vapidPublic && vapidPrivate) {
        const { data: subs } = await supabase
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", tx.user_id);
          
        for (const sub of subs || []) {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth_key,
              p256dh: sub.p256dh_key
            }
          };
          try {
            await webpush.sendNotification(pushSubscription, JSON.stringify({
              title,
              body,
              url: "/dashboard"
            }));
            sentMessages.push({ txId: tx.id, type: "push", status: "sent" });
          } catch (e) {
            console.error("Error sending push notification", e);
            // If subscription is invalid/expired (410 Gone), we should ideally delete it
            if (e.statusCode === 410) {
              await supabase.from("push_subscriptions").delete().eq("id", sub.id);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, sent: sentMessages }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});


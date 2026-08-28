import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails('mailto:suporte@tephinancial.com', vapidPublic, vapidPrivate);

async function run() {
  console.log("Buscando sua assinatura...");
  const { data: subs, error } = await supabase.from('push_subscriptions').select('*').limit(1);
  if (error || !subs?.length) throw new Error("Assinatura não encontrada!");
  
  const sub = subs[0];
  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      auth: sub.auth_key,
      p256dh: sub.p256dh_key
    }
  };

  console.log("Disparando notificação Web Push...");
  
  try {
    await webpush.sendNotification(pushSubscription, JSON.stringify({
      title: "🚀 Teste de Sistema",
      body: "A notificação Push do Tephinancial está funcionando perfeitamente, mesmo com o app fechado!",
      url: "/dashboard"
    }));
    console.log("Sucesso!");
  } catch (err) {
    console.error("Falha ao enviar:", err);
  }
}

run();

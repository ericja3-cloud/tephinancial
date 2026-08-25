import { supabase } from "@/integrations/supabase/client";

// URL-safe base64 to Uint8Array converter
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Notificações não suportadas neste navegador.');
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permissão negada.');
  }

  const registration = await navigator.serviceWorker.ready;
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error('Chave VAPID não configurada.');
  }

  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  // Subscribe to push manager
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey
  });

  const subJson = subscription.toJSON();
  if (!subJson.keys) throw new Error("Falha ao obter as chaves.");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");

  // Save to database
  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint: subJson.endpoint,
    auth_key: subJson.keys.auth,
    p256dh_key: subJson.keys.p256dh,
  }, { onConflict: 'endpoint' });

  if (error) throw error;
  
  return true;
}

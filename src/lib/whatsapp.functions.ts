import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SendWhatsAppSchema = z.object({
  to: z.string(),
  templateName: z.string(),
});

export async function triggerWhatsAppMessage(to: string, templateName: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.warn("WhatsApp credentials not configured. Skipping notification.");
    return { success: false, message: "Not configured" };
  }

  // Limpar número (deixar só dígitos)
  const cleanPhone = to.replace(/\D/g, "");

  // Endpoint da Meta Graph API para enviar mensagens pelo WhatsApp
  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: cleanPhone,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "en_US" // O template padrão do facebook "hello_world" é em en_US
      }
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("WhatsApp API Error:", errorData);
    return { success: false, message: errorData?.error?.message || "Error sending message" };
  }

  return { success: true };
}

export const sendWhatsAppNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(SendWhatsAppSchema)
  .handler(async ({ data }): Promise<{ success: boolean; message?: string }> => {
    try {
      return await triggerWhatsAppMessage(data.to, data.templateName);
    } catch (err: any) {
      console.error("WhatsApp Send Error:", err);
      return { success: false, message: err.message };
    }
  });

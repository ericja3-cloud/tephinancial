import { c as createServerRpc } from "./createServerRpc-Cwi7S7qp.mjs";
import { c as createServerFn } from "./server-CU1fTwFN.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-aaZtlEbX.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as object, a as string } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const SendWhatsAppSchema = object({
  to: string(),
  templateName: string()
});
async function triggerWhatsAppMessage(to, templateName) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) {
    console.warn("WhatsApp credentials not configured. Skipping notification.");
    return {
      success: false,
      message: "Not configured"
    };
  }
  const cleanPhone = to.replace(/\D/g, "");
  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: cleanPhone,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "en_US"
        // O template padrão do facebook "hello_world" é em en_US
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
    return {
      success: false,
      message: errorData?.error?.message || "Error sending message"
    };
  }
  return {
    success: true
  };
}
const sendWhatsAppNotification_createServerFn_handler = createServerRpc({
  id: "f5cf2d5865f7acbfd61b8d94f6780c76d22fec877008ff079eae1d7ff6c83171",
  name: "sendWhatsAppNotification",
  filename: "src/lib/whatsapp.functions.ts"
}, (opts) => sendWhatsAppNotification.__executeServer(opts));
const sendWhatsAppNotification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).validator(SendWhatsAppSchema).handler(sendWhatsAppNotification_createServerFn_handler, async ({
  data
}) => {
  try {
    return await triggerWhatsAppMessage(data.to, data.templateName);
  } catch (err) {
    console.error("WhatsApp Send Error:", err);
    return {
      success: false,
      message: err.message
    };
  }
});
export {
  sendWhatsAppNotification_createServerFn_handler
};

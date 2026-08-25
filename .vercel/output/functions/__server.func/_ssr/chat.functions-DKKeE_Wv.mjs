import { c as createServerRpc } from "./createServerRpc-Cwi7S7qp.mjs";
import { c as createServerFn } from "./server-CU1fTwFN.mjs";
import { g as generateText } from "../_libs/ai.mjs";
import { createGoogle } from "../_libs/ai-sdk__google.mjs";
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
import "../_libs/ai-sdk__gateway.mjs";
import "../_libs/ai-sdk__provider-utils.mjs";
import "../_libs/ai-sdk__provider.mjs";
import "../_libs/eventsource-parser.mjs";
import "../_libs/@vercel/oidc.mjs";
import "path";
import "fs";
import "os";
import "../_libs/workflow__serde.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const ChatInputSchema = object({
  prompt: string(),
  context: string()
});
const askPocketManager_createServerFn_handler = createServerRpc({
  id: "c0628bb655a1a608f1fa5c240379111ce31c5729dca356f332f8317b33978c7f",
  name: "askPocketManager",
  filename: "src/lib/chat.functions.ts"
}, (opts) => askPocketManager.__executeServer(opts));
const askPocketManager = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).validator(ChatInputSchema).handler(askPocketManager_createServerFn_handler, async ({
  data,
  context
}) => {
  try {
    const key = process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY;
    if (!key) {
      throw new Error("Missing API Key. Please configure LOVABLE_API_KEY or GEMINI_API_KEY.");
    }
    const google = createGoogle({
      apiKey: key
    });
    const systemPrompt = `Você é o "Gerente de Bolso", um assistente financeiro pessoal inteligente.
Você deve responder de forma curta, direta e muito útil.
Seja amigável e utilize emojis quando apropriado.
O usuário te enviou a seguinte pergunta, juntamente com o contexto do estado atual das finanças dele (últimas transações e saldo do mês).
Responda APENAS com base nos dados fornecidos no contexto ou usando conhecimentos gerais de finanças caso o contexto não possua a resposta exata.

--- CONTEXTO FINANCEIRO DO USUÁRIO ---
${data.context}
--------------------------------------
`;
    const response = await generateText({
      model: google("gemini-3.5-flash"),
      system: systemPrompt,
      prompt: data.prompt
    });
    return {
      text: response.text
    };
  } catch (error) {
    console.error("askPocketManager error:", error);
    throw error;
  }
});
export {
  askPocketManager_createServerFn_handler
};

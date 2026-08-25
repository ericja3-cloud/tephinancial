import { c as createServerRpc } from "./createServerRpc-Cwi7S7qp.mjs";
import { c as createServerFn } from "./server-CU1fTwFN.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-aaZtlEbX.mjs";
import { g as generateText, o as output_exports, N as NoObjectGeneratedError } from "../_libs/ai.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as object, _ as _enum, a as string, n as number, b as array } from "../_libs/zod.mjs";
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
import "../_libs/ai-sdk__gateway.mjs";
import "../_libs/ai-sdk__provider-utils.mjs";
import "../_libs/ai-sdk__provider.mjs";
import "../_libs/eventsource-parser.mjs";
import "../_libs/@vercel/oidc.mjs";
import "path";
import "fs";
import "os";
import "../_libs/workflow__serde.mjs";
const CATEGORIES = ["Alimentação", "Transporte", "Lazer", "Saúde", "Contas Fixas", "Serviços Prestados", "Outros"];
const TransactionSchema = object({
  tipo_documento: _enum(["despesa", "faturamento_pj"]).nullable(),
  estabelecimento: string().nullable(),
  valor: number().nullable(),
  data: string().nullable(),
  categoria_sugerida: _enum(CATEGORIES).nullable(),
  descricao_servico: string().nullable(),
  classificacao: _enum(["PF", "PJ"]).nullable(),
  portador: string().nullable(),
  confiança: _enum(["Alta", "Média", "Baixa"]).nullable(),
  propriedade: _enum(["particular", "casa"]).nullable()
});
const ExtractSchema = object({
  transacoes: array(TransactionSchema)
});
async function extractTransactionsFromBlob(file) {
  const key = process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY;
  if (!key) {
    console.log("Mocking AI response since GEMINI_API_KEY is missing");
    await new Promise((resolve) => setTimeout(resolve, 2e3));
    return {
      transacoes: [{
        tipo_documento: "despesa",
        estabelecimento: "Supermercado (Mock)",
        valor: 154.9,
        data: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        categoria_sugerida: "Alimentação",
        descricao_servico: null,
        classificacao: "PF",
        portador: "Principal",
        confiança: "Alta",
        propriedade: "casa"
      }]
    };
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
  const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
  const {
    createGoogleGenerativeAI
  } = await import("../_libs/ai-sdk__google.mjs");
  const google = createGoogleGenerativeAI({
    apiKey: key
  });
  const model = google("gemini-3.5-flash");
  const prompt = "Você é um assistente financeiro de alta precisão. Analise a imagem ou texto do documento (pode ser um recibo único ou uma fatura de cartão com dezenas de compras). Extraia TODAS as transações encontradas. Para cada transação, identifique se trata-se de uma DESPESA pessoal/comercial ou se é uma NOTA FISCAL DE SERVIÇO QUE PRECISO EMITIR/FATURAR. Classifique a transação entre 'PF' (Finanças Pessoais) ou 'PJ' (Finanças Empresariais). Identifique também o 'portador' (nome do portador do cartão, final do cartão ou 'Principal' caso não identifique adicional). Se for uma compra de mercado, conta de luz/água ou despesa conjunta, defina 'propriedade' como 'casa'. Retorne estritamente JSON contendo um array 'transacoes' preenchendo os campos descritos no schema.";
  try {
    const {
      output
    } = await generateText({
      model,
      output: output_exports.object({
        schema: ExtractSchema
      }),
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: prompt
        }, mime.startsWith("image/") ? {
          type: "image",
          image: dataUrl
        } : {
          type: "file",
          data: dataUrl,
          mediaType: mime
        }]
      }]
    });
    return output;
  } catch (err) {
    if (NoObjectGeneratedError.isInstance(err)) {
      return {
        transacoes: []
      };
    }
    const msg = String(err?.message ?? err);
    if (msg.includes("429")) throw new Error("Muitas requisições à IA. Aguarde alguns segundos e tente novamente.");
    if (msg.includes("402")) throw new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
    throw new Error("Falha ao processar o comprovante: " + msg);
  }
}
const extractReceipt_createServerFn_handler = createServerRpc({
  id: "20f92152bfa788f58b12276be000fafca05df61c5056af58fa5ccb5dbf7ffc5e",
  name: "extractReceipt",
  filename: "src/lib/receipts.functions.ts"
}, (opts) => extractReceipt.__executeServer(opts));
const extractReceipt = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(extractReceipt_createServerFn_handler, async ({
  data,
  context
}) => {
  process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY;
  const {
    data: file,
    error
  } = await context.supabase.storage.from("receipts").download(data.path);
  if (error || !file) throw new Error("Não foi possível ler o comprovante.");
  return await extractTransactionsFromBlob(file);
});
export {
  extractReceipt_createServerFn_handler
};

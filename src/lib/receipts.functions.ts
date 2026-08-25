import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateObject, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const CATEGORIES = ["Alimentação", "Transporte", "Lazer", "Saúde", "Contas Fixas", "Serviços Prestados", "Outros"] as const;

const TransactionSchema = z.object({
  tipo_documento: z.enum(["despesa", "faturamento_pj"]).nullable(),
  estabelecimento: z.string().nullable(),
  valor: z.number().nullable(),
  data: z.string().nullable(),
  categoria_sugerida: z.enum(CATEGORIES).nullable(),
  descricao_servico: z.string().nullable(),
  classificacao: z.enum(["PF", "PJ"]).nullable(),
  portador: z.string().nullable(),
  confiança: z.enum(["Alta", "Média", "Baixa"]).nullable(),
  propriedade: z.enum(["particular", "casa"]).nullable(),
});

const ExtractSchema = z.object({
  transacoes: z.array(TransactionSchema)
});

export type ExtractResult = z.infer<typeof ExtractSchema>;

export async function extractTransactionsFromBlob(file: Blob): Promise<ExtractResult> {
  const key = process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY;
  if (!key) {
    // Mock the AI response se não tiver chave
    console.log("Mocking AI response since GEMINI_API_KEY is missing");
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      transacoes: [
        {
          tipo_documento: "despesa",
          estabelecimento: "Supermercado (Mock)",
          valor: 154.90,
          data: new Date().toISOString().slice(0, 10),
          categoria_sugerida: "Alimentação",
          descricao_servico: null,
          classificacao: "PF",
          portador: "Principal",
          confiança: "Alta",
          propriedade: "casa"
        }
      ]
    };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
  const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;

  // Usando o provedor oficial do Google no Vercel AI SDK
  const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
  const google = createGoogleGenerativeAI({ apiKey: key });
  const model = google("gemini-3.5-flash");

  const base64Data = buf.toString("base64");

  const prompt =
    "Você é um assistente financeiro de alta precisão. Analise a imagem ou texto do documento (pode ser um recibo único ou uma fatura de cartão com dezenas de compras). Extraia TODAS as transações encontradas. Para cada transação, identifique se trata-se de uma DESPESA pessoal/comercial ou se é uma NOTA FISCAL DE SERVIÇO QUE PRECISO EMITIR/FATURAR. Classifique a transação entre 'PF' (Finanças Pessoais) ou 'PJ' (Finanças Empresariais). Identifique também o 'portador' (nome do portador do cartão, final do cartão ou 'Principal' caso não identifique adicional). Se for uma compra de mercado, conta de luz/água ou despesa conjunta, defina 'propriedade' como 'casa'. Retorne estritamente JSON contendo um array 'transacoes' preenchendo os campos descritos no schema.";

  try {
    const { object } = await generateObject({
      model,
      schema: ExtractSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", image: base64Data, mimeType: mime },
          ],
        },
      ],
    });
    return object;
  } catch (err: any) {
    if (NoObjectGeneratedError.isInstance(err)) {
      return { transacoes: [] };
    }
    const msg = String(err?.message ?? err);
    if (msg.includes("429")) throw new Error("Muitas requisições à IA. Aguarde alguns segundos e tente novamente.");
    if (msg.includes("402")) throw new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
    throw new Error("Falha ao processar o comprovante: " + msg);
  }
}

export const extractReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ path: z.string() }))
  .handler(async ({ data, context }): Promise<ExtractResult> => {
    try {
      const key = process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY;
      
      const { data: file, error } = await context.supabase.storage
        .from("receipts")
        .download(data.path);
      
      if (error) {
        throw new Error("Erro no Supabase: " + error.message);
      }
      if (!file) {
        throw new Error("Comprovante não encontrado no banco.");
      }

      const result = await extractTransactionsFromBlob(file);
      // Ensure plain object
      return JSON.parse(JSON.stringify(result));
    } catch (e: any) {
      throw new Error(e.message || "Erro desconhecido ao ler o comprovante");
    }
  });

import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ChatInputSchema = z.object({
  prompt: z.string(),
  context: z.string(),
});

export const askPocketManager = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(ChatInputSchema)
  .handler(async ({ data, context }): Promise<{ text: string }> => {
    try {
      const key = process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY;

      if (!key) {
        throw new Error("Missing API Key. Please configure LOVABLE_API_KEY or GEMINI_API_KEY.");
      }

      const google = createGoogleGenerativeAI({ apiKey: key });

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
        model: google("gemini-1.5-flash"),
        system: systemPrompt,
        prompt: data.prompt,
      });

      return { text: response.text };
    } catch (error: any) {
      console.error("askPocketManager error:", error);
      throw new Error(error.message || "Erro desconhecido no Gerente de Bolso");
    }
  });

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { extractTransactionsFromBlob } from "../../../lib/receipts.functions";
import { CATEGORIES, type Category } from "../../../lib/categories";

export const Route = createFileRoute("/api/public/inbound-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

          if (!serviceRoleKey || !supabaseUrl) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY or URL");
            return new Response("Server configuration error", { status: 500 });
          }

          const supabase = createClient(supabaseUrl, serviceRoleKey);
          
          // SendGrid envia os dados como multipart/form-data
          const formData = await request.formData();
          const from = formData.get("from")?.toString() || "";
          const to = formData.get("to")?.toString() || "";
          const subject = formData.get("subject")?.toString() || "";

          console.log("[inbound-email] received from:", from, "to:", to);

          // Extrair e-mail do remetente (ex: "Nome <teste@gmail.com>" -> "teste@gmail.com")
          const emailMatch = from.match(/<([^>]+)>/);
          const senderEmail = emailMatch ? emailMatch[1] : from;

          // 1. Validar Segurança (Verificar se o remetente é o dono da conta)
          // Como não temos e-mail na tabela profiles, buscaremos via Supabase Admin Auth
          const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
          if (authError || !users) {
             return new Response("Auth list error", { status: 500 });
          }

          const user = users.find(u => u.email === senderEmail);
          if (!user) {
            console.warn("[inbound-email] Remetente não autorizado:", senderEmail);
            // Ignorar silenciosamente para evitar retries do SendGrid
            return Response.json({ ok: true, ignored: "unauthorized sender" });
          }

          // 2. Procurar por anexos (PDFs ou Imagens) no FormData
          let fileBlob: Blob | null = null;
          let fileName = "anexo";

          for (const [key, value] of formData.entries()) {
             if (value instanceof Blob && value.size > 0 && key !== "attachment-info") {
                // Achou o arquivo!
                fileBlob = value;
                fileName = value.name || "comprovante.pdf";
                break;
             }
          }

          if (!fileBlob) {
            console.warn("[inbound-email] Nenhum anexo encontrado");
            return Response.json({ ok: true, ignored: "no attachment" });
          }

          // 3. Fazer Upload do arquivo para o Storage
          const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
          const storagePath = `${user.id}/${Date.now()}-${safeName}`;
          
          const { error: uploadError } = await supabase.storage
            .from("receipts")
            .upload(storagePath, fileBlob, { upsert: true });

          if (uploadError) {
             console.error("[inbound-email] Falha no upload", uploadError);
             return new Response("Upload error", { status: 500 });
          }

          // 4. Chamar a IA para extrair as transações
          const aiResult = await extractTransactionsFromBlob(fileBlob);
          const txs = aiResult.transacoes || [];

          if (txs.length === 0) {
            console.warn("[inbound-email] IA não encontrou transações");
            return Response.json({ ok: true, ignored: "no transactions found" });
          }

          // 5. Salvar as transações no banco de dados como "pendente_revisao"
          const inserts = txs.map(t => {
            const cat = (t.categoria_sugerida && (CATEGORIES as readonly string[]).includes(t.categoria_sugerida) ? t.categoria_sugerida : "Outros") as Category;
            const isPJ = t.tipo_documento === "faturamento_pj";
            const amount = t.valor != null ? Number(t.valor) : 0;
            
            return {
              user_id: user.id,
              doc_type: t.tipo_documento || "despesa",
              type: isPJ ? "income" : "expense",
              payment_method: "Cartão de Crédito",
              target_source: isPJ ? (t.estabelecimento ?? "") : "",
              description: t.descricao_servico || t.estabelecimento || subject,
              establishment: t.estabelecimento || null,
              amount: isNaN(amount) ? 0 : amount,
              date: (t.data && t.data.includes("/")) ? t.data.split("/").reverse().join("-") : (t.data ?? new Date().toISOString().slice(0, 10)),
              category: cat,
              classification: (t.classificacao === "PJ" ? "PJ" : "PF") as "PF" | "PJ",
              ai_confidence: t.confiança ?? "Baixa",
              source: "email",
              status: "pendente_revisao",
              receipt_url: storagePath,
            };
          });

          const { error: dbError } = await supabase.from("transactions").insert(inserts);
          if (dbError) {
             console.error("[inbound-email] Erro ao inserir no BD", dbError);
             return new Response("Database error", { status: 500 });
          }

          // (Opcional) Podemos chamar o WhatsApp webhook aqui também!
          // import { triggerWhatsAppMessage } from "../../../lib/whatsapp.functions";
          // const profile = await supabase.from("profiles").select("whatsapp_number").eq("id", user.id).single();
          // if (profile.data?.whatsapp_number) triggerWhatsAppMessage(profile.data.whatsapp_number, "hello_world");

          return Response.json({ ok: true, transactionsSaved: inserts.length });

        } catch (error: any) {
           console.error("[inbound-email] Falha geral", error);
           return new Response(error.message, { status: 500 });
        }
      },
    },
  },
});

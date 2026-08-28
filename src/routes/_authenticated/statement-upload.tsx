import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { parseCsv, TxForm, inferCategory, parseDateString } from "@/lib/statement-parser";
import { useServerFn } from "@tanstack/react-start";
import { extractReceipt } from "@/lib/receipts.functions";

export const Route = createFileRoute("/_authenticated/statement-upload")({
  component: StatementUploadPage,
});

function StatementUploadPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const extract = useServerFn(extractReceipt);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (txs: TxForm[]) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Usuário não autenticado");

      const dates = txs.map(t => new Date(t.date).getTime()).filter(t => !isNaN(t));
      const minDate = dates.length ? new Date(Math.min(...dates)).toISOString() : "1970-01-01T00:00:00.000Z";
      const maxDate = dates.length ? new Date(Math.max(...dates)).toISOString() : "2099-12-31T23:59:59.999Z";

      const { data: existingTxs, error: fetchError } = await supabase
        .from("transactions")
        .select("id, date, amount, establishment, description")
        .eq("user_id", user.id)
        .gte("date", minDate)
        .lte("date", maxDate);
        
      if (fetchError) throw fetchError;

      const inserts = txs.map(t => {
         const tDate = t.date.split('T')[0];
         const tAmount = parseFloat(t.amount);
         const tEst = (t.establishment || t.description || "").toLowerCase().trim();
         
         const isDuplicate = existingTxs.some(ex => {
            const exDate = ex.date.split('T')[0];
            const exEst = (ex.establishment || ex.description || "").toLowerCase().trim();
            
            const isSameDate = exDate === tDate;
            const isSameAmount = ex.amount === tAmount;
            const isSameEst = exEst === tEst || exEst.includes(tEst) || tEst.includes(exEst);

            return isSameDate && isSameAmount && isSameEst;
         });

         return {
            user_id: user.id,
            type: t.type,
            payment_method: t.payment_method,
            target_source: t.target_source,
            doc_type: t.doc_type,
            classification: t.classification,
            cardholder: t.cardholder,
            amount: tAmount,
            description: t.description || t.establishment || "Comprovante",
            establishment: t.establishment || null,
            category: t.category,
            date: t.date,
            source: "upload",
            status: isDuplicate ? "pendente_revisao" : "confirmado",
            ai_confidence: t.confidence,
            receipt_url: null,
            sharing_type: t.sharing_type,
            paid_by: null,
         };
      });
      const { error } = await supabase.from("transactions").upsert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Extrato importado com sucesso!");
      router.navigate({ to: "/transactions" });
    },
    onError: (e: any) => toast.error(e.message || "Falha ao importar extrato"),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/") || f.type === "application/pdf") {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setLoading(true);
    try {
      let txs: TxForm[] = [];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        txs = await parseCsv(file);
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id;
        if (!uid) throw new Error("Não autenticado");
        const ext = file.name.split(".").pop() || (file.type.split("/")[1] ?? "jpg");
        const path = `${uid}/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from("receipts").upload(path, file, { contentType: file.type });
        if (up.error) throw up.error;
        const result = await extract({ data: { path } });
        const extractedTxs = (result as any).transacoes || [];
        txs = extractedTxs.map((t: any) => {
          const cat = t.categoria_sugerida || inferCategory(t.descricao_servico || t.estabelecimento || "");
          const isPJ = t.tipo_documento === "faturamento_pj";
          const isIncome = isPJ || t.tipo_documento === "devolucao" || (t.estabelecimento || "").toLowerCase().includes("devolução");
          const date = parseDateString(t.data);
          return {
            id: crypto.randomUUID(),
            doc_type: t.tipo_documento || "despesa",
            type: isIncome ? "income" : "expense",
            payment_method: "Cartão de Crédito",
            target_source: isPJ ? t.estabelecimento ?? "" : "",
            description: t.descricao_servico ?? "",
            establishment: t.estabelecimento ?? "",
            amount: t.valor != null ? String(t.valor) : "0",
            date,
            category: cat as any,
            classification: t.classificacao === "PJ" ? "PJ" : "PF",
            cardholder: t.portador || "Principal",
            confidence: t.confiança ?? null,
            sharing_type: "private",
            installments_current: null,
            installments_total: null,
            status: "pendente_revisao",
          } as TxForm;
        });
      }
      if (txs.length === 0) throw new Error("Nenhuma transação encontrada no extrato.");
      uploadMutation.mutate(txs);
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao processar o extrato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Importar Extrato Mensal</h1>
      <Card className="p-4">
        <input type="file" accept=".csv,application/pdf,image/*" onChange={handleFileChange} className="mb-4" />
        {preview && file?.type === 'application/pdf' ? (
          <object data={preview} type="application/pdf" className="mb-4 h-96 w-full rounded" />
        ) : preview ? (
          <img src={preview} alt="preview" className="mb-4 max-h-48 w-full max-w-full object-contain rounded" />
        ) : null}
        <Button onClick={processFile} disabled={loading || !file}>
          {loading ? "Processando..." : "Importar"}
        </Button>
      </Card>
    </div>
  );
}

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

      const processedTxs: any[] = [];
      const newTxs = txs.filter(t => {
         const tDate = t.date.split('T')[0];
         const tAmount = parseFloat(t.amount);
         const tEst = (t.establishment || t.description || "").toLowerCase().trim();
         
         const isDuplicateDB = existingTxs.some(ex => {
            const exDate = ex.date.split('T')[0];
            const exEst = (ex.establishment || ex.description || "").toLowerCase().trim();
            
            const isSameDate = exDate === tDate;
            const isSameAmount = ex.amount === tAmount;
            const isSameEst = exEst === tEst || 
                              (tEst.length > 2 && exEst.includes(tEst)) || 
                              (exEst.length > 2 && tEst.includes(exEst));

            return isSameDate && isSameAmount && isSameEst;
         });
         
         const isDuplicateSelf = processedTxs.some(ex => {
            const isSameDate = ex.date === tDate;
            const isSameAmount = ex.amount === tAmount;
            const exEst = ex.est;
            const isSameEst = exEst === tEst || 
                              (tEst.length > 2 && exEst.includes(tEst)) || 
                              (exEst.length > 2 && tEst.includes(exEst));
            return isSameDate && isSameAmount && isSameEst;
         });
         
         if (isDuplicateDB || isDuplicateSelf) {
           return false;
         }
         
         processedTxs.push({ date: tDate, amount: tAmount, est: tEst });
         return true;
      });

      if (newTxs.length === 0) {
        throw new Error("Todas as transações deste extrato já estavam cadastradas.");
      }

      const inserts = newTxs.map(t => {
         const tAmount = parseFloat(t.amount);
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
            status: "confirmado",
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
      <div>
        <h1 className="text-2xl font-bold">Importar Extrato Mensal</h1>
        <p className="text-muted-foreground mt-1">Faça o upload do seu extrato em CSV, PDF ou Imagem.</p>
      </div>
      
      <Card className="p-6">
        <div className="flex flex-col gap-6">
          
          {/* Custom File Upload Area */}
          <div className="relative">
            <input 
              type="file" 
              id="file-upload"
              accept=".csv,application/pdf,image/*" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}>
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="p-3 bg-muted rounded-full">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                {file ? (
                  <div>
                    <p className="font-semibold text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-sm">Clique ou arraste um arquivo aqui</p>
                    <p className="text-xs text-muted-foreground mt-1">Suporta arquivos .CSV, .PDF, .JPG e .PNG</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {preview && file?.type === 'application/pdf' ? (
            <div className="border rounded-xl overflow-hidden bg-muted/20">
              <object data={preview} type="application/pdf" className="h-[500px] w-full" />
            </div>
          ) : preview ? (
            <div className="border rounded-xl p-2 bg-muted/20 flex justify-center">
              <img src={preview} alt="preview" className="max-h-64 object-contain rounded-lg" />
            </div>
          ) : null}

          <Button 
            onClick={processFile} 
            disabled={loading || !file}
            size="lg"
            className="w-full text-base font-semibold"
          >
            {loading ? "Processando..." : file ? "Importar Arquivo" : "Selecione um arquivo"}
          </Button>
          
        </div>
      </Card>
    </div>
  );
}

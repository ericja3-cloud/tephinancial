import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { parseCsv, parsePdfOrImage, TxForm } from "@/lib/statement-parser";

export const Route = createFileRoute("/_authenticated/statement-upload")({
  component: StatementUploadPage,
});

function StatementUploadPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (txs: TxForm[]) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Usuário não autenticado");
      const inserts = txs.map((t) => ({
        user_id: user.id,
        type: t.type,
        payment_method: t.payment_method,
        target_source: t.target_source,
        doc_type: t.doc_type,
        classification: t.classification,
        cardholder: t.cardholder,
        amount: parseFloat(t.amount),
        description: t.description || t.establishment || "Comprovante",
        establishment: t.establishment || null,
        category: t.category,
        date: t.date,
        source: "upload",
        status: t.status,
        ai_confidence: t.confidence,
        receipt_url: null,
        sharing_type: t.sharing_type,
        paid_by: null,
      }));
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
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else if (f.type === "application/pdf") {
      setPreview(null);
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
        txs = await parsePdfOrImage(file);
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
        {preview && <img src={preview} alt="preview" className="mb-4 max-h-48 w-full max-w-full object-contain rounded" />}
        <Button onClick={processFile} disabled={loading || !file}>
          {loading ? "Processando..." : "Importar"}
        </Button>
      </Card>
    </div>
  );
}

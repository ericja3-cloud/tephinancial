import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extractReceipt, type ExtractResult } from "@/lib/receipts.functions";
import { CATEGORIES, type Category } from "@/lib/categories";
import { sendWhatsAppNotification } from "@/lib/whatsapp.functions";
import { Camera, Loader2, Sparkles, Upload, X, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

export const Route = createFileRoute("/_authenticated/capture")({
  head: () => ({ meta: [{ title: "Capturar comprovante – Tephinancial" }] }),
  validateSearch: (search: Record<string, unknown>): { defaultShared?: boolean } => ({
    defaultShared: search.defaultShared ? Boolean(search.defaultShared) : undefined,
  }),
  component: CapturePage,
});

type Stage = "idle" | "uploading" | "processing" | "review";

type TxForm = {
  id: string;
  doc_type: "despesa" | "faturamento_pj";
  type: "expense" | "income";
  payment_method: string;
  target_source: string;
  description: string;
  establishment: string;
  amount: string;
  date: string;
  category: Category;
  classification: "PF" | "PJ";
  cardholder: string;
  confidence: string | null;
  sharing_type: string;
  installments_current: number | null;
  installments_total: number | null;
  status: "pago" | "pendente_revisao";
};

function CapturePage() {
  const router = useRouter();
  const { defaultShared } = Route.useSearch();
  const extract = useServerFn(extractReceipt);
  const [stage, setStage] = useState<Stage>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [source, setSource] = useState<"upload" | "camera">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [forms, setForms] = useState<TxForm[]>([]);

  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStage("idle");
    setPreviewUrl(null);
    setStoragePath(null);
    setForms([]);
  };

  const handleFile = useCallback(async (file: File, origin: "upload" | "camera") => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Arquivo muito grande.");
      return;
    }
    setSource(origin);
    setStage("uploading");

    try {
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(file, options);
      }
      setPreviewUrl(URL.createObjectURL(fileToUpload));

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Não autenticado");
      const ext = fileToUpload.name.split(".").pop() || (fileToUpload.type.split("/")[1] ?? "jpg");
      const path = `${uid}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("receipts").upload(path, fileToUpload, { contentType: fileToUpload.type });
      if (up.error) throw up.error;
      setStoragePath(path);
      setStage("processing");

      const result: ExtractResult = await extract({ data: { path } });
      const txs = result.transacoes || [];
      if (txs.length === 0) throw new Error("Nenhuma transação encontrada no documento.");
      
const parseDateString = (d: string | null | undefined): string => {
  if (!d) return new Date().toISOString().slice(0, 10);
  // Match DD/MM/YYYY or DD-MM-YYYY
  const brMatch = d.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  // Fallback to JS parsing
  const parsed = new Date(d);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
};

      const newForms: TxForm[] = txs.map(t => {
        const cat = (t.categoria_sugerida && (CATEGORIES as readonly string[]).includes(t.categoria_sugerida) ? t.categoria_sugerida : "Outros") as Category;
        const isPJ = t.tipo_documento === "faturamento_pj";
        return {
          id: crypto.randomUUID(),
          doc_type: t.tipo_documento || "despesa",
          type: isPJ ? "income" : "expense",
          payment_method: "Cartão de Crédito",
          target_source: isPJ ? (t.estabelecimento ?? "") : "",
          description: t.descricao_servico ?? "",
          establishment: t.estabelecimento ?? "",
          amount: t.valor != null ? String(t.valor) : "0",
          date: parseDateString(t.data),
          category: cat,
          classification: (t.classificacao === "PJ" ? "PJ" : "PF") as "PF" | "PJ",
          cardholder: t.portador || "Principal",
          confidence: t.confiança ?? "Baixa",
          sharing_type: defaultShared ? "shared" : (t.propriedade === "casa" ? "shared" : "private"),
          installments_current: null,
          installments_total: null,
          status: "pendente_revisao",
        };
      });

      setForms(newForms);
      setStage("review");
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao processar comprovante");
      reset();
    }
  }, [extract]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Não autenticado");
      
      const allInserts: any[] = [];
      forms.forEach(f => {
        const amount = parseFloat(f.amount);
        const insert = {
          user_id: uid,
          type: f.type,
          payment_method: f.payment_method,
          target_source: f.target_source,
          doc_type: f.doc_type,
          classification: f.classification,
          cardholder: f.cardholder,
          amount: isNaN(amount) ? 0 : amount,
          description: f.description || f.establishment || "Comprovante",
          establishment: f.establishment || null,
          category: f.category,
          date: f.date,
          source,
          status: f.status,
          ai_confidence: f.confidence,
          receipt_url: storagePath,
          sharing_type: f.sharing_type,
          paid_by: f.sharing_type === "shared" ? (f.status === "pago" ? "me" : null) : null,
        };

        if (f.installments_total && f.installments_total > 1) {
          const valPerInstallment = insert.amount / f.installments_total;
          for (let i = 0; i < f.installments_total; i++) {
            const date = new Date(insert.date);
            date.setMonth(date.getMonth() + i);
            allInserts.push({
              ...insert,
              amount: valPerInstallment,
              date: date.toISOString().split("T")[0],
              installments_current: i + 1,
              installments_total: f.installments_total,
              status: i === 0 ? f.status : "pendente_revisao",
              paid_by: i === 0 ? insert.paid_by : null,
            });
          }
        } else {
          allInserts.push(insert);
        }
      });

      const { error } = await supabase.from("transactions").insert(allInserts);
      if (error) throw error;

      // Send WhatsApp notification if configured
      try {
        const { data: profile } = await supabase.from("profiles").select("whatsapp_number").eq("id", uid).maybeSingle();
        if (profile?.whatsapp_number) {
          sendWhatsAppNotification({
            data: {
              to: profile.whatsapp_number,
              templateName: "hello_world" // Template temporário para testes
            }
          }).catch(err => console.error("Falha ao enviar whatsapp em bg:", err));
        }
      } catch (e) {
        console.error("Erro ao tentar enviar notificação:", e);
      }
    },
    onSuccess: () => {
      toast.success("Transações registradas!");
      reset();
      router.navigate({ to: "/transactions" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-primary">Tephinancial</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tire uma foto do comprovante — a IA cuida do resto.</p>
      </header>

      {stage === "idle" && (
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
          <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center border-2 border-primary/20 bg-primary/5 hover:border-primary/50 transition">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Camera className="h-7 w-7" />
            </div>
            <div>
              <p className="font-semibold text-primary">Tirar foto</p>
              <p className="text-xs text-muted-foreground">Abre a câmera do celular</p>
            </div>
            <Button onClick={() => cameraRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" /> Abrir câmera
            </Button>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, "camera"); e.target.value = ""; }} />
          </Card>

          <div className="hidden items-center justify-center text-xs uppercase tracking-widest text-muted-foreground md:flex">ou</div>

          <Card
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f, "upload"); }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-10 text-center transition ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
            onClick={() => fileRef.current?.click()}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Upload className="h-7 w-7" />
            </div>
            <div>
              <p className="font-semibold">Arraste um arquivo aqui</p>
              <p className="text-xs text-muted-foreground">ou clique para escolher</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, "upload"); e.target.value = ""; }} />
          </Card>

          <div className="hidden items-center justify-center text-xs uppercase tracking-widest text-muted-foreground md:flex">ou</div>

          <Card 
            className="flex flex-col items-center justify-center gap-3 border-2 border-border border-dashed hover:border-primary/50 transition cursor-pointer p-10 text-center"
            onClick={() => router.navigate({ to: "/transactions", search: { action: "new" } })}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Pencil className="h-7 w-7" />
            </div>
            <div>
              <p className="font-semibold">Digitar Manualmente</p>
              <p className="text-xs text-muted-foreground">Preencher formulário sem IA</p>
            </div>
            <Button variant="outline" className="pointer-events-none" onClick={(e) => e.preventDefault()}>
              Abrir formulário
            </Button>
          </Card>
        </div>
      )}

      {(stage === "uploading" || stage === "processing") && (
        <Card className="flex flex-col items-center gap-4 p-10 text-center shadow-soft">
          {previewUrl && <img src={previewUrl} alt="preview" className="max-h-64 rounded-xl border object-contain" />}
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="font-medium">{stage === "uploading" ? "Enviando..." : "A IA está processando as transações..."}</p>
          </div>
        </Card>
      )}

      {stage === "review" && (
        <Card className="p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Confira o que a IA leu ({forms.length})</h2>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-[200px_1fr]">
            {previewUrl && <img src={previewUrl} alt="preview" className="sticky top-6 max-h-[500px] w-full rounded-xl border object-contain" />}
            
            <div className="flex flex-col gap-3">
              {forms.map((f, i) => (
                <div key={f.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{f.establishment || "Despesa"}</p>
                        <Badge variant="outline" className="text-[10px]">{f.cardholder}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{f.classification}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(f.date).toLocaleDateString("pt-BR")} · {f.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">R$ {f.amount}</span>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setForms(fs => fs.filter(x => x.id !== f.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-2 pt-3 border-t">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                      <select 
                        className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                        value={f.status}
                        onChange={(e) => setForms(fs => fs.map(x => x.id === f.id ? { ...x, status: e.target.value as "pago" | "pendente_revisao" } : x))}
                      >
                        <option value="pago">Já Pago</option>
                        <option value="pendente_revisao">A Pagar</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Parcela atual</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 1" 
                        className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                        value={f.installments_current || ""}
                        onChange={(e) => setForms(fs => fs.map(x => x.id === f.id ? { ...x, installments_current: parseInt(e.target.value) || null } : x))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Total parcelas</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 12" 
                        className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                        value={f.installments_total || ""}
                        onChange={(e) => setForms(fs => fs.map(x => x.id === f.id ? { ...x, installments_total: parseInt(e.target.value) || null } : x))}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {forms.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma transação na lista.</p>}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={async () => { if (storagePath) await supabase.storage.from("receipts").remove([storagePath]); reset(); }}>
              <X className="mr-1 h-4 w-4" /> Descartar
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || forms.length === 0}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar {forms.length} transações
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Check, HeartHandshake, Mail, Receipt, Trash2, Upload, ChevronLeft, ChevronRight, Plus, Loader2, Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useServerFn } from "@tanstack/react-start";
import { extractReceipt, type ExtractResult } from "@/lib/receipts.functions";
import imageCompression from "browser-image-compression";
import { useRef, useCallback } from "react";
import { brl } from "@/lib/format";
import { CATEGORIES, CATEGORY_COLORS, type Category } from "@/lib/categories";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Pencil } from "lucide-react";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";

export const Route = createFileRoute("/_authenticated/couple")({
  head: () => ({ meta: [{ title: "Casal – Tephinancial" }] }),
  component: CoupleDashboard,
});

type Tx = {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  establishment: string | null;
  status: string;
  source: string;
  type: string;
  classification: "PF" | "PJ" | null;
  cardholder: string | null;
  sharing_type: string;
  paid_by: string | null;
  user_id: string;
  is_fixed?: boolean;
  installments_current?: number | null;
  installments_total?: number | null;
  is_recurring?: boolean | null;
  notes?: string | null;
  target_source?: string | null;
};

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
  paid_by?: string | null;
  is_fixed?: boolean;
  is_recurring?: boolean | null;
  installments_current?: number | null;
  installments_total?: number | null;
  notes?: string | null;
};

function CoupleDashboard() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const extract = useServerFn(extractReceipt);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const [stage, setStage] = useState<"idle" | "uploading" | "processing" | "review">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [forms, setForms] = useState<TxForm[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [spouseEmail, setSpouseEmail] = useState("");
  const [mySplitInput, setMySplitInput] = useState("50");
  
  const [manualOpen, setManualOpen] = useState(false);
  const [manualForm, setManualForm] = useState<Partial<TxForm> & { id?: string }>({
    type: "expense",
    payment_method: "Pix",
    amount: "0",
    date: new Date().toISOString().split("T")[0],
    category: "Outros",
    sharing_type: "shared",
    paid_by: "me",
    is_fixed: false,
    is_recurring: false,
    notes: ""
  });

  const reset = () => {
    setStage("idle");
    setPreviewUrl(null);
    setStoragePath(null);
    setForms([]);
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Arquivo muito grande.");
      return;
    }
    setStage("uploading");

    try {
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true };
        fileToUpload = await imageCompression(file, options);
      }
      setPreviewUrl(URL.createObjectURL(fileToUpload));

      const uid = user?.id;
      if (!uid) throw new Error("Não autenticado");
      const ext = fileToUpload.name.split(".").pop() || (fileToUpload.type.split("/")[1] ?? "jpg");
      const path = `${uid}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("receipts").upload(path, fileToUpload, { contentType: fileToUpload.type });
      if (up.error) throw up.error;
      setStoragePath(path);
      setStage("processing");

      const result: ExtractResult = await extract({ data: { path } });
      const txs = result.transacoes || [];
      if (txs.length === 0) throw new Error("Nenhuma transação encontrada.");
      
      const newForms: TxForm[] = txs.map(t => {
        const cat = (t.categoria_sugerida && (CATEGORIES as readonly string[]).includes(t.categoria_sugerida) ? t.categoria_sugerida : "Outros") as Category;
        return {
          id: crypto.randomUUID(),
          doc_type: t.tipo_documento || "despesa",
          type: "expense", // Forçando para despesa na casa
          payment_method: "Cartão de Crédito",
          target_source: "",
          description: t.descricao_servico ?? "",
          establishment: t.estabelecimento ?? "",
          amount: t.valor != null ? String(t.valor) : "0",
          date: t.data ?? new Date().toISOString().slice(0, 10),
          category: cat,
          classification: "PF",
          cardholder: t.portador || "Principal",
          confidence: t.confiança ?? "Baixa",
          sharing_type: "shared", // Padrão
          paid_by: "me", // Padrão
        };
      });

      setForms(newForms);
      setStage("review");
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao processar comprovante");
      reset();
    }
  }, [extract, user]);

  const save = useMutation({
    mutationFn: async () => {
      const uid = user?.id;
      if (!uid) throw new Error("Não autenticado");
      
      const allInserts = [];
      for (const f of forms) {
        const isCreditCardAVista = f.payment_method === "Cartão de Crédito (À Vista)";
        const installTotal = isCreditCardAVista ? null : f.installments_total;
        const installCurrent = isCreditCardAVista ? null : f.installments_current;

        const insert = {
          user_id: uid,
          type: f.type,
          payment_method: f.payment_method === "Cartão de Crédito (Parcelado)" || f.payment_method === "Cartão de Crédito (À Vista)" ? "Cartão de Crédito" : f.payment_method,
          target_source: f.target_source,
          doc_type: f.doc_type,
          classification: f.classification,
          cardholder: f.cardholder,
          amount: parseFloat(f.amount) || 0,
          description: f.description || f.establishment || "Comprovante Casa",
          establishment: f.establishment || null,
          category: f.category,
          date: f.date,
          source: "upload",
          status: f.status || "confirmado",
          ai_confidence: f.confidence,
          receipt_url: storagePath,
          sharing_type: f.sharing_type || "shared",
          paid_by: f.paid_by || "me",
          is_fixed: f.is_fixed || false,
          is_recurring: f.is_recurring || false,
          installments_total: installTotal,
          installments_current: installCurrent,
          notes: f.notes
        };

        if (insert.installments_total && insert.installments_total > 1) {
          const valPerInstallment = insert.amount / insert.installments_total;
          insert.amount = valPerInstallment;
          for (let i = 0; i < insert.installments_total; i++) {
            const date = new Date(insert.date);
            date.setMonth(date.getMonth() + i);
            allInserts.push({
              ...insert,
              date: date.toISOString().split("T")[0],
              installments_current: i + 1,
            });
          }
        } else if (insert.is_fixed || insert.is_recurring) {
          for (let i = 0; i < 12; i++) {
            const date = new Date(insert.date);
            date.setMonth(date.getMonth() + i);
            allInserts.push({
              ...insert,
              date: date.toISOString().split("T")[0],
            });
          }
        } else {
          allInserts.push(insert);
        }
      }

      const { error } = await supabase.from("transactions").insert(allInserts);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Comprovante registrado na casa!");
      qc.invalidateQueries({ queryKey: ["transactions_shared"] });
      reset();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const saveManual = useMutation({
    mutationFn: async () => {
      const uid = user?.id;
      if (!uid) throw new Error("Não autenticado");
      const isCreditCardAVista = manualForm.payment_method === "Cartão de Crédito (À Vista)";
      const installTotal = isCreditCardAVista ? null : (manualForm.installments_total || null);
      const installCurrent = isCreditCardAVista ? null : (manualForm.installments_current || null);

      const insert = {
        user_id: uid,
        type: manualForm.type || "expense",
        payment_method: manualForm.payment_method === "Cartão de Crédito (Parcelado)" || manualForm.payment_method === "Cartão de Crédito (À Vista)" ? "Cartão de Crédito" : manualForm.payment_method || "Pix",
        target_source: manualForm.target_source || null,
        classification: "PF",
        cardholder: manualForm.cardholder || "Principal",
        amount: parseFloat(manualForm.amount as string) || 0,
        description: manualForm.description || manualForm.establishment || "Transação Casa",
        establishment: manualForm.establishment || null,
        category: manualForm.category || "Outros",
        date: manualForm.date,
        source: "manual",
        status: "confirmado",
        sharing_type: manualForm.sharing_type || "shared",
        paid_by: manualForm.paid_by || "me",
        installments_total: installTotal,
        installments_current: installCurrent,
        is_fixed: manualForm.is_fixed || false,
        is_recurring: manualForm.is_recurring || false,
        notes: manualForm.notes || null
      };
      
      if (manualForm.id) {
        const { error } = await supabase.from("transactions").update(insert).eq("id", manualForm.id);
        if (error) throw error;
      } else {
        const inserts = [];
        if (insert.installments_total && insert.installments_total > 1) {
          const valPerInstallment = insert.amount / insert.installments_total;
          insert.amount = valPerInstallment;
          for (let i = 0; i < insert.installments_total; i++) {
            const date = new Date(insert.date as string);
            date.setMonth(date.getMonth() + i);
            inserts.push({
              ...insert,
              date: date.toISOString().split("T")[0],
              installments_current: i + 1,
            });
          }
        } else if (insert.is_fixed || insert.is_recurring) {
          for (let i = 0; i < 12; i++) {
            const date = new Date(insert.date as string);
            date.setMonth(date.getMonth() + i);
            inserts.push({
              ...insert,
              date: date.toISOString().split("T")[0],
            });
          }
        } else {
          inserts.push(insert);
        }
        
        const { error } = await supabase.from("transactions").insert(inserts);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(manualForm.id ? "Transação atualizada!" : "Transação manual registrada!");
      qc.invalidateQueries({ queryKey: ["transactions_shared"] });
      setManualOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteTx = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Transação excluída!");
      qc.invalidateQueries({ queryKey: ["transactions_shared"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const linkPartner = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("profiles").update({
        spouse_email: spouseEmail || null,
        couple_split_ratio: { me: mySplitInput ? parseInt(mySplitInput) : 50, spouse: mySplitInput ? (100 - parseInt(mySplitInput)) : 50 }
      }).eq("id", user.id);
      if (error) throw error;
      if (spouseEmail) {
        // @ts-ignore
        await supabase.rpc("link_partner", { partner_email: spouseEmail });
      }
    },
    onSuccess: () => {
      toast.success("Configuração de vínculo salva!");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setSpouseEmail(profile.spouse_email || "");
      if (profile.couple_split_ratio && typeof profile.couple_split_ratio === 'object' && 'me' in profile.couple_split_ratio) {
        setMySplitInput(String((profile.couple_split_ratio as any).me));
      }
    }
  }, [profile]);

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ["transactions_shared"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .or("sharing_type.eq.shared,paid_by.eq.spouse")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Tx[];
    },
  });

  const monthKey = (d: string) => d.slice(0, 7);
  const thisMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  
  const monthTxs = txs.filter((t) => monthKey(t.date) === thisMonth && (t.paid_by === "me" || t.paid_by === "spouse"));

  const mySplit = profile?.couple_split_ratio && typeof profile.couple_split_ratio === 'object' && 'me' in profile.couple_split_ratio 
    ? Number((profile.couple_split_ratio as any).me) : 50;
  
  const totalSharedExpenses = monthTxs.filter((t) => t.type === "expense").reduce((a, b) => a + Number(b.amount), 0);
  
  let iPaidForShared = 0;
  let spousePaidForShared = 0;
  let iBorrowedFromSpouse = 0;
  let spouseBorrowedFromMe = 0;

  monthTxs.filter(t => t.type === "expense").forEach(t => {
    const iCreated = t.user_id === user?.id;
    if (t.sharing_type === "shared") {
      if (iCreated) {
        if (t.paid_by === "me") iPaidForShared += Number(t.amount);
        else spousePaidForShared += Number(t.amount);
      } else {
        if (t.paid_by === "me") spousePaidForShared += Number(t.amount);
        else iPaidForShared += Number(t.amount);
      }
    } else if (t.sharing_type === "private" && t.paid_by === "spouse") {
      if (iCreated) {
        iBorrowedFromSpouse += Number(t.amount);
      } else {
        spouseBorrowedFromMe += Number(t.amount);
      }
    }
  });

  const myFairShare = totalSharedExpenses * (mySplit / 100);
  const myBalanceShared = iPaidForShared - myFairShare;
  const myTotalBalance = myBalanceShared + spouseBorrowedFromMe - iBorrowedFromSpouse;

  const splitData = [
    { name: "Eu Paguei", value: iPaidForShared + spouseBorrowedFromMe, color: "#3b82f6" },
    { name: "Parceiro Pagou", value: spousePaidForShared + iBorrowedFromSpouse, color: "#ec4899" },
  ];

  const categories = monthTxs.filter(t => t.type === "expense" && t.sharing_type === "shared").reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const borrowedTxs = monthTxs.filter(t => t.sharing_type === "private" && t.paid_by === "spouse");
  const fixedTxs = monthTxs.filter(t => t.sharing_type === "shared" && t.is_fixed);
  const normalSharedTxs = monthTxs.filter(t => t.sharing_type === "shared" && !t.is_fixed);

  const renderTxList = (list: Tx[]) => (
    <Card className="p-0 shadow-soft">
      {isLoading ? (
        <div className="space-y-2 p-5">{[0,1,2].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : list.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">Nenhuma transação nesta aba para este mês.</div>
      ) : (
        <ul className="divide-y">
          {list.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-3 p-4 hover:bg-muted/50 transition">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{t.target_source || t.establishment || t.description}</p>
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px] flex items-center gap-1">
                    {t.user_id === user?.id ? "🙋‍♂️ Mim" : "🙋‍♀️ Parceiro"}
                  </Badge>
                  {t.is_fixed && <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">Fixa</Badge>}
                  {t.is_recurring && <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">Recorrente</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>{new Date(t.date).toLocaleDateString("pt-BR")}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[t.category as Category] ?? "#9CA3AF" }} />
                    {t.category}
                  </span>
                  {t.installments_total ? (
                    <span>· Parcela {t.installments_current}/{t.installments_total}</span>
                  ) : null}
                </div>
                {t.notes && <p className="mt-2 text-xs italic text-muted-foreground bg-muted p-2 rounded">"{t.notes}"</p>}
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className={`font-semibold block ${t.type === "income" ? "text-success" : ""}`}>
                  {t.type === "income" ? "+" : "-"} {brl(Number(t.amount))}
                </span>
                {t.sharing_type === "private" && t.paid_by === "spouse" && (
                  <span className="text-[10px] text-rose-500 font-medium">Cartão Emprestado</span>
                )}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                    let method = t.payment_method;
                    if (method === "Cartão de Crédito") {
                      method = (t.installments_total && t.installments_total > 1) 
                        ? "Cartão de Crédito (Parcelado)" 
                        : "Cartão de Crédito (À Vista)";
                    }
                    setManualForm({ ...t, amount: String(t.amount), payment_method: method } as any);
                    setManualOpen(true);
                  }}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteTx.mutate(t.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );

  return (
    <div className="flex flex-col xl:grid xl:grid-cols-3 xl:gap-6 space-y-6 xl:space-y-0">
      <div className="xl:col-span-2 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <HeartHandshake className="h-7 w-7 text-rose-500" /> Finanças do Casal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Orçamento e acerto de contas compartilhado.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex w-full sm:w-auto gap-2">
            <Button onClick={() => {
              setManualForm({
                type: "expense",
                payment_method: "Pix",
                amount: "0",
                date: new Date().toISOString().split("T")[0],
                category: "Outros",
                sharing_type: "shared",
                paid_by: "me",
                notes: ""
              });
              setManualOpen(true);
            }} variant="outline" className="flex-1 gap-2">
              <Plus className="h-4 w-4" /> Manual
            </Button>
            <Button onClick={() => fileRef.current?.click()} className="flex-1 gap-2">
              <Camera className="h-4 w-4" /> Escanear
            </Button>
          </div>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          <div className="flex items-center justify-between gap-2 rounded-lg border bg-card p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 z-10" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <div className="w-32 text-center text-sm font-medium capitalize cursor-pointer hover:bg-muted/50 rounded py-1 pointer-events-auto">
                  {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentMonth)}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <div className="flex gap-2">
                  <Select value={currentMonth.getMonth().toString()} onValueChange={(v) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(v), 1))}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>{new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2000, i, 1))}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={currentMonth.getFullYear().toString()} onValueChange={(v) => setCurrentMonth(new Date(parseInt(v), currentMonth.getMonth(), 1))}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }).map((_, i) => {
                        const year = new Date().getFullYear() - 10 + i;
                        return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="h-8 w-8 z-10" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {!profile?.spouse_id && (
        <Card className="p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-rose-600 mb-1">Conta não vinculada!</h2>
              <p className="text-sm text-muted-foreground">Você ainda não vinculou um parceiro. Convide seu cônjuge pelo e-mail para começarem a dividir as contas.</p>
            </div>
            <HeartHandshake className="h-6 w-6 text-rose-500/50" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>E-mail do Parceiro(a)</Label>
              <Input type="email" value={spouseEmail} onChange={(e) => setSpouseEmail(e.target.value)} placeholder="email@exemplo.com" />
              <p className="mt-1 text-xs text-muted-foreground">O parceiro também precisará ter uma conta e adicionar seu e-mail aqui para confirmar o vínculo.</p>
            </div>
            <div>
              <Label>Sua Proporção nas Despesas (%)</Label>
              <Input type="number" min="0" max="100" value={mySplitInput} onChange={(e) => setMySplitInput(e.target.value)} placeholder="Ex: 50" />
              <p className="mt-1 text-xs text-muted-foreground">Qual porcentagem das despesas da casa VOCÊ paga? Ex: 50%. O resto é calculado sozinho.</p>
            </div>
          </div>
          <Button onClick={() => linkPartner.mutate()} disabled={linkPartner.isPending} className="mt-4 bg-rose-600 hover:bg-rose-700 text-white">Salvar Configuração</Button>
        </Card>
      )}

      <Tabs defaultValue="resumo">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumo">Resumo da Casa</TabsTrigger>
          <TabsTrigger value="emprestimos">Empréstimos</TabsTrigger>
          <TabsTrigger value="fixas">Contas Fixas</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6 flex flex-col justify-center items-center">
              <h3 className="font-semibold text-lg mb-2 text-center">Despesas Compartilhadas</h3>
              <p className="text-4xl font-bold text-foreground mb-6">{brl(totalSharedExpenses)}</p>
              
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={splitData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      {splitData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => brl(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 flex flex-col justify-center">
              <h3 className="font-semibold text-lg mb-4 text-center">Acerto de Contas Total</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Divisão Combinada (Casa)</span>
                  <span className="font-medium">{mySplit}% / {100 - mySplit}%</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minha parte justa (Casa)</span>
                  <span className="font-medium">{brl(myFairShare)}</span>
                </div>
                
                <div className="flex justify-between text-sm pb-4 border-b">
                  <span className="text-muted-foreground">Eu peguei emprestado</span>
                  <span className="font-medium text-rose-500">{brl(iBorrowedFromSpouse)}</span>
                </div>

                <div className="flex justify-between text-sm pb-4 border-b">
                  <span className="text-muted-foreground">Parceiro pegou emprestado</span>
                  <span className="font-medium text-emerald-500">{brl(spouseBorrowedFromMe)}</span>
                </div>

                <div className="pt-4 text-center">
                  {myTotalBalance > 0 ? (
                    <div className="text-emerald-500">
                      <p className="text-sm font-medium mb-1">Seu parceiro deve transferir para você</p>
                      <p className="text-3xl font-bold">{brl(myTotalBalance)}</p>
                    </div>
                  ) : myTotalBalance < 0 ? (
                    <div className="text-rose-500">
                      <p className="text-sm font-medium mb-1">Você deve transferir para o parceiro</p>
                      <p className="text-3xl font-bold">{brl(Math.abs(myTotalBalance))}</p>
                    </div>
                  ) : (
                    <div className="text-blue-500">
                      <p className="text-sm font-medium mb-1">Tudo certo!</p>
                      <p className="text-3xl font-bold">Quites 🎉</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Gastos Compartilhados por Categoria</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `R$${v}`} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => brl(value)} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] ?? "#9ca3af"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <h3 className="font-semibold text-lg mt-6 mb-2">Transações Variáveis (Casa)</h3>
          {renderTxList(normalSharedTxs)}
        </TabsContent>

        <TabsContent value="emprestimos" className="pt-4">
          <Card className="mb-4 p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Esta aba mostra gastos <strong>particulares</strong> onde a opção "Parceiro pagou" foi marcada (ex: você usou o cartão do parceiro para comprar algo seu). O valor integral dessas compras é cobrado no acerto final.
            </p>
          </Card>
          {renderTxList(borrowedTxs)}
        </TabsContent>

        <TabsContent value="fixas" className="pt-4">
          <Card className="mb-4 p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Aqui estão listadas as despesas da casa marcadas como <strong>Fixas/Recorrentes</strong> (ex: Aluguel, Luz, Condomínio).
            </p>
          </Card>
          {renderTxList(fixedTxs)}
        </TabsContent>
      </Tabs>
      </div>

      <div className="xl:col-span-1 space-y-6">
        <CalendarWidget mode="couple" />
      </div>

      <Dialog open={stage !== "idle"} onOpenChange={(o) => { if (!o) reset(); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Comprovante da Casa</DialogTitle>
          </DialogHeader>

          {(stage === "uploading" || stage === "processing") && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              {previewUrl && <img src={previewUrl} alt="preview" className="max-h-64 rounded-xl border object-contain" />}
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="font-medium">{stage === "uploading" ? "Enviando..." : "A IA está processando..."}</p>
              </div>
            </div>
          )}

          {stage === "review" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Confira o que a IA leu</h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                {forms.map((f) => (
                  <div key={f.id} className="flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="truncate font-medium">{f.establishment || "Despesa"}</p>
                        <p className="text-sm text-muted-foreground">{new Date(f.date).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-rose-500">R$ {f.amount}</span>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setForms(fs => fs.filter(x => x.id !== f.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Propriedade do Gasto</Label>
                        <Select value={f.sharing_type} onValueChange={(v) => setForms(fs => fs.map(x => x.id === f.id ? { ...x, sharing_type: v } : x))}>
                          <SelectTrigger className="h-7 text-xs mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="private">Particular</SelectItem>
                            <SelectItem value="shared">Compartilhado (Casa)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Quem pagou?</Label>
                        <Select 
                          value={["me", "spouse", "Pai", "Mãe", "Irmã"].includes(f.paid_by || "me") ? (f.paid_by || "me") : "custom"} 
                          onValueChange={(v) => {
                            if (v === "custom") setForms(fs => fs.map(x => x.id === f.id ? { ...x, paid_by: "" } : x));
                            else setForms(fs => fs.map(x => x.id === f.id ? { ...x, paid_by: v } : x));
                          }}
                        >
                          <SelectTrigger className="h-7 text-xs mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="me">Eu paguei</SelectItem>
                            <SelectItem value="spouse">Marido</SelectItem>
                            <SelectItem value="Pai">Pai</SelectItem>
                            <SelectItem value="Mãe">Mãe</SelectItem>
                            <SelectItem value="Irmã">Irmã</SelectItem>
                            <SelectItem value="custom">✍️ Digitar...</SelectItem>
                          </SelectContent>
                        </Select>
                        {!["me", "spouse", "Pai", "Mãe", "Irmã"].includes(f.paid_by || "me") && (
                          <Input 
                            className="h-7 text-xs mt-1" 
                            placeholder="Nome..." 
                            value={f.paid_by ?? ""} 
                            onChange={(e) => setForms(fs => fs.map(x => x.id === f.id ? { ...x, paid_by: e.target.value } : x))} 
                          />
                        )}
                      </div>
                      <div className="col-span-2">
                        <Label className="text-[10px] text-muted-foreground">Forma de Pgto</Label>
                        <Select value={f.payment_method || "Pix"} onValueChange={(v) => setForms(fs => fs.map(x => x.id === f.id ? { ...x, payment_method: v } : x))}>
                          <SelectTrigger className="h-7 text-xs mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pix">Pix</SelectItem>
                            <SelectItem value="Cartão de Crédito (À Vista)">Cartão de Crédito (À Vista)</SelectItem>
                            <SelectItem value="Cartão de Crédito (Parcelado)">Cartão de Crédito (Parcelado)</SelectItem>
                            <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="Transferência">Transferência</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-[10px] text-muted-foreground">Categoria</Label>
                        <Select value={f.category || "Outros"} onValueChange={(v) => setForms(fs => fs.map(x => x.id === f.id ? { ...x, category: v as Category } : x))}>
                          <SelectTrigger className="h-7 text-xs mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                    {(f.payment_method === "Cartão de Crédito (Parcelado)") && (
                      <div className="grid grid-cols-2 gap-2 mt-1 bg-muted/50 p-2 rounded">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Parcela Atual</Label>
                          <Input type="number" className="h-7 text-xs" value={f.installments_current || ""} onChange={(e) => setForms(fs => fs.map(x => x.id === f.id ? { ...x, installments_current: parseInt(e.target.value) || null } : x))} placeholder="Ex: 1" />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Total Parcelas</Label>
                          <Input type="number" className="h-7 text-xs" value={f.installments_total || ""} onChange={(e) => setForms(fs => fs.map(x => x.id === f.id ? { ...x, installments_total: parseInt(e.target.value) || null } : x))} placeholder="Ex: 12" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center space-x-1.5">
                        <Checkbox id={`fix-${f.id}`} className="h-3.5 w-3.5" checked={!!f.is_fixed} onCheckedChange={(c) => setForms(fs => fs.map(x => x.id === f.id ? { ...x, is_fixed: c === true } : x))} />
                        <Label htmlFor={`fix-${f.id}`} className="text-[10px]">Despesa Fixa</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Checkbox id={`rec-${f.id}`} className="h-3.5 w-3.5" checked={!!f.is_recurring} onCheckedChange={(c) => setForms(fs => fs.map(x => x.id === f.id ? { ...x, is_recurring: c === true } : x))} />
                        <Label htmlFor={`rec-${f.id}`} className="text-[10px]">Recorrente</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t">
                <Button variant="ghost" onClick={async () => { if (storagePath) await supabase.storage.from("receipts").remove([storagePath]); reset(); }}>
                  Cancelar
                </Button>
                <Button onClick={() => save.mutate()} disabled={save.isPending || forms.length === 0}>
                  {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmar e Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Transação da Casa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Propriedade do Gasto</Label>
                <Select value={manualForm.sharing_type || "shared"} onValueChange={(v) => setManualForm({ ...manualForm, sharing_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Particular (Apenas Meu)</SelectItem>
                    <SelectItem value="shared">Conta da Casa (Compartilhado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quem pagou?</Label>
                <Select 
                  value={["me", "spouse", "Pai", "Mãe", "Irmã"].includes(manualForm.paid_by || "me") ? (manualForm.paid_by || "me") : "custom"} 
                  onValueChange={(v) => {
                    if (v === "custom") setManualForm({ ...manualForm, paid_by: "" });
                    else setManualForm({ ...manualForm, paid_by: v });
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="me">Eu paguei</SelectItem>
                    <SelectItem value="spouse">Marido</SelectItem>
                    <SelectItem value="Pai">Pai</SelectItem>
                    <SelectItem value="Mãe">Mãe</SelectItem>
                    <SelectItem value="Irmã">Irmã</SelectItem>
                    <SelectItem value="custom">✍️ Digitar nome...</SelectItem>
                  </SelectContent>
                </Select>
                {!["me", "spouse", "Pai", "Mãe", "Irmã"].includes(manualForm.paid_by || "me") && (
                  <Input 
                    className="mt-2" 
                    placeholder="Digite o nome de quem pagou..." 
                    value={manualForm.paid_by ?? ""} 
                    onChange={(e) => setManualForm({ ...manualForm, paid_by: e.target.value })} 
                  />
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Forma de Pgto</Label>
                <Select value={manualForm.payment_method || "Pix"} onValueChange={(v) => setManualForm({ ...manualForm, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Cartão de Crédito (À Vista)">Cartão de Crédito (À Vista)</SelectItem>
                    <SelectItem value="Cartão de Crédito (Parcelado)">Cartão de Crédito (Parcelado)</SelectItem>
                    <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={manualForm.amount} onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })} />
              </div>
            </div>

            {manualForm.payment_method === "Cartão de Crédito (Parcelado)" && (
              <div className="grid gap-3 sm:grid-cols-2 p-3 bg-muted rounded-lg">
                <div>
                  <Label>Parcela Atual</Label>
                  <Input type="number" value={manualForm.installments_current || ""} onChange={(e) => setManualForm({ ...manualForm, installments_current: parseInt(e.target.value) || null })} placeholder="Ex: 1" />
                </div>
                <div>
                  <Label>Total de Parcelas</Label>
                  <Input type="number" value={manualForm.installments_total || ""} onChange={(e) => setManualForm({ ...manualForm, installments_total: parseInt(e.target.value) || null })} placeholder="Ex: 12" />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox id="fixed-manual" checked={!!manualForm.is_fixed} onCheckedChange={(checked) => setManualForm({ ...manualForm, is_fixed: checked === true })} />
              <Label htmlFor="fixed-manual">Despesa Fixa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="recurring-manual" checked={!!manualForm.is_recurring} onCheckedChange={(checked) => setManualForm({ ...manualForm, is_recurring: checked === true })} />
              <Label htmlFor="recurring-manual">Despesa Recorrente</Label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Descrição / Estabelecimento</Label>
                <Input value={manualForm.description || ""} onChange={(e) => setManualForm({ ...manualForm, description: e.target.value, establishment: e.target.value })} />
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={manualForm.date || ""} onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>Categoria</Label>
              <Select value={manualForm.category || "Outros"} onValueChange={(v) => setManualForm({ ...manualForm, category: v as Category })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div>
              <Label>Anotações (No que foi gasto?)</Label>
              <Textarea placeholder="Detalhes adicionais da transação..." value={manualForm.notes || ""} onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })} />
            </div>

            <Button onClick={() => saveManual.mutate()} disabled={saveManual.isPending} className="mt-2">
              {saveManual.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Transação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

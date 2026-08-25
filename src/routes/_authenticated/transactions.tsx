import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { brl } from "@/lib/format";
import { CATEGORIES, CATEGORY_COLORS, SOURCE_LABEL, type Category } from "@/lib/categories";
import { Camera, Check, Mail, Paperclip, Pencil, Receipt, Trash2, Upload, Briefcase, Plus, ChevronLeft, ChevronRight, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/transactions")({
  head: () => ({ meta: [{ title: "Transações – Tephinancial" }] }),
  validateSearch: (search: Record<string, unknown>): { action?: string } => ({
    action: search.action as string | undefined,
  }),
  component: TransactionsPage,
});

type Tx = {
  id: string;
  amount: number;
  sharing_type?: string;
  paid_by?: string;
  installments_total?: number | null;
  installments_current?: number | null;
  is_fixed?: boolean;
  is_recurring?: boolean | null;
  notes?: string | null;
  category: string;
  date: string;
  description: string;
  establishment: string | null;
  status: string;
  source: string;
  type: string;
  ai_confidence: string | null;
  receipt_url: string | null;
  payment_method?: string;
  target_source?: string;
  doc_type?: string;
  classification?: "PF" | "PJ" | null;
  cardholder?: string | null;
};

function SourceIcon({ source }: { source: string }) {
  const cls = "h-3 w-3";
  if (source === "upload") return <Upload className={cls} />;
  if (source === "camera") return <Camera className={cls} />;
  if (source === "email") return <Mail className={cls} />;
  return <Receipt className={cls} />;
}

function TransactionsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const searchParams = Route.useSearch();
  
  const emptyTx: Partial<Tx> = {
    amount: 0,
    category: "Outros",
    date: new Date().toISOString().split("T")[0],
    description: "",
    establishment: "",
    type: "expense",
    status: "confirmado",
    source: "manual",
    payment_method: "Pix",
    doc_type: "despesa",
    classification: "PF",
    sharing_type: "private",
    paid_by: "me",
    cardholder: "Principal",
  };

  const [filter, setFilter] = useState<"all" | "pendente_revisao" | "confirmado">("all");
  const [holderFilter, setHolderFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [editing, setEditing] = useState<Partial<Tx> | null>(searchParams.action === "new" ? emptyTx : null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Tx[];
    },
  });

  const { data: incomeSources = [] } = useQuery({
    queryKey: ["incomeSources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("target_source").eq("type", "income").not("target_source", "is", null);
      if (error) return [];
      const sources = new Set(data.map(d => d.target_source).filter(Boolean));
      return Array.from(sources) as string[];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
      return data;
    },
    enabled: !!user?.id
  });

  const userCards = useMemo(() => {
    if (!profile?.cardholders) return ["Principal"];
    const arr: string[] = [];
    (profile.cardholders as any[]).forEach(card => {
      card.holders?.forEach((h: string) => {
        arr.push(`${card.cardName} - ${h}`);
      });
    });
    return arr.length > 0 ? arr : ["Principal"];
  }, [profile]);

  const saveTx = useMutation({
    mutationFn: async (t: Partial<Tx>) => {
      const payload = {
        establishment: t.establishment || null,
        description: t.description || "Lançamento manual",
        amount: Number(t.amount) || 0,
        category: t.category || "Outros",
        date: t.date || new Date().toISOString().split("T")[0],
        type: t.type || "expense",
        payment_method: t.payment_method === "Cartão de Crédito (Parcelado)" || t.payment_method === "Cartão de Crédito (À Vista)" ? "Cartão de Crédito" : t.payment_method || null,
        target_source: t.target_source || null,
        doc_type: t.doc_type || null,
        classification: t.classification || null,
        cardholder: t.cardholder || null,
        status: t.status ? t.status : ((t.date && t.date > new Date().toISOString().split("T")[0]) || t.is_fixed || t.is_recurring ? "pendente_revisao" : "confirmado"),
        source: t.source || "manual",
        sharing_type: t.sharing_type || "private",
        paid_by: t.paid_by || "me",
        installments_total: t.payment_method === "Cartão de Crédito (À Vista)" ? null : (t.installments_total || null),
        installments_current: t.payment_method === "Cartão de Crédito (À Vista)" ? null : (t.installments_current || null),
        is_fixed: t.is_fixed || false,
        is_recurring: t.is_recurring || false,
        notes: t.notes || null,
      };

      if (t.id) {
        const { error } = await supabase.from("transactions").update(payload).eq("id", t.id);
        if (error) throw error;
      } else {
        const inserts = [];
        const basePayload = { ...payload, user_id: user!.id };
        
        if (payload.installments_total && payload.installments_total > 1) {
          const valPerInstallment = basePayload.amount / payload.installments_total;
          basePayload.amount = valPerInstallment;
          
          for (let i = 0; i < payload.installments_total; i++) {
            const date = new Date(payload.date);
            date.setMonth(date.getMonth() + i);
            const dateStr = date.toISOString().split("T")[0];
            const isFuture = dateStr > new Date().toISOString().split("T")[0];
            inserts.push({
              ...basePayload,
              date: dateStr,
              installments_current: i + 1,
              status: isFuture ? "pendente_revisao" : basePayload.status,
            });
          }
        } else if (payload.is_fixed || payload.is_recurring) {
          for (let i = 0; i < 12; i++) {
            const date = new Date(payload.date);
            date.setMonth(date.getMonth() + i);
            const dateStr = date.toISOString().split("T")[0];
            const isFuture = dateStr > new Date().toISOString().split("T")[0];
            inserts.push({
              ...basePayload,
              date: dateStr,
              status: isFuture ? "pendente_revisao" : basePayload.status,
            });
          }
        } else {
          inserts.push(basePayload);
        }
        
        const { error } = await supabase.from("transactions").insert(inserts);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transação salva!");
      setEditing(null);
    },
    onError: (e: any) => {
      console.error(e);
      alert("ERRO DO BANCO DE DADOS:\n" + JSON.stringify(e));
      toast.error("Erro ao salvar: " + (e.message || "Verifique os campos"));
    }
  });

  const confirm = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").update({ status: "confirmado" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const del = useMutation({
    mutationFn: async (t: Tx) => {
      if (t.receipt_url) await supabase.storage.from("receipts").remove([t.receipt_url]);
      const { error } = await supabase.from("transactions").delete().eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Removida");
    },
  });

  const openReceipt = async (path: string) => {
    const { data, error } = await supabase.storage.from("receipts").createSignedUrl(path, 3600);
    if (error) return toast.error(error.message);
    setViewing(data.signedUrl);
  };

  const monthKey = (d: string) => d.slice(0, 7);
  const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

  const filtered = txs.filter((t) => {
    const statusMatch = filter === "all" || t.status === filter;
    const holderMatch = holderFilter === "all" || (t.cardholder || "Principal") === holderFilter;
    const methodMatch = methodFilter === "all" || (t.payment_method || "Outro") === methodFilter;
    const typeMatch = typeFilter === "all" || t.type === typeFilter;
    const monthMatch = monthKey(t.date) === currentMonthKey;
    return statusMatch && holderMatch && methodMatch && typeMatch && monthMatch;
  });
  
  const pendingCount = txs.filter((t) => t.status === "pendente_revisao").length;
  
  // Extract unique holders
  const uniqueHolders = Array.from(new Set(txs.map(t => t.cardholder || "Principal").filter(Boolean)));

  // Extract unique methods
  const uniqueMethods = Array.from(new Set(txs.map(t => t.payment_method || "Outro").filter(Boolean)));

  const handleAdd = () => {
    setEditing({
      type: "income",
      date: new Date().toISOString().split("T")[0],
      classification: "PJ",
      payment_method: "Transferência",
      amount: 0,
      category: "Outros",
      source: "manual",
      sharing_type: "private",
      paid_by: "me",
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Transações</h1>
            <p className="mt-1 text-sm text-muted-foreground">Tudo o que a IA registrou pra você.</p>
          </div>
          <div className="flex items-center gap-4">
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
            <Button onClick={handleAdd}><Plus className="mr-2 h-4 w-4" /> Nova Transação</Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">Todas ({filtered.length})</TabsTrigger>
            <TabsTrigger value="pendente_revisao">Pendentes ({filtered.filter(t => t.status === "pendente_revisao").length})</TabsTrigger>
            <TabsTrigger value="confirmado">Confirmadas</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Entradas e Saídas</SelectItem>
              <SelectItem value="income">Só Entradas (Recebimentos)</SelectItem>
              <SelectItem value="expense">Só Saídas (Despesas)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={holderFilter} onValueChange={setHolderFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Filtrar Conta/Cartão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Contas/Cartões</SelectItem>
              {uniqueHolders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Filtrar Pgto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Formas</SelectItem>
              {uniqueMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-0 shadow-soft">
        {isLoading ? (
          <div className="space-y-2 p-5">{[0,1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Nada por aqui.</div>
        ) : (
          <ul className="divide-y">
            {filtered.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium flex items-center gap-2">
                      {t.target_source || t.establishment || t.description}
                      {t.sharing_type === "shared" && (
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">
                          <HeartHandshake className="w-3 h-3 mr-1" /> Casal
                        </Badge>
                      )}
                    </p>
                    {t.doc_type === "faturamento_pj" && t.type !== "expense" && (
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 gap-1 px-1.5 py-0 text-[10px]">
                        <Briefcase className="h-3 w-3" /> Faturamento PJ
                      </Badge>
                    )}
                    {t.status === "pendente_revisao" && (
                      <Badge variant="outline" className="border-warning/40 text-warning-foreground">pendente</Badge>
                    )}
                    {t.classification === "PF" && (
                      <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 px-1.5 py-0 text-[10px]">PF</Badge>
                    )}
                    {t.classification === "PJ" && (
                      <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 px-1.5 py-0 text-[10px]">PJ</Badge>
                    )}
                    {(t.sharing_type === "shared" || t.paid_by === "spouse") && (
                      <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-600 gap-1 px-1.5 py-0 text-[10px]">
                        👥 Casal
                      </Badge>
                    )}
                    {t.cardholder && (
                      <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{t.cardholder}</Badge>
                    )}
                    {t.receipt_url && (
                      <button onClick={() => openReceipt(t.receipt_url!)} className="text-muted-foreground hover:text-foreground">
                        <Paperclip className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span>{new Date(t.date).toLocaleDateString("pt-BR")}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[t.category as Category] ?? "#9CA3AF" }} />
                      {t.category}
                    </span>
                    <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[10px]">
                      <SourceIcon source={t.source} />
                      {SOURCE_LABEL[t.source] ?? t.source}
                    </Badge>
                  </div>
                </div>
                <span className={`font-semibold ${t.type === "income" ? "text-success" : ""}`}>
                  {t.type === "income" ? "+" : "-"} {brl(Number(t.amount))}
                </span>
                <div className="flex gap-1">
                  {t.status === "pendente_revisao" && (
                    <Button size="icon" variant="ghost" onClick={() => confirm.mutate(t.id)} title="Confirmar">
                      <Check className="h-4 w-4 text-success" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => {
                     let method = t.payment_method;
                     if (method === "Cartão de Crédito") {
                       method = (t.installments_total && t.installments_total > 1) 
                         ? "Cartão de Crédito (Parcelado)" 
                         : "Cartão de Crédito (À Vista)";
                     }
                     setEditing({ ...t, payment_method: method });
                   }} title="Editar">
                     <Pencil className="h-4 w-4" />
                   </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" title="Remover">
                        <Trash2 className="h-4 w-4 text-destructive" />
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
                        <AlertDialogAction onClick={() => del.mutate(t)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Editar transação" : "Nova transação manual"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4 py-4 max-h-[85vh] overflow-y-auto pr-2">
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={editing.type} onValueChange={(v) => {
                      const docType = v === "expense" && editing.doc_type === "faturamento_pj" ? "despesa" : editing.doc_type;
                      setEditing({ ...editing, type: v as any, doc_type: docType });
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Entrada</SelectItem>
                        <SelectItem value="expense">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Classificação</Label>
                    <Select value={editing.classification || "PF"} onValueChange={(v) => setEditing({ ...editing, classification: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PF">Pessoal (PF)</SelectItem>
                        <SelectItem value="PJ">Profissional (PJ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>{editing.type === "income" ? "Quem pagou? (Origem)" : "Local / Estabelecimento"}</Label>
                  <Input value={editing.establishment ?? ""} onChange={(e) => setEditing({ ...editing, establishment: e.target.value })} placeholder="Ex: Mercado Assaí, Cliente X" />
                </div>
                
                <div>
                  <Label>Categoria</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Valor (R$)</Label>
                    <Input type="number" step="0.01" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
                  </div>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2 mt-2">
                  <div>
                    <Label>Forma de Pgto</Label>
                    <Select value={editing.payment_method || "Pix"} onValueChange={(v) => setEditing({ ...editing, payment_method: v })}>
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
                    <Label>Conta / Cartão</Label>
                    <Select 
                      value={userCards.includes(editing.cardholder ?? "Principal") ? (editing.cardholder ?? "Principal") : "Outros"} 
                      onValueChange={(v) => {
                        if (v === "Outros") setEditing({ ...editing, cardholder: "" });
                        else setEditing({ ...editing, cardholder: v });
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {userCards.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        <SelectItem value="Outros">➕ Outros...</SelectItem>
                      </SelectContent>
                    </Select>
                    {!userCards.includes(editing.cardholder ?? "Principal") && (
                      <Input 
                        className="mt-2" 
                        placeholder="Digite o nome do cartão/conta..." 
                        value={editing.cardholder ?? ""} 
                        onChange={(e) => setEditing({ ...editing, cardholder: e.target.value })} 
                      />
                    )}
                  </div>
                </div>
                
                {editing.type !== "income" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Propriedade do Gasto</Label>
                      <Select value={editing.sharing_type || "private"} onValueChange={(v) => setEditing({ ...editing, sharing_type: v })}>
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
                        value={["me", "spouse", "Pai", "Mãe", "Irmã"].includes(editing.paid_by || "me") ? (editing.paid_by || "me") : "custom"} 
                        onValueChange={(v) => {
                          if (v === "custom") setEditing({ ...editing, paid_by: "" });
                          else setEditing({ ...editing, paid_by: v });
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
                      {!["me", "spouse", "Pai", "Mãe", "Irmã"].includes(editing.paid_by || "me") && (
                        <Input 
                          className="mt-2" 
                          placeholder="Digite o nome de quem pagou..." 
                          value={editing.paid_by ?? ""} 
                          onChange={(e) => setEditing({ ...editing, paid_by: e.target.value })} 
                        />
                      )}
                    </div>
                  </div>
                )}
                
                {editing.payment_method === "Cartão de Crédito (Parcelado)" && (
                  <div className="grid gap-3 sm:grid-cols-2 p-3 bg-muted rounded-lg">
                    <div>
                      <Label>Parcela Atual</Label>
                      <Input type="number" value={editing.installments_current || ""} onChange={(e) => setEditing({ ...editing, installments_current: parseInt(e.target.value) || null })} placeholder="Ex: 1" />
                    </div>
                    <div>
                      <Label>Total de Parcelas</Label>
                      <Input type="number" value={editing.installments_total || ""} onChange={(e) => setEditing({ ...editing, installments_total: parseInt(e.target.value) || null })} placeholder="Ex: 12" />
                    </div>
                  </div>
                )}
                
                {editing.type !== "income" && (
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fixed" checked={!!editing.is_fixed} onCheckedChange={(checked) => setEditing({ ...editing, is_fixed: checked === true })} />
                      <Label htmlFor="fixed">Despesa Fixa</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="recurring" checked={!!editing.is_recurring} onCheckedChange={(checked) => setEditing({ ...editing, is_recurring: checked === true })} />
                      <Label htmlFor="recurring">Despesa Recorrente</Label>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Anotações <span className="text-muted-foreground font-normal">(Opcional)</span></Label>
                  <Textarea placeholder="Detalhes adicionais da transação..." value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
                </div>
              </div>
              
              {editing.doc_type === "faturamento_pj" && (
                <div>
                  <Label>Descrição do Serviço</Label>
                  <Input value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </div>
              )}
              
              <Button onClick={() => saveTx.mutate(editing!)} disabled={saveTx.isPending} className="mt-2">Salvar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Comprovante</DialogTitle></DialogHeader>
          {viewing && <img src={viewing} alt="comprovante" className="max-h-[70vh] w-full rounded-xl object-contain" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

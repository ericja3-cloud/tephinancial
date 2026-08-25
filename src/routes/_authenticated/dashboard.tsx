import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brl } from "@/lib/format";
import { CATEGORIES, CATEGORY_COLORS, SOURCE_LABEL, type Category } from "@/lib/categories";
import { AlertTriangle, Camera, Check, ListChecks, PiggyBank, Receipt, Trash2, Upload, Mail, ArrowUpCircle, ArrowDownCircle, Wallet, Sparkles, TrendingUp, Building2, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard – Tephinancial" }] }),
  component: Dashboard,
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
};

function SourceIcon({ source }: { source: string }) {
  const cls = "h-3.5 w-3.5";
  if (source === "upload") return <Upload className={cls} />;
  if (source === "camera") return <Camera className={cls} />;
  if (source === "email") return <Mail className={cls} />;
  return <Receipt className={cls} />;
}

function Dashboard() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"Tudo" | "PF" | "PJ">("Tudo");
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

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

  const confirm = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").update({ status: "confirmado" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transação confirmada");
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Removida");
    },
  });

  const now = new Date();
  const monthKey = (d: string) => d.slice(0, 7);
  const thisMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  
  const nonSharedTxs = txs;
  const filteredTxs = filter === "Tudo" ? nonSharedTxs : nonSharedTxs.filter((t) => t.classification === filter);
  
  const monthTxs = filteredTxs.filter((t) => monthKey(t.date) === thisMonth);
  const incomes = monthTxs.filter((t) => t.type === "income").reduce((a, b) => a + Number(b.amount), 0);
  const expenses = monthTxs.filter((t) => t.type === "expense").reduce((a, b) => a + Number(b.amount), 0);
  const balance = incomes - expenses;
  const countMonth = monthTxs.length;

  const catMap = new Map<string, number>();
  const holderMap = new Map<string, number>();
  
  monthTxs.filter(t => t.type === "expense").forEach((t) => {
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + Number(t.amount));
    const holder = t.cardholder || "Principal";
    holderMap.set(holder, (holderMap.get(holder) ?? 0) + Number(t.amount));
  });
  
  const pieData = Array.from(catMap, ([name, value]) => ({ name, value }));
  const holderPieData = Array.from(holderMap, ([name, value]) => ({ name, value }));

  const barData = [
    { name: "Receitas", valor: incomes },
    { name: "Despesas", valor: expenses }
  ];

  const pending = filteredTxs.filter((t) => t.status === "pendente_revisao" && t.source !== "manual");
  const recent = filteredTxs.slice(0, 8);

  // Metas (Budgeting)
  const budget = profile?.monthly_budget || 0;
  const budgetPercent = budget > 0 ? (expenses / budget) * 100 : 0;
  let budgetColor = "bg-success";
  if (budgetPercent > 50) budgetColor = "bg-warning";
  if (budgetPercent > 80) budgetColor = "bg-destructive";

  // Previsões IA (Despesas recorrentes do mês passado não lançadas este mês)
  const lastMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthTxs = txs.filter((t) => monthKey(t.date) === lastMonthKey && t.type === "expense");
  const predictions = lastMonthTxs.filter(lmt => {
    // If we haven't seen an expense with similar description/establishment this month
    return !monthTxs.some(mt => mt.type === "expense" && 
      (mt.establishment === lmt.establishment || mt.description === lmt.description) &&
      mt.category === lmt.category
    );
  }).slice(0, 3); // top 3 predictions

  // Alerta PJ e Compromissos Fiscais
  const pjIncome = monthTxs.filter(t => t.classification === "PJ" && t.type === "income").reduce((a, b) => a + Number(b.amount), 0);
  const taxRate = profile?.pj_tax_rate || 6;
  const estimatedTax = (pjIncome * taxRate) / 100;
  
  const { data: clients = [] } = useQuery({
    queryKey: ["pj_clients", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("pj_clients").select("*").eq("user_id", user!.id);
      return data || [];
    }
  });

  const nextCommitments = [];
  if (filter === "PJ") {
    if (profile?.accounting_closing_day) {
      let cdate = new Date(now.getFullYear(), now.getMonth(), profile.accounting_closing_day);
      if (cdate.getTime() < now.getTime()) {
        cdate.setMonth(cdate.getMonth() + 1);
      }
      const diff = Math.ceil((cdate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      nextCommitments.push({ title: "Fechamento Contábil", date: cdate, days: diff });
    }
    clients.forEach(c => {
      let bdate = new Date(now.getFullYear(), now.getMonth(), c.billing_limit_day);
      if (bdate.getTime() < now.getTime()) {
        bdate.setMonth(bdate.getMonth() + 1);
      }
      const diff = Math.ceil((bdate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      nextCommitments.push({ title: `NFe: ${c.client_name}`, date: bdate, days: diff });
    });
    nextCommitments.sort((a, b) => a.days - b.days);
  }

  return (
    <div className="flex flex-col xl:grid xl:grid-cols-3 xl:gap-6 space-y-6 xl:space-y-0">
      <div className="xl:col-span-2 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Olá 👋</h1>
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              <span>Aqui está o resumo automático do seu mês.</span>
              <span className="hidden sm:inline">·</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs font-bold gap-1 text-primary" asChild>
                <Link to="/agenda">📅 Ver Agenda de Contas</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
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
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="Tudo">Tudo</TabsTrigger>
                <TabsTrigger value="PF">PF</TabsTrigger>
                <TabsTrigger value="PJ">PJ</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

      {pending.length > 0 && (
        <Card className="border-warning/40 bg-warning/5 p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/20 text-warning-foreground">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{pending.length} {pending.length === 1 ? "transação pendente" : "transações pendentes"} de revisão</p>
                <p className="text-sm text-muted-foreground">Chegaram por e-mail e aguardam sua confirmação.</p>
              </div>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-warning/20">
            {pending.slice(0, 4).map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.establishment ?? t.description}</p>
                  <p className="text-xs text-muted-foreground">{brl(Number(t.amount))} · {t.category} · {new Date(t.date).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => confirm.mutate(t.id)}>
                    <Check className="mr-1 h-4 w-4" /> Confirmar
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/transactions">Editar</Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
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
                        <AlertDialogAction onClick={() => del.mutate(t.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {budget > 0 && filter !== "PJ" && (
        <Card className="p-5 shadow-soft">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-muted-foreground" /> Meta de Gastos (Budget)</h3>
            <span className="text-sm font-medium">{brl(expenses)} / {brl(budget)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className={`h-full ${budgetColor} transition-all duration-500`} style={{ width: `${Math.min(budgetPercent, 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-right">
            {budgetPercent.toFixed(1)}% consumido
          </p>
        </Card>
      )}

      {filter === "PJ" && pjIncome > 0 && (
        <Card className="border-purple-500/30 bg-purple-500/5 p-5 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-purple-600">Alerta Tributário Estimado ({taxRate}%)</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-purple-700">{brl(estimatedTax)}</p>
              <p className="text-xs text-purple-600/70 mt-1">Baseado no faturamento PJ do mês de {brl(pjIncome)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-700">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <Card className="p-3 md:p-5 shadow-soft">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between text-center md:text-left gap-1 md:gap-0">
            <div className="w-full">
              <p className="text-[9px] md:text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">Receitas</p>
              <p className="mt-0.5 md:mt-2 text-sm sm:text-base md:text-2xl font-bold tracking-tight text-success truncate">{brl(incomes)}</p>
            </div>
            <div className="hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-3 md:p-5 shadow-soft">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between text-center md:text-left gap-1 md:gap-0">
            <div className="w-full">
              <p className="text-[9px] md:text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">Despesas</p>
              <p className="mt-0.5 md:mt-2 text-sm sm:text-base md:text-2xl font-bold tracking-tight truncate">{brl(expenses)}</p>
            </div>
            <div className="hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ArrowDownCircle className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-3 md:p-5 shadow-soft">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between text-center md:text-left gap-1 md:gap-0">
            <div className="w-full">
              <p className="text-[9px] md:text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">Saldo</p>
              <p className={`mt-0.5 md:mt-2 text-sm sm:text-base md:text-2xl font-bold tracking-tight truncate ${balance >= 0 ? "text-success" : "text-destructive"}`}>
                {brl(balance)}
              </p>
            </div>
            <div className={`hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${balance >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-3 md:p-5 shadow-soft">
        <h3 className="mb-4 font-semibold hidden md:block">Resumo Financeiro</h3>
        
        <div className="grid grid-cols-[1.2fr_1fr] md:grid-cols-[2fr_1fr_1fr] grid-rows-2 md:grid-rows-1 gap-x-2 gap-y-3 md:gap-6">
          
          <div className="row-span-2 md:row-span-1 flex flex-col">
            <h3 className="mb-2 md:mb-4 text-[11px] md:text-sm font-semibold text-center md:text-left text-muted-foreground md:text-foreground">Entradas x Saídas</h3>
            <div className="flex-1 min-h-[140px] md:min-h-[180px]">
              {isLoading ? (
                <div className="h-full animate-pulse rounded-xl bg-muted" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 0, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} width={45} tickFormatter={(v) => v >= 1000 ? `R$ ${(v/1000).toFixed(0)}k` : `R$ ${v}`} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => brl(v)} cursor={{ fill: "var(--muted)" }} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === "Receitas" ? "var(--success)" : "var(--primary)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="mb-1 md:mb-4 text-[10px] md:text-sm font-semibold text-center md:text-left truncate text-muted-foreground md:text-foreground">Por Categoria</h3>
            <div className="flex-1 min-h-[70px] md:min-h-[160px]">
              {isLoading ? (
                <div className="h-full animate-pulse rounded-xl bg-muted" />
              ) : pieData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-[10px] md:text-sm text-muted-foreground text-center">
                  <p>Sem despesas.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                      {pieData.map((d, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[d.name as Category] ?? "#9CA3AF"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => brl(v)} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="mb-1 md:mb-4 text-[10px] md:text-sm font-semibold text-center md:text-left truncate text-muted-foreground md:text-foreground">Por Conta/Cartão</h3>
            <div className="flex-1 min-h-[70px] md:min-h-[160px]">
              {isLoading ? (
                <div className="h-full animate-pulse rounded-xl bg-muted" />
              ) : holderPieData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-[10px] md:text-sm text-muted-foreground text-center">
                  <p>Sem dados.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={holderPieData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                      {holderPieData.map((d, i) => {
                        const colors = ["#8b5cf6", "#3b82f6", "#ec4899", "#f59e0b", "#10b981"];
                        return <Cell key={i} fill={colors[i % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip formatter={(v: number) => brl(v)} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </Card>



      <div className={`grid gap-3 md:gap-4 mt-4 ${predictions.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {predictions.length > 0 && (
          <Card className="p-4 md:p-5 shadow-soft border-primary/20 bg-primary/5 flex flex-col">
            <div className="mb-2 md:mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
              <h3 className="font-semibold text-primary text-xs md:text-base leading-tight">Previsões do Mês</h3>
            </div>
            <p className="text-[10px] md:text-sm text-muted-foreground mb-3 md:mb-4 leading-tight">Baseado nos hábitos, podem ocorrer e não foram lançadas.</p>
            <ul className="divide-y divide-primary/10 flex-1">
              {predictions.map(p => (
                <li key={p.id} className="flex flex-col md:flex-row md:items-center justify-between py-2 md:py-3 gap-1">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] md:text-sm font-medium leading-none">{p.establishment || p.description}</p>
                    <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5">{p.category}</p>
                  </div>
                  <span className="text-[11px] md:text-sm font-semibold opacity-70">~ {brl(Number(p.amount))}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="p-4 md:p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Tephinancial" className="h-6 w-6 rounded object-contain shadow-sm" />
              <p className="font-semibold text-sm md:text-base">Tephinancial</p>
            </div>
            <p className="text-[10px] md:text-sm text-muted-foreground mt-1 leading-tight">Tire uma foto do comprovante — a IA cuida do resto.</p>
          </div>
          <Button asChild size="sm" className="w-full mt-4 md:mt-0 md:w-auto h-8 md:h-10 text-[11px] md:text-sm"><Link to="/capture"><Camera className="mr-1.5 h-3 w-3 md:h-4 md:w-4" /> Capturar</Link></Button>
        </Card>
      </div>
      </div>

      <div className="xl:col-span-1 space-y-6">
        <CalendarWidget />

        <div className="grid gap-4 mt-4">
          <Card className="p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Últimas transações</h3>
              <Button variant="ghost" size="sm" asChild><Link to="/transactions">Ver todas</Link></Button>
            </div>
            {isLoading ? (
              <div className="space-y-3">{[0,1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
            ) : recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma transação ainda.</p>
            ) : (
              <ul className="divide-y">
                {recent.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.establishment ?? t.description}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{new Date(t.date).toLocaleDateString("pt-BR")}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[t.category as Category] ?? "#9CA3AF" }} />{t.category}</span>
                        <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[10px]">
                          <SourceIcon source={t.source} />
                          {SOURCE_LABEL[t.source] ?? t.source}
                        </Badge>
                        {t.status === "pendente_revisao" && (
                          <Badge variant="outline" className="border-warning/40 px-1.5 py-0 text-[10px] text-warning-foreground">pendente</Badge>
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
                      </div>
                    </div>
                    <span className={`shrink-0 text-sm font-semibold ${t.type === "income" ? "text-success" : ""}`}>
                      {t.type === "income" ? "+" : "-"} {brl(Number(t.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {filter === "PJ" && nextCommitments.length > 0 && (
          <Card className="p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-700">Próximos Compromissos Fiscais</h3>
            </div>
            <ul className="space-y-3">
              {nextCommitments.slice(0, 4).map((c, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-lg border p-3 bg-purple-500/5">
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.date.toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${c.days <= 2 ? 'text-destructive' : 'text-purple-600'}`}>
                      {c.days === 0 ? "HOJE" : `Em ${c.days} ${c.days === 1 ? 'dia' : 'dias'}`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle2, AlertCircle, FileText, ChevronLeft, ChevronRight, Check, CreditCard, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { brl } from "@/lib/format";
import { CATEGORIES, CATEGORY_COLORS, type Category } from "@/lib/categories";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({ meta: [{ title: "Agenda de Contas – Tephinancial" }] }),
  component: AgendaPage,
});

type Tx = {
  id: string;
  amount: number;
  sharing_type?: string;
  paid_by?: string;
  category: string;
  date: string;
  description: string;
  establishment: string | null;
  status: string;
  source: string;
  type: string;
  classification?: "PF" | "PJ" | null;
  is_fixed?: boolean;
  is_recurring?: boolean | null;
};

type CardConfig = {
  id: string;
  cardName: string;
  closingDay?: number;
  dueDay?: number;
  holders: string[];
};

function AgendaPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [filterType, setFilterType] = useState<"Tudo" | "PF" | "PJ">("Tudo");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedDayTxs, setSelectedDayTxs] = useState<{ day: number; txs: any[] } | null>(null);

  // Fetch user profile (to get cards with due/closing days)
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch all transactions
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

  // Toggle status to "confirmado" (paid)
  const payMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .update({ status: "confirmado" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Conta marcada como PAGA! 🎉");
      setSelectedDayTxs(null);
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar: ${err.message}`);
    }
  });

  const monthKey = (d: string) => d.slice(0, 7);
  const thisMonthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

  // Filter bills (only expenses, filtered by PF/PJ)
  const filteredTxs = useMemo(() => {
    return txs.filter((t) => {
      if (t.type !== "expense") return false;
      if (filterType !== "Tudo" && t.classification !== filterType) return false;
      return true;
    });
  }, [txs, filterType]);

  // Current month's database bills
  const monthTxs = useMemo(() => {
    return filteredTxs.filter((t) => monthKey(t.date) === thisMonthStr);
  }, [filteredTxs, thisMonthStr]);

  // Find fixed expenses from last month
  const lastMonthDate = useMemo(() => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  }, [currentMonth]);

  const lastMonthStr = useMemo(() => {
    return `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;
  }, [lastMonthDate]);

  const fixedTxsLastMonth = useMemo(() => {
    return filteredTxs.filter(t => monthKey(t.date) === lastMonthStr && (t.is_fixed || t.is_recurring));
  }, [filteredTxs, lastMonthStr]);

  // Find fixed expenses that are not yet created in the current month
  const missingFixedTxs = useMemo(() => {
    if (fixedTxsLastMonth.length === 0) return [];
    return fixedTxsLastMonth.filter(lmt => {
      return !monthTxs.some(mt => 
        (mt.establishment === lmt.establishment || mt.description === lmt.description) &&
        Math.abs(Number(mt.amount) - Number(lmt.amount)) < 0.01
      );
    });
  }, [fixedTxsLastMonth, monthTxs]);

  // Clone fixed expenses mutation
  const cloneFixedMutation = useMutation({
    mutationFn: async () => {
      if (missingFixedTxs.length === 0) return;
      const inserts = missingFixedTxs.map(lmt => {
        const lmtDate = new Date(lmt.date);
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), lmtDate.getDate());
        return {
          user_id: user!.id,
          type: lmt.type,
          amount: lmt.amount,
          description: lmt.description,
          establishment: lmt.establishment || lmt.description,
          category: lmt.category,
          date: newDate.toISOString().split("T")[0],
          status: "pendente_revisao",
          source: "manual",
          sharing_type: lmt.sharing_type || "private",
          paid_by: lmt.paid_by || "me",
          classification: lmt.classification || "PF",
          is_fixed: true,
        };
      });

      const { error } = await supabase.from("transactions").insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Despesas fixas do mês lançadas como 'A Pagar'! 🚀");
    },
    onError: (err) => {
      toast.error(`Erro ao lançar despesas: ${err.message}`);
    }
  });

  // Calculate virtual credit card events (closing and due dates)
  const cardEvents = useMemo(() => {
    if (!profile?.cardholders) return [];
    const events: any[] = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    (profile.cardholders as CardConfig[]).forEach(card => {
      if (card.dueDay) {
        const dateStr = `${thisMonthStr}-${String(card.dueDay).padStart(2, "0")}`;
        events.push({
          id: `card-due-${card.id}`,
          amount: 0,
          description: `Vencimento Fatura: ${card.cardName}`,
          category: "Cartão",
          date: dateStr,
          status: "reminder",
          isCardReminder: true,
          cardName: card.cardName,
        });
      }
      if (card.closingDay) {
        const dateStr = `${thisMonthStr}-${String(card.closingDay).padStart(2, "0")}`;
        events.push({
          id: `card-close-${card.id}`,
          amount: 0,
          description: `Fechamento Fatura: ${card.cardName}`,
          category: "Cartão",
          date: dateStr,
          status: "reminder",
          isCardReminder: true,
          isClosing: true,
          cardName: card.cardName,
        });
      }
    });
    return events;
  }, [profile, thisMonthStr, currentMonth]);

  // Combine database bills and virtual card reminders
  const monthAllEvents = useMemo(() => {
    return [...monthTxs, ...cardEvents];
  }, [monthTxs, cardEvents]);

  // Calculations
  const totalPending = useMemo(() => {
    return monthTxs.filter(t => t.status === "pendente_revisao").reduce((acc, t) => acc + Number(t.amount), 0);
  }, [monthTxs]);

  const totalPaid = useMemo(() => {
    return monthTxs.filter(t => t.status === "confirmado").reduce((acc, t) => acc + Number(t.amount), 0);
  }, [monthTxs]);

  const overdueCount = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return filteredTxs.filter(t => t.status === "pendente_revisao" && t.date < todayStr).length;
  }, [filteredTxs]);

  // Calendar days grid
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = [];
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDate; i++) {
      days.push(i);
    }
    return days;
  }, [currentMonth]);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDayEvents = (day: number) => {
    const dayStr = `${thisMonthStr}-${String(day).padStart(2, "0")}`;
    return monthAllEvents.filter(t => t.date === dayStr);
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // Sort upcoming pending bills by date
  const upcomingBills = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return filteredTxs
      .filter(t => t.status === "pendente_revisao")
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTxs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda de Contas</h1>
          <p className="text-muted-foreground">Monitore e pague seus vencimentos mensais PF e PJ de forma simples.</p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="Tudo">Tudo</TabsTrigger>
              <TabsTrigger value="PF" className="text-blue-600">PF</TabsTrigger>
              <TabsTrigger value="PJ" className="text-purple-600">PJ</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="calendar">Calendário</TabsTrigger>
              <TabsTrigger value="list">Próximos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Banner to automatically launch fixed/recurring expenses */}
      {missingFixedTxs.length > 0 && (
        <Card className="border-primary/40 bg-primary/5 p-4 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Lançar Despesas Fixas</p>
              <p className="text-xs text-muted-foreground">
                Encontramos {missingFixedTxs.length} {missingFixedTxs.length === 1 ? 'despesa fixa' : 'despesas fixas'} do mês anterior (Aluguel, Luz, etc.) pendentes para este mês.
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => cloneFixedMutation.mutate()} 
            disabled={cloneFixedMutation.isPending}
            className="shrink-0 gap-1.5"
          >
            <Check className="h-4 w-4" /> Lançar Despesas ({missingFixedTxs.length})
          </Button>
        </Card>
      )}

      {/* Top Cards metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 shadow-soft border-l-4 border-l-warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">A Pagar (Este Mês)</p>
              <h3 className="mt-1 text-2xl font-bold text-warning-foreground">{brl(totalPending)}</h3>
            </div>
            <div className="rounded-full bg-warning/10 p-2.5 text-warning-foreground">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-soft border-l-4 border-l-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pago (Este Mês)</p>
              <h3 className="mt-1 text-2xl font-bold text-success">{brl(totalPaid)}</h3>
            </div>
            <div className="rounded-full bg-success/10 p-2.5 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-soft border-l-4 border-l-destructive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Contas Atrasadas</p>
              <h3 className="mt-1 text-2xl font-bold text-destructive">{overdueCount} {overdueCount === 1 ? 'conta' : 'contas'}</h3>
            </div>
            <div className="rounded-full bg-destructive/10 p-2.5 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {viewMode === "calendar" ? (
        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
            </div>
            <div className="flex gap-1.5">
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={prevMonth}><ChevronLeft className="h-4.5 w-4.5" /></Button>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={nextMonth}><ChevronRight className="h-4.5 w-4.5" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground mb-3">
            <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SÁB</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className="h-20 bg-muted/10 rounded-lg"></div>;
              
              const dayEvents = getDayEvents(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();

              return (
                <div 
                  key={`day-${day}`} 
                  onClick={() => dayEvents.length > 0 && setSelectedDayTxs({ day, txs: dayEvents })}
                  className={`h-20 p-2 rounded-lg border flex flex-col justify-between transition-all select-none cursor-pointer ${
                    isToday ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:bg-muted/30"
                  } ${dayEvents.length > 0 ? "hover:border-foreground/45" : "cursor-default opacity-85"}`}
                >
                  <span className={`text-xs font-bold leading-none ${isToday ? 'text-primary' : ''}`}>{day}</span>
                  
                  {dayEvents.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {dayEvents.slice(0, 2).map((b) => (
                          <span 
                            key={b.id} 
                            className={`text-[8.5px] font-bold px-1 py-0.5 rounded leading-none ${
                              b.isCardReminder
                                ? b.isClosing
                                  ? "bg-slate-100 text-slate-700 border border-slate-200 border-dashed"
                                  : "bg-rose-100 text-rose-700 border border-rose-200"
                                : b.status === "confirmado" 
                                  ? "bg-success/15 text-success line-through" 
                                  : b.classification === "PJ"
                                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                                    : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {b.isCardReminder 
                              ? b.isClosing 
                                ? `🔒 ${b.cardName.slice(0, 5)}`
                                : `💳 ${b.cardName.slice(0, 5)}`
                              : `R$ ${Math.round(b.amount)}`
                            }
                          </span>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[8px] font-bold text-muted-foreground">+{dayEvents.length - 2}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="h-1.5" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-center gap-6 text-xs text-muted-foreground border-t pt-4">
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-blue-100 border border-blue-200 block" /> Pessoa Física (PF)</div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-purple-100 border border-purple-200 block" /> Pessoa Jurídica (PJ)</div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-success/15 border border-success/30 block" /> Contas Pagas</div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-rose-100 border border-rose-200 block" /> Fatura Vence</div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-slate-100 border border-slate-200 border-dashed block" /> Fatura Fecha</div>
          </div>
        </Card>
      ) : (
        <Card className="p-5 shadow-soft">
          <h2 className="text-lg font-bold mb-4">Todas as Contas Pendentes</h2>
          {upcomingBills.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              Nenhuma conta pendente para pagar no momento! Tudo em dia. 🎉
            </div>
          ) : (
            <div className="divide-y">
              {upcomingBills.map((b) => {
                const isOverdue = b.date < new Date().toISOString().split("T")[0];
                return (
                  <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-4.5">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`mt-0.5 rounded-full p-2 ${isOverdue ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{b.establishment ?? b.description}</p>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span className={`font-bold ${isOverdue ? 'text-destructive' : ''}`}>
                            Vence dia: {new Date(b.date).toLocaleDateString("pt-BR")} {isOverdue && '⚠️ ATRASADA'}
                          </span>
                          <span>·</span>
                          <span>{b.category}</span>
                          {b.classification === "PF" && <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 px-1 py-0 text-[10px]">PF</Badge>}
                          {b.classification === "PJ" && <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 px-1 py-0 text-[10px]">PJ</Badge>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-bold text-sm text-destructive-foreground">{brl(b.amount)}</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 border-success/30 hover:bg-success/15 hover:text-success gap-1 text-success-foreground" 
                        onClick={() => payMutation.mutate(b.id)}
                      >
                        <Check className="h-3.5 w-3.5" /> Marcar Pago
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Selected Day Bills Modal */}
      {selectedDayTxs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg p-6 shadow-xl animate-in zoom-in-95 duration-105">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-lg">Eventos do Dia {selectedDayTxs.day} de {monthNames[currentMonth.getMonth()]}</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedDayTxs(null)}>✕</Button>
            </div>
            
            <div className="space-y-4.5 max-h-96 overflow-y-auto pr-1">
              {selectedDayTxs.txs.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 border-b pb-3.5 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{b.description || b.establishment}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {b.isCardReminder ? (
                        <Badge variant="outline" className="border-rose-500/35 bg-rose-50/50 text-rose-700 text-[10px]">Lembrete de Cartão</Badge>
                      ) : (
                        <>
                          {b.classification === "PF" && <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 px-1.5 py-0 text-[10px]">PF</Badge>}
                          {b.classification === "PJ" && <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 px-1.5 py-0 text-[10px]">PJ</Badge>}
                          <span className="text-xs text-muted-foreground">{b.category}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {!b.isCardReminder && (
                      <>
                        <span className="font-semibold text-sm">{brl(b.amount)}</span>
                        {b.status === "confirmado" ? (
                          <Badge variant="outline" className="border-success/35 bg-success/10 text-success text-[10px]">PAGA</Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 border-success/30 hover:bg-success/15 hover:text-success text-success-foreground text-xs gap-1"
                            onClick={() => payMutation.mutate(b.id)}
                          >
                            <Check className="h-3 w-3" /> Pagar
                          </Button>
                        )}
                      </>
                    )}
                    {b.isCardReminder && (
                      <span className="text-xs text-muted-foreground italic">Lembrete Automático</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function CalendarWidget({ mode = "personal" }: { mode?: "personal" | "couple" }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [newTitle, setNewTitle] = useState("");
  const [openDay, setOpenDay] = useState<string | null>(null);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  const { data: txs = [] } = useQuery({
    queryKey: ["transactions", currentMonthStr, user?.id],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase.from("transactions").select("*")
        .gte("date", `${currentMonthStr}-01`)
        .lte("date", `${currentMonthStr}-${String(monthEnd.getDate()).padStart(2, "0")}`);
      
      if (mode === "couple") {
        query = query.or("sharing_type.eq.shared,paid_by.eq.spouse");
      } else {
        query = query.eq("user_id", user!.id);
      }
      
      const { data } = await query;
      return data || [];
    }
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ["reminders", currentMonthStr, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("reminders").select("*")
        .eq("user_id", user!.id)
        .gte("date", `${currentMonthStr}-01`)
        .lte("date", `${currentMonthStr}-${String(monthEnd.getDate()).padStart(2, "0")}`);
      return data || [];
    }
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["pj_clients", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("pj_clients").select("*").eq("user_id", user!.id);
      return data || [];
    },
  });

  const addReminder = useMutation({
    mutationFn: async (dateStr: string) => {
      if (!newTitle.trim()) return;
      const { error } = await supabase.from("reminders").insert({
        user_id: user!.id,
        title: newTitle,
        date: dateStr,
        color_label: "yellow"
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewTitle("");
      qc.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Lembrete adicionado");
    }
  });

  // Calculate days for the grid
  const days = [];
  const startDayOfWeek = monthStart.getDay(); // 0 = Sun
  
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= monthEnd.getDate(); i++) {
    days.push(i);
  }
  
  const getDayInfo = (day: number) => {
    const dayStr = `${currentMonthStr}-${String(day).padStart(2, "0")}`;
    const dayTxs = txs.filter(t => t.date === dayStr);
    const dayReminders = reminders.filter(r => r.date === dayStr);
    
    const hasIncome = dayTxs.some(t => t.type === "income");
    const hasExpense = dayTxs.some(t => t.type === "expense");
    
    const isClosing = profile?.accounting_closing_day === day;
    const clientDeadlines = clients.filter(c => c.billing_limit_day === day);
    
    return {
      dayStr,
      hasIncome,
      hasExpense,
      dayReminders,
      isClosing,
      clientDeadlines,
      hasEvents: hasIncome || hasExpense || dayReminders.length > 0 || isClosing || clientDeadlines.length > 0
    };
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <Card className="p-4 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
        <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="h-8"></div>;
          
          const info = getDayInfo(day);
          const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
          
          return (
            <Popover key={`day-${day}`} open={openDay === info.dayStr} onOpenChange={(open) => setOpenDay(open ? info.dayStr : null)}>
              <PopoverTrigger asChild>
                <div className={`relative flex h-8 flex-col items-center justify-center rounded-md cursor-pointer hover:bg-muted ${isToday ? 'bg-primary/10 text-primary font-bold' : ''}`}>
                  <span className="text-sm">{day}</span>
                  <div className="flex gap-[2px] mt-[2px]">
                    {info.hasIncome && <span className="h-1 w-1 rounded-full bg-green-500"></span>}
                    {info.hasExpense && <span className="h-1 w-1 rounded-full bg-red-500"></span>}
                    {(info.dayReminders.length > 0) && <span className="h-1 w-1 rounded-full bg-yellow-500"></span>}
                    {(info.isClosing || info.clientDeadlines.length > 0) && <span className="h-1 w-1 rounded-full bg-purple-500"></span>}
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="center">
                <div className="font-semibold text-sm mb-2">Eventos do dia {day}</div>
                <div className="space-y-2 mb-3 max-h-[150px] overflow-y-auto pr-1">
                  {info.isClosing && <div className="text-xs flex items-center gap-1 text-purple-600"><span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span> Fechamento Contábil</div>}
                  {info.clientDeadlines.map(c => <div key={c.id} className="text-xs flex items-center gap-1 text-purple-600"><span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span> NFe: {c.client_name}</div>)}
                  {info.dayReminders.map(r => <div key={r.id} className="text-xs flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span> {r.title}</div>)}
                  {info.hasIncome && <div className="text-xs flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Existem Receitas</div>}
                  {info.hasExpense && <div className="text-xs flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Existem Despesas</div>}
                  {!info.hasEvents && <div className="text-xs text-muted-foreground">Nenhum evento.</div>}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Novo lembrete" 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)}
                    className="h-7 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addReminder.mutate(info.dayStr);
                    }}
                  />
                  <Button size="icon" className="h-7 w-7" onClick={() => addReminder.mutate(info.dayStr)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </Card>
  );
}

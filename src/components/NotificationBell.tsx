import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Notification = {
  id: string;
  title: string;
  description: string;
  type: "warning" | "info";
};

export function NotificationBell() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      if (Notification.permission === "default") {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  const { data: txs = [] } = useQuery({
    queryKey: ["transactions"],
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id, txs],
    enabled: !!user,
    queryFn: async () => {
      const notifs: Notification[] = [];
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      
      // Check accounting closing day
      if (profile?.accounting_closing_day) {
        const closingDate = new Date(now.getFullYear(), now.getMonth(), profile.accounting_closing_day);
        const diffTime = closingDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          notifs.push({
            id: "closing_0",
            title: "Fechamento Contábil é Hoje!",
            description: "Não se esqueça de exportar e enviar os relatórios e notas para o seu contador.",
            type: "warning"
          });
        } else if (diffDays === 2 || diffDays === 1) {
          notifs.push({
            id: `closing_${diffDays}`,
            title: `Faltam ${diffDays} dias para o fechamento!`,
            description: "Prepare seus relatórios e notas fiscais para enviar ao contador.",
            type: "warning"
          });
        }
      }

      // Check PJ clients billing limits
      const { data: clients } = await supabase.from("pj_clients").select("*").eq("user_id", user!.id);
      if (clients) {
        for (const client of clients) {
          if (client.billing_limit_day === now.getDate()) {
            notifs.push({
              id: `client_${client.id}`,
              title: `Dia de Nota Fiscal: ${client.client_name}`,
              description: "Hoje é o prazo limite para enviar a nota para garantir o seu pagamento.",
              type: "warning"
            });
          }
        }
      }

      // Check Reminders
      const { data: reminders } = await supabase.from("reminders")
        .select("*")
        .eq("user_id", user!.id)
        .eq("date", todayStr)
        .eq("is_completed", false);
        
      if (reminders) {
        for (const reminder of reminders) {
          notifs.push({
            id: `reminder_${reminder.id}`,
            title: "Lembrete: " + reminder.title,
            description: "Programado para hoje.",
            type: "info"
          });
        }
      }

      // Check Pending Transactions / Bills due today or tomorrow
      const { data: pendingTxs } = await supabase.from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "pendente_revisao")
        .order("created_at", { ascending: false });

      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

      if (pendingTxs) {
        for (const tx of pendingTxs) {
          if (tx.date === todayStr && tx.type === "expense") {
            notifs.push({
              id: `tx_today_${tx.id}`,
              title: `⚠️ Conta Vence Hoje: ${tx.establishment || tx.description || 'Desconhecido'}`,
              description: `Valor: R$ ${Number(tx.amount).toFixed(2).replace('.', ',')} · Categoria: ${tx.category}`,
              type: "warning"
            });
          } else if (tx.date === tomorrowStr && tx.type === "expense") {
            notifs.push({
              id: `tx_tomorrow_${tx.id}`,
              title: `📅 Conta Vence Amanhã: ${tx.establishment || tx.description || 'Desconhecido'}`,
              description: `Valor: R$ ${Number(tx.amount).toFixed(2).replace('.', ',')} · Categoria: ${tx.category}`,
              type: "info"
            });
          } else if (tx.source !== "manual") {
            // Keep normal imported review alerts
            notifs.push({
              id: `tx_rev_${tx.id}`,
              title: `Nova Transação: ${tx.establishment || tx.description || 'Desconhecido'}`,
              description: `R$ ${Number(tx.amount).toFixed(2).replace('.', ',')} - ${tx.category}. (Pendente de revisão)`,
              type: "info"
            });
          }
        }
      }

      // Check credit card due dates
      if (profile?.cardholders) {
        const cards = profile.cardholders as any[];
        const todayDay = now.getDate();
        const tomorrowDay = tomorrow.getDate();

        for (const card of cards) {
          if (card.dueDay === todayDay) {
            notifs.push({
              id: `card_due_today_${card.id}`,
              title: `💳 Vence Fatura: ${card.cardName}`,
              description: "Hoje vence a fatura do seu cartão. Lembre-se de pagar para evitar juros!",
              type: "warning"
            });
          } else if (card.dueDay === tomorrowDay) {
            notifs.push({
              id: `card_due_tomorrow_${card.id}`,
              title: `📅 Fatura Vence Amanhã: ${card.cardName}`,
              description: "A fatura do seu cartão vence amanhã. Organize seu pagamento.",
              type: "info"
            });
          }
        }
      }

      return notifs;
    },
  });

  // Trigger Local Push for new notifications
  useEffect(() => {
    if (permission === "granted" && notifications.length > 0) {
      const sent = sessionStorage.getItem("push_sent");
      if (!sent) {
        notifications.forEach(n => {
          new Notification(n.title, { body: n.description });
        });
        sessionStorage.setItem("push_sent", "true");
      }
    }
  }, [notifications, permission]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-destructive"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notificações</span>
          <span className="text-xs text-muted-foreground">{notifications.length} nova(s)</span>
        </div>
        <div className="flex max-h-[300px] flex-col overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação no momento.</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="flex flex-col gap-1 border-b px-4 py-3 last:border-0 hover:bg-muted/50">
                <span className={`text-sm font-medium ${n.type === "warning" ? "text-warning-foreground" : ""}`}>{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.description}</span>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

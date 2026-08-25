import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card } from "./card-CBcrKIMI.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-Dk_0VkVk.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CLur3KMT.mjs";
import { u as useAuth } from "./useAuth-BVgnNSgv.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { f as ChevronLeft, g as ChevronRight, P as Plus } from "../_libs/lucide-react.mjs";
function CalendarWidget({ mode = "personal" }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [currentDate, setCurrentDate] = reactExports.useState(/* @__PURE__ */ new Date());
  const [newTitle, setNewTitle] = reactExports.useState("");
  const [openDay, setOpenDay] = reactExports.useState(null);
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const { data: txs = [] } = useQuery({
    queryKey: ["transactions", currentMonthStr, user?.id],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase.from("transactions").select("*").gte("date", `${currentMonthStr}-01`).lte("date", `${currentMonthStr}-${String(monthEnd.getDate()).padStart(2, "0")}`);
      if (mode === "couple") {
        query = query.or("sharing_type.eq.shared,paid_by.eq.spouse");
      } else {
        query = query.eq("user_id", user.id);
      }
      const { data } = await query;
      return data || [];
    }
  });
  const { data: reminders = [] } = useQuery({
    queryKey: ["reminders", currentMonthStr, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("reminders").select("*").eq("user_id", user.id).gte("date", `${currentMonthStr}-01`).lte("date", `${currentMonthStr}-${String(monthEnd.getDate()).padStart(2, "0")}`);
      return data || [];
    }
  });
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    }
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["pj_clients", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("pj_clients").select("*").eq("user_id", user.id);
      return data || [];
    }
  });
  const addReminder = useMutation({
    mutationFn: async (dateStr) => {
      if (!newTitle.trim()) return;
      const { error } = await supabase.from("reminders").insert({
        user_id: user.id,
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
  const days = [];
  const startDayOfWeek = monthStart.getDay();
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= monthEnd.getDate(); i++) {
    days.push(i);
  }
  const getDayInfo = (day) => {
    const dayStr = `${currentMonthStr}-${String(day).padStart(2, "0")}`;
    const dayTxs = txs.filter((t) => t.date === dayStr);
    const dayReminders = reminders.filter((r) => r.date === dayStr);
    const hasIncome = dayTxs.some((t) => t.type === "income");
    const hasExpense = dayTxs.some((t) => t.type === "expense");
    const isClosing = profile?.accounting_closing_day === day;
    const clientDeadlines = clients.filter((c) => c.billing_limit_day === day);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 shadow-soft", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold text-sm", children: [
        monthNames[currentDate.getMonth()],
        " ",
        currentDate.getFullYear()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: prevMonth, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: nextMonth, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "D" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "S" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "T" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Q" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Q" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "S" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "S" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1", children: days.map((day, idx) => {
      if (day === null) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8" }, `empty-${idx}`);
      const info = getDayInfo(day);
      const isToday = (/* @__PURE__ */ new Date()).getDate() === day && (/* @__PURE__ */ new Date()).getMonth() === currentDate.getMonth() && (/* @__PURE__ */ new Date()).getFullYear() === currentDate.getFullYear();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: openDay === info.dayStr, onOpenChange: (open) => setOpenDay(open ? info.dayStr : null), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative flex h-8 flex-col items-center justify-center rounded-md cursor-pointer hover:bg-muted ${isToday ? "bg-primary/10 text-primary font-bold" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: day }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-[2px] mt-[2px]", children: [
            info.hasIncome && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 rounded-full bg-green-500" }),
            info.hasExpense && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 rounded-full bg-red-500" }),
            info.dayReminders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 rounded-full bg-yellow-500" }),
            (info.isClosing || info.clientDeadlines.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 rounded-full bg-purple-500" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { className: "w-64 p-3", align: "center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-sm mb-2", children: [
            "Eventos do dia ",
            day
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 mb-3 max-h-[150px] overflow-y-auto pr-1", children: [
            info.isClosing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs flex items-center gap-1 text-purple-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-purple-500" }),
              " Fechamento Contábil"
            ] }),
            info.clientDeadlines.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs flex items-center gap-1 text-purple-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-purple-500" }),
              " NFe: ",
              c.client_name
            ] }, c.id)),
            info.dayReminders.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-yellow-500" }),
              " ",
              r.title
            ] }, r.id)),
            info.hasIncome && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-green-500" }),
              " Existem Receitas"
            ] }),
            info.hasExpense && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-red-500" }),
              " Existem Despesas"
            ] }),
            !info.hasEvents && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Nenhum evento." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Novo lembrete",
                value: newTitle,
                onChange: (e) => setNewTitle(e.target.value),
                className: "h-7 text-xs",
                onKeyDown: (e) => {
                  if (e.key === "Enter") addReminder.mutate(info.dayStr);
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", className: "h-7 w-7", onClick: () => addReminder.mutate(info.dayStr), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }) })
          ] })
        ] })
      ] }, `day-${day}`);
    }) })
  ] });
}
export {
  CalendarWidget as C
};

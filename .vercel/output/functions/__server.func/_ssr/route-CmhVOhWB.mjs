import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link, O as Outlet, e as useLocation, u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CLur3KMT.mjs";
import { B as Button, c as cn } from "./button-BXrfXN_b.mjs";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-Dk_0VkVk.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useAuth } from "./useAuth-BVgnNSgv.mjs";
import { Z as Zap, a as LayoutDashboard, H as HeartHandshake, C as Camera, b as ListChecks, S as Settings, B as Bell, M as Mail, c as LogOut } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/tanstack__query-core.mjs";
function NotificationBell() {
  const { user } = useAuth();
  const [permission, setPermission] = reactExports.useState("default");
  reactExports.useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      if (Notification.permission === "default") {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const notifs = [];
      const now = /* @__PURE__ */ new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile?.accounting_closing_day) {
        const closingDate = new Date(now.getFullYear(), now.getMonth(), profile.accounting_closing_day);
        const diffTime = closingDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
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
      const { data: clients } = await supabase.from("pj_clients").select("*").eq("user_id", user.id);
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
      const { data: reminders } = await supabase.from("reminders").select("*").eq("user_id", user.id).eq("date", todayStr).eq("is_completed", false);
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
      const { data: pendingTxs } = await supabase.from("transactions").select("*").eq("user_id", user.id).eq("status", "pendente_revisao").order("created_at", { ascending: false });
      if (pendingTxs) {
        for (const tx of pendingTxs) {
          notifs.push({
            id: `tx_${tx.id}`,
            title: `Nova Transação: ${tx.establishment || tx.description || "Desconhecido"}`,
            description: `R$ ${tx.amount.toFixed(2).replace(".", ",")} - ${tx.category}. (Pendente de revisão)`,
            type: "info"
          });
        }
      }
      return notifs;
    }
  });
  reactExports.useEffect(() => {
    if (permission === "granted" && notifications.length > 0) {
      const sent = sessionStorage.getItem("push_sent");
      if (!sent) {
        notifications.forEach((n) => {
          new Notification(n.title, { body: n.description });
        });
        sessionStorage.setItem("push_sent", "true");
      }
    }
  }, [notifications, permission]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "icon", className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5" }),
      notifications.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 top-2 flex h-2 w-2 rounded-full bg-destructive" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { align: "end", className: "w-80 p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Notificações" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          notifications.length,
          " nova(s)"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex max-h-[300px] flex-col overflow-y-auto", children: notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-center text-sm text-muted-foreground", children: "Nenhuma notificação no momento." }) : notifications.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 border-b px-4 py-3 last:border-0 hover:bg-muted/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm font-medium ${n.type === "warning" ? "text-warning-foreground" : ""}`, children: n.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: n.description })
      ] }, n.id)) })
    ] })
  ] });
}
const NAV = [{
  to: "/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard
}, {
  to: "/couple",
  label: "Finanças Casal",
  icon: HeartHandshake
}, {
  to: "/capture",
  label: "Capturar",
  icon: Camera
}, {
  to: "/transactions",
  label: "Transações",
  icon: ListChecks
}, {
  to: "/email-setup",
  label: "Conectar e-mail",
  icon: Mail
}, {
  to: "/settings",
  label: "Configurações",
  icon: Settings
}];
function SidebarContent({
  onNavigate
}) {
  const location = useLocation();
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.navigate({
      to: "/auth",
      replace: true
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2 px-2 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col leading-tight", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-semibold", children: "Tephinancial" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "finanças automáticas" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-1 flex-col gap-1", children: NAV.map(({
      to,
      label,
      icon: Icon
    }) => {
      const active = location.pathname === to || location.pathname.startsWith(to + "/");
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, onClick: onNavigate, className: cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
        label
      ] }, to);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: handleLogout, className: "justify-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
      " Sair"
    ] })
  ] });
}
function AppLayout() {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "fixed inset-y-0 left-0 hidden w-64 border-r bg-sidebar p-4 md:flex md:flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 right-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationBell, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarContent, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur md:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Tephinancial" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationBell, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "md:pl-64 pb-20 md:pb-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t bg-background/80 backdrop-blur pb-safe px-2 py-2 md:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", className: "flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary [&.active]:text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium", children: "Home" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/couple", className: "flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary [&.active]:text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium", children: "Casal" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/capture", className: "flex flex-col items-center justify-center -mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium mt-1 text-primary", children: "Capturar" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/transactions", className: "flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary [&.active]:text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium", children: "Transações" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/settings", className: "flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary [&.active]:text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium", children: "Ajustes" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/chat", className: "fixed bottom-20 right-4 z-50 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 fill-current" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: "Fale com a Tef" })
    ] })
  ] });
}
export {
  AppLayout as component
};

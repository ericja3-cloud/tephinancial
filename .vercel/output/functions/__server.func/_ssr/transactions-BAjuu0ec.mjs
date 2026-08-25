import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CLur3KMT.mjs";
import { C as Card } from "./card-CBcrKIMI.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { B as Badge } from "./badge-B-q03HH0.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, A as AlertDialog, e as AlertDialogTrigger, f as AlertDialogContent, g as AlertDialogHeader, h as AlertDialogTitle, i as AlertDialogDescription, j as AlertDialogFooter, k as AlertDialogCancel, l as AlertDialogAction } from "./select-ChOckY3J.mjs";
import { L as Label } from "./label-Brw405F4.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, C as Checkbox, T as Textarea } from "./textarea-BTkH4PU7.mjs";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-Dk_0VkVk.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-c5KQ8wMi.mjs";
import { b as brl } from "./format-CyvgXGaB.mjs";
import { R as Route$7, C as CATEGORY_COLORS, S as SOURCE_LABEL, a as CATEGORIES } from "./router-f3VAqw2h.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAuth } from "./useAuth-BVgnNSgv.mjs";
import "../_libs/seroval.mjs";
import { f as ChevronLeft, g as ChevronRight, P as Plus, H as HeartHandshake, h as Briefcase, i as Paperclip, j as Check, k as Pencil, T as Trash2, U as Upload, C as Camera, M as Mail, R as Receipt } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./server-CU1fTwFN.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-aaZtlEbX.mjs";
import "../_libs/ai.mjs";
import "../_libs/ai-sdk__gateway.mjs";
import "../_libs/ai-sdk__provider-utils.mjs";
import "../_libs/ai-sdk__provider.mjs";
import "../_libs/eventsource-parser.mjs";
import "../_libs/zod.mjs";
import "../_libs/@vercel/oidc.mjs";
import "path";
import "fs";
import "os";
import "../_libs/workflow__serde.mjs";
function SourceIcon({
  source
}) {
  const cls = "h-3 w-3";
  if (source === "upload") return /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: cls });
  if (source === "camera") return /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: cls });
  if (source === "email") return /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: cls });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: cls });
}
function TransactionsPage() {
  const {
    user
  } = useAuth();
  const qc = useQueryClient();
  const searchParams = Route$7.useSearch();
  const emptyTx = {
    amount: 0,
    category: "Outros",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
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
    cardholder: "Principal"
  };
  const [filter, setFilter] = reactExports.useState("all");
  const [holderFilter, setHolderFilter] = reactExports.useState("all");
  const [methodFilter, setMethodFilter] = reactExports.useState("all");
  const [typeFilter, setTypeFilter] = reactExports.useState("all");
  const [editing, setEditing] = reactExports.useState(searchParams.action === "new" ? emptyTx : null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [currentMonth, setCurrentMonth] = reactExports.useState(() => /* @__PURE__ */ new Date());
  const {
    data: txs = [],
    isLoading
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("transactions").select("*").or("sharing_type.is.null,sharing_type.neq.shared,and(sharing_type.eq.shared,paid_by.eq.me)").order("date", {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  const {
    data: incomeSources = []
  } = useQuery({
    queryKey: ["incomeSources"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("transactions").select("target_source").eq("type", "income").not("target_source", "is", null);
      if (error) return [];
      const sources = new Set(data.map((d) => d.target_source).filter(Boolean));
      return Array.from(sources);
    }
  });
  const saveTx = useMutation({
    mutationFn: async (t) => {
      const payload = {
        establishment: t.establishment || null,
        description: t.description || "Lançamento manual",
        amount: Number(t.amount) || 0,
        category: t.category || "Outros",
        date: t.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        type: t.type || "expense",
        payment_method: t.payment_method || null,
        target_source: t.target_source || null,
        doc_type: t.doc_type || null,
        classification: t.classification || null,
        cardholder: t.cardholder || null,
        status: "confirmado",
        source: t.source || "manual",
        sharing_type: t.sharing_type || "private",
        paid_by: t.paid_by || "me",
        installments_total: t.installments_total || null,
        installments_current: t.installments_current || null,
        is_fixed: t.is_fixed || false,
        is_recurring: t.is_recurring || false,
        notes: t.notes || null
      };
      if (t.id) {
        const {
          error
        } = await supabase.from("transactions").update(payload).eq("id", t.id);
        if (error) throw error;
      } else {
        const inserts = [];
        const basePayload = {
          ...payload,
          user_id: user.id
        };
        if (payload.installments_total && payload.installments_total > 1) {
          const valPerInstallment = basePayload.amount / payload.installments_total;
          basePayload.amount = valPerInstallment;
          for (let i = 0; i < payload.installments_total; i++) {
            const date = new Date(payload.date);
            date.setMonth(date.getMonth() + i);
            inserts.push({
              ...basePayload,
              date: date.toISOString().split("T")[0],
              installments_current: i + 1
            });
          }
        } else if (payload.is_fixed || payload.is_recurring) {
          for (let i = 0; i < 12; i++) {
            const date = new Date(payload.date);
            date.setMonth(date.getMonth() + i);
            inserts.push({
              ...basePayload,
              date: date.toISOString().split("T")[0]
            });
          }
        } else {
          inserts.push(basePayload);
        }
        const {
          error
        } = await supabase.from("transactions").insert(inserts);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["transactions"]
      });
      toast.success("Transação salva!");
      setEditing(null);
    },
    onError: (e) => {
      console.error(e);
      alert("ERRO DO BANCO DE DADOS:\n" + JSON.stringify(e));
      toast.error("Erro ao salvar: " + (e.message || "Verifique os campos"));
    }
  });
  const confirm = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("transactions").update({
        status: "confirmado"
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["transactions"]
    })
  });
  const del = useMutation({
    mutationFn: async (t) => {
      if (t.receipt_url) await supabase.storage.from("receipts").remove([t.receipt_url]);
      const {
        error
      } = await supabase.from("transactions").delete().eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["transactions"]
      });
      toast.success("Removida");
    }
  });
  const openReceipt = async (path) => {
    const {
      data,
      error
    } = await supabase.storage.from("receipts").createSignedUrl(path, 3600);
    if (error) return toast.error(error.message);
    setViewing(data.signedUrl);
  };
  const monthKey = (d) => d.slice(0, 7);
  const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const filtered = txs.filter((t) => {
    const statusMatch = filter === "all" || t.status === filter;
    const holderMatch = holderFilter === "all" || (t.cardholder || "Principal") === holderFilter;
    const methodMatch = methodFilter === "all" || (t.payment_method || "Outro") === methodFilter;
    const typeMatch = typeFilter === "all" || t.type === typeFilter;
    const monthMatch = monthKey(t.date) === currentMonthKey;
    return statusMatch && holderMatch && methodMatch && typeMatch && monthMatch;
  });
  txs.filter((t) => t.status === "pendente_revisao").length;
  const uniqueHolders = Array.from(new Set(txs.map((t) => t.cardholder || "Principal").filter(Boolean)));
  const uniqueMethods = Array.from(new Set(txs.map((t) => t.payment_method || "Outro").filter(Boolean)));
  const handleAdd = () => {
    setEditing({
      type: "income",
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      classification: "PJ",
      payment_method: "Transferência",
      amount: 0,
      category: "Outros",
      source: "manual",
      sharing_type: "private",
      paid_by: "me"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight md:text-3xl", children: "Transações" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Tudo o que a IA registrou pra você." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 rounded-lg border bg-card p-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 z-10", onClick: () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32 text-center text-sm font-medium capitalize cursor-pointer hover:bg-muted/50 rounded py-1 pointer-events-auto", children: new Intl.DateTimeFormat("pt-BR", {
              month: "long",
              year: "numeric"
            }).format(currentMonth) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-auto p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: currentMonth.getMonth().toString(), onValueChange: (v) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(v), 1)), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[120px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Array.from({
                  length: 12
                }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: i.toString(), children: new Intl.DateTimeFormat("pt-BR", {
                  month: "long"
                }).format(new Date(2e3, i, 1)) }, i)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: currentMonth.getFullYear().toString(), onValueChange: (v) => setCurrentMonth(new Date(parseInt(v), currentMonth.getMonth(), 1)), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[100px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Array.from({
                  length: 20
                }).map((_, i) => {
                  const year = (/* @__PURE__ */ new Date()).getFullYear() - 10 + i;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: year.toString(), children: year }, year);
                }) })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 z-10", onClick: () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
          " Nova Transação"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: filter, onValueChange: (v) => setFilter(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "all", children: [
          "Todas (",
          filtered.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "pendente_revisao", children: [
          "Pendentes (",
          filtered.filter((t) => t.status === "pendente_revisao").length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "confirmado", children: "Confirmadas" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: typeFilter, onValueChange: (v) => setTypeFilter(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-[150px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Tipo" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Entradas e Saídas" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "income", children: "Só Entradas (Recebimentos)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expense", children: "Só Saídas (Despesas)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: holderFilter, onValueChange: setHolderFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-[150px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Filtrar Conta/Cartão" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Todas as Contas/Cartões" }),
            uniqueHolders.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h, children: h }, h))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: methodFilter, onValueChange: setMethodFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-[150px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Filtrar Pgto" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Todas Formas" }),
            uniqueMethods.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-0 shadow-soft", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 p-5", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 animate-pulse rounded-lg bg-muted" }, i)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-10 text-center text-sm text-muted-foreground", children: "Nada por aqui." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: filtered.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap items-center gap-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium flex items-center gap-2", children: [
            t.target_source || t.establishment || t.description,
            t.sharing_type === "shared" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "px-1.5 py-0 text-[10px] bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { className: "w-3 h-3 mr-1" }),
              " Casal"
            ] })
          ] }),
          t.doc_type === "faturamento_pj" && t.type !== "expense" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 gap-1 px-1.5 py-0 text-[10px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-3 w-3" }),
            " Faturamento PJ"
          ] }),
          t.status === "pendente_revisao" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-warning/40 text-warning-foreground", children: "pendente" }),
          t.classification === "PF" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-blue-500/30 bg-blue-500/10 text-blue-600 px-1.5 py-0 text-[10px]", children: "PF" }),
          t.classification === "PJ" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-purple-500/30 bg-purple-500/10 text-purple-600 px-1.5 py-0 text-[10px]", children: "PJ" }),
          t.cardholder && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "px-1.5 py-0 text-[10px]", children: t.cardholder }),
          t.receipt_url && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openReceipt(t.receipt_url), className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(t.date).toLocaleDateString("pt-BR") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-2 w-2 rounded-full", style: {
              background: CATEGORY_COLORS[t.category] ?? "#9CA3AF"
            } }),
            t.category
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1 px-1.5 py-0 text-[10px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SourceIcon, { source: t.source }),
            SOURCE_LABEL[t.source] ?? t.source
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${t.type === "income" ? "text-success" : ""}`, children: [
        t.type === "income" ? "+" : "-",
        " ",
        brl(Number(t.amount))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        t.status === "pendente_revisao" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => confirm.mutate(t.id), title: "Confirmar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-success" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(t), title: "Editar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Remover", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Excluir transação?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => del.mutate(t), className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Excluir" })
            ] })
          ] })
        ] })
      ] })
    ] }, t.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editing, onOpenChange: (o) => !o && setEditing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing?.id ? "Editar transação" : "Nova transação manual" }) }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4 max-h-[85vh] overflow-y-auto pr-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.type, onValueChange: (v) => {
                const docType = v === "expense" && editing.doc_type === "faturamento_pj" ? "despesa" : editing.doc_type;
                setEditing({
                  ...editing,
                  type: v,
                  doc_type: docType
                });
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "income", children: "Entrada" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expense", children: "Saída" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Classificação" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.classification || "PF", onValueChange: (v) => setEditing({
                ...editing,
                classification: v
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "PF", children: "Pessoal (PF)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "PJ", children: "Profissional (PJ)" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: editing.type === "income" ? "Quem pagou? (Origem)" : "Local / Estabelecimento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.establishment ?? "", onChange: (e) => setEditing({
              ...editing,
              establishment: e.target.value
            }), placeholder: "Ex: Mercado Assaí, Cliente X" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Categoria" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.category, onValueChange: (v) => setEditing({
              ...editing,
              category: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Valor (R$)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: editing.amount, onChange: (e) => setEditing({
                ...editing,
                amount: parseFloat(e.target.value) || 0
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Data" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: editing.date, onChange: (e) => setEditing({
                ...editing,
                date: e.target.value
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Forma de Pgto" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.payment_method || "Pix", onValueChange: (v) => setEditing({
                ...editing,
                payment_method: v
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Pix", children: "Pix" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Cartão de Crédito", children: "Cartão de Crédito" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Cartão de Débito", children: "Cartão de Débito" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Dinheiro", children: "Dinheiro" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Transferência", children: "Transferência" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conta / Cartão" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.cardholder ?? "Principal", onChange: (e) => setEditing({
                ...editing,
                cardholder: e.target.value
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Propriedade do Gasto" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.sharing_type || "private", onValueChange: (v) => setEditing({
                ...editing,
                sharing_type: v
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "private", children: "Particular (Apenas Meu)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "shared", children: "Conta da Casa (Compartilhado)" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quem pagou?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.paid_by || "me", onValueChange: (v) => setEditing({
                ...editing,
                paid_by: v
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "me", children: "Eu paguei" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "spouse", children: "Parceiro pagou" })
                ] })
              ] })
            ] })
          ] }),
          editing.payment_method === "Cartão de Crédito" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 p-3 bg-muted rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Parcela Atual" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: editing.installments_current || "", onChange: (e) => setEditing({
                ...editing,
                installments_current: parseInt(e.target.value) || null
              }), placeholder: "Ex: 1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total de Parcelas" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: editing.installments_total || "", onChange: (e) => setEditing({
                ...editing,
                installments_total: parseInt(e.target.value) || null
              }), placeholder: "Ex: 12" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "fixed", checked: !!editing.is_fixed, onCheckedChange: (checked) => setEditing({
                ...editing,
                is_fixed: checked === true
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fixed", children: "Despesa Fixa" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "recurring", checked: !!editing.is_recurring, onCheckedChange: (checked) => setEditing({
                ...editing,
                is_recurring: checked === true
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "recurring", children: "Despesa Recorrente" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Anotações ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(Opcional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Detalhes adicionais da transação...", value: editing.notes || "", onChange: (e) => setEditing({
              ...editing,
              notes: e.target.value
            }) })
          ] })
        ] }),
        editing.doc_type === "faturamento_pj" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Descrição do Serviço" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.description ?? "", onChange: (e) => setEditing({
            ...editing,
            description: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveTx.mutate(editing), disabled: saveTx.isPending, className: "mt-2", children: "Salvar" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => !o && setViewing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Comprovante" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: viewing, alt: "comprovante", className: "max-h-[70vh] w-full rounded-xl object-contain" })
    ] }) })
  ] });
}
export {
  TransactionsPage as component
};

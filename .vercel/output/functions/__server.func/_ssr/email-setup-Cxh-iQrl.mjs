import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAuth } from "./useAuth-BVgnNSgv.mjs";
import { C as Card } from "./card-CBcrKIMI.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { B as Badge } from "./badge-B-q03HH0.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-c5KQ8wMi.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { M as Mail, j as Check, q as Copy, A as ArrowRight } from "../_libs/lucide-react.mjs";
import "./client-CLur3KMT.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
function Step({
  n,
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground", children: n }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm text-muted-foreground", children })
    ] })
  ] });
}
function EmailSetupPage() {
  const {
    user
  } = useAuth();
  const [copied, setCopied] = reactExports.useState(false);
  const inbox = user ? `${user.id.slice(0, 12)}@inbox.friccaozero.app` : "carregando...";
  const copy = async () => {
    await navigator.clipboard.writeText(inbox);
    setCopied(true);
    toast.success("Endereço copiado!");
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight md:text-3xl", children: "Conectar e-mail" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Encaminhe recibos automaticamente do Uber, iFood, Mercado Livre e muito mais." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-5 shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: "Seu endereço exclusivo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded-lg bg-muted px-3 py-2 font-mono text-sm break-all", children: inbox }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: copy, variant: "outline", children: [
            copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mr-1 h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "mr-1 h-4 w-4" }),
            copied ? "Copiado" : "Copiar"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Tudo que chegar aqui vira uma transação pendente de revisão no seu dashboard." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 font-semibold", children: "Como configurar o encaminhamento automático" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "gmail", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "gmail", children: "Gmail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "outlook", children: "Outlook" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "gmail", className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { n: 1, title: "Abra as configurações do Gmail", children: [
            "Clique na engrenagem ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "⚙️" }),
            " e depois em ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: '"Ver todas as configurações"' }),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { n: 2, title: "Vá em 'Encaminhamento e POP/IMAP'", children: [
            "Clique em ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: '"Adicionar um endereço de encaminhamento"' }),
            " e cole seu endereço acima."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { n: 3, title: "Confirme o e-mail", children: [
            "O Google enviará um código para ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1", children: inbox }),
            ". O código aparecerá aqui nesta tela em breve."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { n: 4, title: "Crie um filtro automático", children: [
            "Volte para a aba ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: '"Filtros e endereços bloqueados"' }),
            " → ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: '"Criar novo filtro"' }),
            ".",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 space-y-1 rounded-lg border bg-muted/40 p-3 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "De:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "noreply@uber.com, receipts@ifood.com.br, orders@mercadolivre.com" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Adicione outros remetentes de recibos que você recebe." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { n: 5, title: "Escolha a ação", children: [
            "Marque ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: '"Encaminhar para"' }),
            " e selecione seu endereço ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1", children: inbox }),
            ". Salve."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "outlook", className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { n: 1, title: "Abra as configurações do Outlook", children: [
            "Engrenagem no canto superior direito → ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: '"Ver todas as configurações do Outlook"' }),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { n: 2, title: "Vá em 'Correio' → 'Regras'", children: [
            "Clique em ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: '"Adicionar nova regra"' }),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { n: 3, title: "Defina a condição", children: [
            "Nome: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "Recibos Tephinancial" }),
            ". Em ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: '"Adicionar uma condição"' }),
            " → ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: '"De"' }),
            " → adicione os remetentes de recibos (Uber, iFood, etc)."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { n: 4, title: "Escolha a ação", children: [
            "Em ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: '"Adicionar uma ação"' }),
            " → ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: '"Redirecionar para"' }),
            " → cole ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1", children: inbox }),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { n: 5, title: "Salve a regra", children: [
            "Clique em ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: '"Salvar"' }),
            ". Novos recibos aparecerão no dashboard automaticamente."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "mt-0.5 h-5 w-5 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "O que acontece depois?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          "Cada recibo encaminhado é processado pela IA e aparece no dashboard como ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "pendente de revisão" }),
          ". Você só precisa confirmar (ou editar) com um clique."
        ] })
      ] })
    ] }) })
  ] });
}
export {
  EmailSetupPage as component
};

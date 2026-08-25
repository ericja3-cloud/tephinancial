import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { Z as Zap, d as Sparkles, A as ArrowRight, C as Camera, U as Upload, M as Mail, e as ShieldCheck } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function Feature({
  icon: Icon,
  title,
  desc
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: desc })
  ] });
}
function Landing() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-semibold tracking-tight", children: "Tephinancial" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", children: "Entrar" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-20 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-soft", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
          "Powered by IA"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl", children: [
          "Finanças pessoais sem ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-hero bg-clip-text text-transparent", children: "digitar nada" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg", children: "Tire foto do comprovante, envie um arquivo ou encaminhe seus recibos por e-mail. A IA lê, categoriza e registra tudo pra você." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap items-center justify-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", className: "bg-gradient-primary shadow-elevated", children: [
            "Começar grátis ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#features", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", variant: "outline", children: "Como funciona" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-primary/10 to-transparent" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "features", className: "mx-auto max-w-6xl px-6 pb-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Feature, { icon: Camera, title: "Tire uma foto", desc: "Fotografe a nota fiscal com o celular. A IA extrai valor, data e categoria." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Feature, { icon: Upload, title: "Arraste e solte", desc: "Envie PDFs de fatura ou prints de comprovante e deixe a mágica acontecer." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Feature, { icon: Mail, title: "Encaminhe por e-mail", desc: "Configure uma vez e todos os recibos do Uber, iFood e Mercado Livre entram sozinhos." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Feature, { icon: Sparkles, title: "Categorização automática", desc: "Alimentação, transporte, lazer, saúde... a IA classifica pra você." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Feature, { icon: Zap, title: "Zero fricção", desc: "Sem formulários intermináveis. Aprove com um clique e siga sua vida." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Feature, { icon: ShieldCheck, title: "Privado e seguro", desc: "Seus comprovantes ficam só com você, protegidos por autenticação." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "border-t py-8 text-center text-xs text-muted-foreground", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Tephinancial. Suas finanças no automático."
    ] })
  ] });
}
export {
  Landing as component
};

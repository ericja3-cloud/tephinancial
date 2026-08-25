import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { S as redirect } from "../_libs/tanstack__router-core.mjs";
import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-CLur3KMT.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { c as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./server-CU1fTwFN.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-aaZtlEbX.mjs";
import { g as generateText, o as output_exports, N as NoObjectGeneratedError } from "../_libs/ai.mjs";
import { o as object, _ as _enum, a as string, n as number, b as array } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/ai-sdk__gateway.mjs";
import "../_libs/ai-sdk__provider-utils.mjs";
import "../_libs/ai-sdk__provider.mjs";
import "../_libs/eventsource-parser.mjs";
import "../_libs/@vercel/oidc.mjs";
import "path";
import "fs";
import "os";
import "../_libs/workflow__serde.mjs";
const appCss = "/assets/styles-CthZtvl7.css";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$b = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tephinancial – Finanças pessoais no automático" },
      { name: "description", content: "Tire foto do comprovante e pronto: a IA lê, categoriza e organiza suas despesas. Sem digitação manual." },
      { property: "og:title", content: "Tephinancial" },
      { property: "og:description", content: "Zero digitação. Foto, upload ou e-mail — a IA registra pra você." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Tephinancial" },
      { name: "twitter:description", content: "Zero digitação. Foto, upload ou e-mail — a IA registra pra você." }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      {
        rel: "manifest",
        href: "/manifest.json"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("script", { dangerouslySetInnerHTML: {
        __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                  console.log('SW registered:', registration);
                }).catch(error => {
                  console.log('SW registration failed:', error);
                });
              });
            }
          `
      } })
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$b.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
const $$splitComponentImporter$9 = () => import("./auth-C1I-B7T7.mjs");
const Route$a = createFileRoute("/auth")({
  head: () => ({
    meta: [{
      title: "Entrar – Tephinancial"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./route-CmhVOhWB.mjs");
const Route$9 = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data,
      error
    } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({
      to: "/auth"
    });
    return {
      user: data.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./index-DEGquJed.mjs");
const Route$8 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Tephinancial – Finanças pessoais no automático"
    }, {
      name: "description",
      content: "Tire foto do comprovante e pronto: a IA lê, categoriza e organiza suas despesas. Sem digitação manual."
    }, {
      property: "og:title",
      content: "Tephinancial – Finanças pessoais no automático"
    }, {
      property: "og:description",
      content: "Zero digitação. Foto, upload ou e-mail — a IA registra pra você."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./transactions-BAjuu0ec.mjs");
const Route$7 = createFileRoute("/_authenticated/transactions")({
  head: () => ({
    meta: [{
      title: "Transações – Tephinancial"
    }]
  }),
  validateSearch: (search) => ({
    action: search.action
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./settings-rrEmY5mt.mjs");
const Route$6 = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{
      title: "Configurações – Tephinancial"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./email-setup-Cxh-iQrl.mjs");
const Route$5 = createFileRoute("/_authenticated/email-setup")({
  head: () => ({
    meta: [{
      title: "Conectar e-mail – Tephinancial"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./dashboard-C56wDFqy.mjs");
const Route$4 = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard – Tephinancial"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./couple-BrfE1Lk8.mjs");
const Route$3 = createFileRoute("/_authenticated/couple")({
  head: () => ({
    meta: [{
      title: "Casal – Tephinancial"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./chat-BDp-1kNJ.mjs");
const Route$2 = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [{
      title: "Gerente de Bolso – Tephinancial"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./capture-S31eHdTj.mjs");
const Route$1 = createFileRoute("/_authenticated/capture")({
  head: () => ({
    meta: [{
      title: "Capturar comprovante – Tephinancial"
    }]
  }),
  validateSearch: (search) => ({
    defaultShared: search.defaultShared ? Boolean(search.defaultShared) : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const CATEGORIES$1 = ["Alimentação", "Transporte", "Lazer", "Saúde", "Contas Fixas", "Serviços Prestados", "Outros"];
const TransactionSchema = object({
  tipo_documento: _enum(["despesa", "faturamento_pj"]).nullable(),
  estabelecimento: string().nullable(),
  valor: number().nullable(),
  data: string().nullable(),
  categoria_sugerida: _enum(CATEGORIES$1).nullable(),
  descricao_servico: string().nullable(),
  classificacao: _enum(["PF", "PJ"]).nullable(),
  portador: string().nullable(),
  confiança: _enum(["Alta", "Média", "Baixa"]).nullable(),
  propriedade: _enum(["particular", "casa"]).nullable()
});
const ExtractSchema = object({
  transacoes: array(TransactionSchema)
});
async function extractTransactionsFromBlob(file) {
  const key = process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY;
  if (!key) {
    console.log("Mocking AI response since GEMINI_API_KEY is missing");
    await new Promise((resolve) => setTimeout(resolve, 2e3));
    return {
      transacoes: [{
        tipo_documento: "despesa",
        estabelecimento: "Supermercado (Mock)",
        valor: 154.9,
        data: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        categoria_sugerida: "Alimentação",
        descricao_servico: null,
        classificacao: "PF",
        portador: "Principal",
        confiança: "Alta",
        propriedade: "casa"
      }]
    };
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
  const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
  const {
    createGoogleGenerativeAI
  } = await import("../_libs/ai-sdk__google.mjs");
  const google = createGoogleGenerativeAI({
    apiKey: key
  });
  const model = google("gemini-3.5-flash");
  const prompt = "Você é um assistente financeiro de alta precisão. Analise a imagem ou texto do documento (pode ser um recibo único ou uma fatura de cartão com dezenas de compras). Extraia TODAS as transações encontradas. Para cada transação, identifique se trata-se de uma DESPESA pessoal/comercial ou se é uma NOTA FISCAL DE SERVIÇO QUE PRECISO EMITIR/FATURAR. Classifique a transação entre 'PF' (Finanças Pessoais) ou 'PJ' (Finanças Empresariais). Identifique também o 'portador' (nome do portador do cartão, final do cartão ou 'Principal' caso não identifique adicional). Se for uma compra de mercado, conta de luz/água ou despesa conjunta, defina 'propriedade' como 'casa'. Retorne estritamente JSON contendo um array 'transacoes' preenchendo os campos descritos no schema.";
  try {
    const {
      output
    } = await generateText({
      model,
      output: output_exports.object({
        schema: ExtractSchema
      }),
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: prompt
        }, mime.startsWith("image/") ? {
          type: "image",
          image: dataUrl
        } : {
          type: "file",
          data: dataUrl,
          mediaType: mime
        }]
      }]
    });
    return output;
  } catch (err) {
    if (NoObjectGeneratedError.isInstance(err)) {
      return {
        transacoes: []
      };
    }
    const msg = String(err?.message ?? err);
    if (msg.includes("429")) throw new Error("Muitas requisições à IA. Aguarde alguns segundos e tente novamente.");
    if (msg.includes("402")) throw new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
    throw new Error("Falha ao processar o comprovante: " + msg);
  }
}
const extractReceipt = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("20f92152bfa788f58b12276be000fafca05df61c5056af58fa5ccb5dbf7ffc5e"));
const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Lazer",
  "Saúde",
  "Moradia",
  "Educação",
  "Compras",
  "Cuidados Pessoais",
  "Pets",
  "Contas Fixas",
  "Impostos/Taxas",
  "Serviços",
  "Outros"
];
const CATEGORY_COLORS = {
  "Alimentação": "#F59E0B",
  "Transporte": "#3B82F6",
  "Lazer": "#8B5CF6",
  "Saúde": "#EF4444",
  "Moradia": "#14B8A6",
  "Educação": "#F43F5E",
  "Compras": "#EC4899",
  "Cuidados Pessoais": "#D946EF",
  "Pets": "#84CC16",
  "Contas Fixas": "#10B981",
  "Impostos/Taxas": "#F97316",
  "Serviços": "#0EA5E9",
  "Outros": "#6B7280"
};
const SOURCE_LABEL = {
  manual: "Manual",
  upload: "Upload",
  camera: "Câmera",
  email: "E-mail"
};
const Route = createFileRoute("/api/public/inbound-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
          if (!serviceRoleKey || !supabaseUrl) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY or URL");
            return new Response("Server configuration error", { status: 500 });
          }
          const supabase2 = createClient(supabaseUrl, serviceRoleKey);
          const formData = await request.formData();
          const from = formData.get("from")?.toString() || "";
          const to = formData.get("to")?.toString() || "";
          const subject = formData.get("subject")?.toString() || "";
          console.log("[inbound-email] received from:", from, "to:", to);
          const emailMatch = from.match(/<([^>]+)>/);
          const senderEmail = emailMatch ? emailMatch[1] : from;
          const { data: { users }, error: authError } = await supabase2.auth.admin.listUsers();
          if (authError || !users) {
            return new Response("Auth list error", { status: 500 });
          }
          const user = users.find((u) => u.email === senderEmail);
          if (!user) {
            console.warn("[inbound-email] Remetente não autorizado:", senderEmail);
            return Response.json({ ok: true, ignored: "unauthorized sender" });
          }
          let fileBlob = null;
          let fileName = "anexo";
          for (const [key, value] of formData.entries()) {
            if (value instanceof Blob && value.size > 0 && key !== "attachment-info") {
              fileBlob = value;
              fileName = value.name || "comprovante.pdf";
              break;
            }
          }
          if (!fileBlob) {
            console.warn("[inbound-email] Nenhum anexo encontrado");
            return Response.json({ ok: true, ignored: "no attachment" });
          }
          const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
          const storagePath = `${user.id}/${Date.now()}-${safeName}`;
          const { error: uploadError } = await supabase2.storage.from("receipts").upload(storagePath, fileBlob, { upsert: true });
          if (uploadError) {
            console.error("[inbound-email] Falha no upload", uploadError);
            return new Response("Upload error", { status: 500 });
          }
          const aiResult = await extractTransactionsFromBlob(fileBlob);
          const txs = aiResult.transacoes || [];
          if (txs.length === 0) {
            console.warn("[inbound-email] IA não encontrou transações");
            return Response.json({ ok: true, ignored: "no transactions found" });
          }
          const inserts = txs.map((t) => {
            const cat = t.categoria_sugerida && CATEGORIES.includes(t.categoria_sugerida) ? t.categoria_sugerida : "Outros";
            const isPJ = t.tipo_documento === "faturamento_pj";
            const amount = t.valor != null ? Number(t.valor) : 0;
            return {
              user_id: user.id,
              doc_type: t.tipo_documento || "despesa",
              type: isPJ ? "income" : "expense",
              payment_method: "Cartão de Crédito",
              target_source: isPJ ? t.estabelecimento ?? "" : "",
              description: t.descricao_servico || t.estabelecimento || subject,
              establishment: t.estabelecimento || null,
              amount: isNaN(amount) ? 0 : amount,
              date: t.data && t.data.includes("/") ? t.data.split("/").reverse().join("-") : t.data ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
              category: cat,
              classification: t.classificacao === "PJ" ? "PJ" : "PF",
              ai_confidence: t.confiança ?? "Baixa",
              source: "email",
              status: "pendente_revisao",
              receipt_url: storagePath
            };
          });
          const { error: dbError } = await supabase2.from("transactions").insert(inserts);
          if (dbError) {
            console.error("[inbound-email] Erro ao inserir no BD", dbError);
            return new Response("Database error", { status: 500 });
          }
          return Response.json({ ok: true, transactionsSaved: inserts.length });
        } catch (error) {
          console.error("[inbound-email] Falha geral", error);
          return new Response(error.message, { status: 500 });
        }
      }
    }
  }
});
const AuthRoute = Route$a.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$b
});
const AuthenticatedRouteRoute = Route$9.update({
  id: "/_authenticated",
  getParentRoute: () => Route$b
});
const IndexRoute = Route$8.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$b
});
const AuthenticatedTransactionsRoute = Route$7.update({
  id: "/transactions",
  path: "/transactions",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedSettingsRoute = Route$6.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedEmailSetupRoute = Route$5.update({
  id: "/email-setup",
  path: "/email-setup",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedDashboardRoute = Route$4.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedCoupleRoute = Route$3.update({
  id: "/couple",
  path: "/couple",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedChatRoute = Route$2.update({
  id: "/chat",
  path: "/chat",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedCaptureRoute = Route$1.update({
  id: "/capture",
  path: "/capture",
  getParentRoute: () => AuthenticatedRouteRoute
});
const ApiPublicInboundEmailRoute = Route.update({
  id: "/api/public/inbound-email",
  path: "/api/public/inbound-email",
  getParentRoute: () => Route$b
});
const AuthenticatedRouteRouteChildren = {
  AuthenticatedCaptureRoute,
  AuthenticatedChatRoute,
  AuthenticatedCoupleRoute,
  AuthenticatedDashboardRoute,
  AuthenticatedEmailSetupRoute,
  AuthenticatedSettingsRoute,
  AuthenticatedTransactionsRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  AuthRoute,
  ApiPublicInboundEmailRoute
};
const routeTree = Route$b._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  CATEGORY_COLORS as C,
  Route$7 as R,
  SOURCE_LABEL as S,
  CATEGORIES as a,
  Route$1 as b,
  createSsrRpc as c,
  extractReceipt as e,
  router as r
};

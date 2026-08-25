import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { s as supabase } from "./client-CLur3KMT.mjs";
import { C as Card } from "./card-CBcrKIMI.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { B as Badge } from "./badge-B-q03HH0.mjs";
import { b as Route$1, a as CATEGORIES, e as extractReceipt, c as createSsrRpc } from "./router-f3VAqw2h.mjs";
import { c as createServerFn } from "./server-CU1fTwFN.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-aaZtlEbX.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { i as imageCompression } from "../_libs/browser-image-compression.mjs";
import "../_libs/seroval.mjs";
import { C as Camera, U as Upload, k as Pencil, L as LoaderCircle, d as Sparkles, T as Trash2, X } from "../_libs/lucide-react.mjs";
import { o as object, a as string } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
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
import "../_libs/ai.mjs";
import "../_libs/ai-sdk__gateway.mjs";
import "../_libs/ai-sdk__provider-utils.mjs";
import "../_libs/ai-sdk__provider.mjs";
import "../_libs/eventsource-parser.mjs";
import "../_libs/@vercel/oidc.mjs";
import "path";
import "fs";
import "os";
import "../_libs/workflow__serde.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
const SendWhatsAppSchema = object({
  to: string(),
  templateName: string()
});
const sendWhatsAppNotification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).validator(SendWhatsAppSchema).handler(createSsrRpc("f5cf2d5865f7acbfd61b8d94f6780c76d22fec877008ff079eae1d7ff6c83171"));
function CapturePage() {
  const router = useRouter();
  const {
    defaultShared
  } = Route$1.useSearch();
  const extract = useServerFn(extractReceipt);
  const [stage, setStage] = reactExports.useState("idle");
  const [previewUrl, setPreviewUrl] = reactExports.useState(null);
  const [storagePath, setStoragePath] = reactExports.useState(null);
  const [source, setSource] = reactExports.useState("upload");
  const [dragOver, setDragOver] = reactExports.useState(false);
  const [forms, setForms] = reactExports.useState([]);
  const cameraRef = reactExports.useRef(null);
  const fileRef = reactExports.useRef(null);
  const reset = () => {
    setStage("idle");
    setPreviewUrl(null);
    setStoragePath(null);
    setForms([]);
  };
  const handleFile = reactExports.useCallback(async (file, origin) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Arquivo muito grande.");
      return;
    }
    setSource(origin);
    setStage("uploading");
    try {
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        };
        fileToUpload = await imageCompression(file, options);
      }
      setPreviewUrl(URL.createObjectURL(fileToUpload));
      const {
        data: userData
      } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Não autenticado");
      const ext = fileToUpload.name.split(".").pop() || (fileToUpload.type.split("/")[1] ?? "jpg");
      const path = `${uid}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("receipts").upload(path, fileToUpload, {
        contentType: fileToUpload.type
      });
      if (up.error) throw up.error;
      setStoragePath(path);
      setStage("processing");
      const result = await extract({
        data: {
          path
        }
      });
      const txs = result.transacoes || [];
      if (txs.length === 0) throw new Error("Nenhuma transação encontrada no documento.");
      const newForms = txs.map((t) => {
        const cat = t.categoria_sugerida && CATEGORIES.includes(t.categoria_sugerida) ? t.categoria_sugerida : "Outros";
        const isPJ = t.tipo_documento === "faturamento_pj";
        return {
          id: crypto.randomUUID(),
          doc_type: t.tipo_documento || "despesa",
          type: isPJ ? "income" : "expense",
          payment_method: "Cartão de Crédito",
          target_source: isPJ ? t.estabelecimento ?? "" : "",
          description: t.descricao_servico ?? "",
          establishment: t.estabelecimento ?? "",
          amount: t.valor != null ? String(t.valor) : "0",
          date: t.data ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
          category: cat,
          classification: t.classificacao === "PJ" ? "PJ" : "PF",
          cardholder: t.portador || "Principal",
          confidence: t.confiança ?? "Baixa",
          sharing_type: defaultShared ? "shared" : t.propriedade === "casa" ? "shared" : "private"
        };
      });
      setForms(newForms);
      setStage("review");
    } catch (e) {
      toast.error(e.message ?? "Falha ao processar comprovante");
      reset();
    }
  }, [extract]);
  const save = useMutation({
    mutationFn: async () => {
      const {
        data: userData
      } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Não autenticado");
      const inserts = forms.map((f) => {
        const amount = parseFloat(f.amount);
        return {
          user_id: uid,
          type: f.type,
          payment_method: f.payment_method,
          target_source: f.target_source,
          doc_type: f.doc_type,
          classification: f.classification,
          cardholder: f.cardholder,
          amount: isNaN(amount) ? 0 : amount,
          description: f.description || f.establishment || "Comprovante",
          establishment: f.establishment || null,
          category: f.category,
          date: f.date,
          source,
          status: "pendente_revisao",
          ai_confidence: f.confidence,
          receipt_url: storagePath,
          sharing_type: f.sharing_type,
          paid_by: f.sharing_type === "shared" ? "me" : null
        };
      });
      const {
        error
      } = await supabase.from("transactions").insert(inserts);
      if (error) throw error;
      try {
        const {
          data: profile
        } = await supabase.from("profiles").select("whatsapp_number").eq("id", uid).maybeSingle();
        if (profile?.whatsapp_number) {
          sendWhatsAppNotification({
            data: {
              to: profile.whatsapp_number,
              templateName: "hello_world"
              // Template temporário para testes
            }
          }).catch((err) => console.error("Falha ao enviar whatsapp em bg:", err));
        }
      } catch (e) {
        console.error("Erro ao tentar enviar notificação:", e);
      }
    },
    onSuccess: () => {
      toast.success("Transações registradas!");
      reset();
      router.navigate({
        to: "/transactions"
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight md:text-3xl text-primary", children: "Tephinancial" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Tire uma foto do comprovante — a IA cuida do resto." })
    ] }),
    stage === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col items-center justify-center gap-3 p-10 text-center border-2 border-primary/20 bg-primary/5 hover:border-primary/50 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-primary", children: "Tirar foto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Abre a câmera do celular" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => cameraRef.current?.click(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "mr-2 h-4 w-4" }),
          " Abrir câmera"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: cameraRef, type: "file", accept: "image/*", capture: "environment", className: "hidden", onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f, "camera");
          e.target.value = "";
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden items-center justify-center text-xs uppercase tracking-widest text-muted-foreground md:flex", children: "ou" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { onDragOver: (e) => {
        e.preventDefault();
        setDragOver(true);
      }, onDragLeave: () => setDragOver(false), onDrop: (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f, "upload");
      }, className: `flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-10 text-center transition ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`, onClick: () => fileRef.current?.click(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Arraste um arquivo aqui" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "ou clique para escolher" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "image/*,application/pdf", className: "hidden", onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f, "upload");
          e.target.value = "";
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden items-center justify-center text-xs uppercase tracking-widest text-muted-foreground md:flex", children: "ou" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col items-center justify-center gap-3 border-2 border-border border-dashed hover:border-primary/50 transition cursor-pointer p-10 text-center", onClick: () => router.navigate({
        to: "/transactions",
        search: {
          action: "new"
        }
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Digitar Manualmente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Preencher formulário sem IA" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "pointer-events-none", onClick: (e) => e.preventDefault(), children: "Abrir formulário" })
      ] })
    ] }),
    (stage === "uploading" || stage === "processing") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col items-center gap-4 p-10 text-center shadow-soft", children: [
      previewUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewUrl, alt: "preview", className: "max-h-64 rounded-xl border object-contain" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: stage === "uploading" ? "Enviando..." : "A IA está processando as transações..." })
      ] })
    ] }),
    stage === "review" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold", children: [
          "Confira o que a IA leu (",
          forms.length,
          ")"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-[200px_1fr]", children: [
        previewUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewUrl, alt: "preview", className: "sticky top-6 max-h-[500px] w-full rounded-xl border object-contain" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
          forms.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-medium", children: f.establishment || "Despesa" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: f.cardholder }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px]", children: f.classification })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                new Date(f.date).toLocaleDateString("pt-BR"),
                " · ",
                f.category
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                "R$ ",
                f.amount
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "text-destructive", onClick: () => setForms((fs) => fs.filter((x) => x.id !== f.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
            ] })
          ] }, f.id)),
          forms.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma transação na lista." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: async () => {
          if (storagePath) await supabase.storage.from("receipts").remove([storagePath]);
          reset();
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-4 w-4" }),
          " Descartar"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: save.isPending || forms.length === 0, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
          "Salvar ",
          forms.length,
          " transações"
        ] })
      ] })
    ] })
  ] });
}
export {
  CapturePage as component
};

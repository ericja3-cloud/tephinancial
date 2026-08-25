import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CLur3KMT.mjs";
import { u as useAuth } from "./useAuth-BVgnNSgv.mjs";
import { C as Card } from "./card-CBcrKIMI.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { L as Label } from "./label-Brw405F4.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as Target, m as Building2, n as Calendar, P as Plus, T as Trash2, o as CreditCard, d as Sparkles, p as Lock } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
function SettingsPage() {
  const qc = useQueryClient();
  const {
    user
  } = useAuth();
  const router = useRouter();
  const [name, setName] = reactExports.useState("");
  const [whatsapp, setWhatsapp] = reactExports.useState("");
  const [budget, setBudget] = reactExports.useState("");
  const [taxRate, setTaxRate] = reactExports.useState("");
  const [closingDay, setClosingDay] = reactExports.useState("");
  const [cards, setCards] = reactExports.useState([]);
  const [localClients, setLocalClients] = reactExports.useState([]);
  const [newPassword, setNewPassword] = reactExports.useState("");
  const {
    data: clients
  } = useQuery({
    queryKey: ["pj_clients", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("pj_clients").select("*").eq("user_id", user.id);
      if (error) throw error;
      return data;
    }
  });
  const {
    data: profile
  } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  reactExports.useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setWhatsapp(profile.whatsapp_number || "");
      setBudget(profile.monthly_budget?.toString() || "");
      setTaxRate(profile.pj_tax_rate?.toString() || "");
      setClosingDay(profile.accounting_closing_day?.toString() || "");
      if (profile.cardholders) {
        setCards(profile.cardholders);
      }
    }
  }, [profile]);
  reactExports.useEffect(() => {
    if (clients) setLocalClients(clients);
  }, [clients]);
  const save = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const {
        error
      } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name,
        whatsapp_number: whatsapp,
        monthly_budget: budget ? parseFloat(budget) : null,
        pj_tax_rate: taxRate ? parseFloat(taxRate) : null,
        accounting_closing_day: closingDay ? parseInt(closingDay) : null,
        cardholders: cards
      });
      if (error) throw error;
      const existingIds = clients?.map((c) => c.id) || [];
      const currentIds = localClients.map((c) => c.id);
      const toDelete = existingIds.filter((id) => !currentIds.includes(id));
      if (toDelete.length > 0) {
        await supabase.from("pj_clients").delete().in("id", toDelete);
      }
      for (const client of localClients) {
        const payload = {
          user_id: user.id,
          client_name: client.client_name,
          billing_limit_day: parseInt(client.billing_limit_day)
        };
        if (client.id.length === 36) {
          payload.id = client.id;
        }
        const {
          error: error2
        } = await supabase.from("pj_clients").upsert(payload);
        if (error2) throw error2;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["profile"]
      });
      qc.invalidateQueries({
        queryKey: ["pj_clients"]
      });
      toast.success("Configurações salvas");
    },
    onError: (e) => {
      console.error(e);
      toast.error(e.message || "Erro ao salvar");
    }
  });
  const updatePassword = useMutation({
    mutationFn: async () => {
      if (!newPassword || newPassword.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres.");
      const {
        error
      } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewPassword("");
      toast.success("Senha alterada com sucesso!");
    },
    onError: (e) => toast.error(e.message)
  });
  const logout = async () => {
    await supabase.auth.signOut();
    router.navigate({
      to: "/auth",
      replace: true
    });
  };
  const addCard = () => {
    setCards([...cards, {
      id: crypto.randomUUID(),
      cardName: "Novo Cartão",
      holders: ["Principal"]
    }]);
  };
  const updateCardName = (id, name2) => {
    setCards(cards.map((c) => c.id === id ? {
      ...c,
      cardName: name2
    } : c));
  };
  const removeCard = (id) => {
    setCards(cards.filter((c) => c.id !== id));
  };
  const addHolder = (cardId) => {
    setCards(cards.map((c) => c.id === cardId ? {
      ...c,
      holders: [...c.holders, "Nova Conta/Cartão"]
    } : c));
  };
  const updateHolder = (cardId, idx, val) => {
    setCards(cards.map((c) => {
      if (c.id !== cardId) return c;
      const newHolders = [...c.holders];
      newHolders[idx] = val;
      return {
        ...c,
        holders: newHolders
      };
    }));
  };
  const removeHolder = (cardId, idx) => {
    setCards(cards.map((c) => {
      if (c.id !== cardId) return c;
      const newHolders = [...c.holders];
      newHolders.splice(idx, 1);
      return {
        ...c,
        holders: newHolders
      };
    }));
  };
  const addClient = () => {
    const newClient = {
      id: Date.now().toString(),
      client_name: "Novo Cliente",
      billing_limit_day: 1
    };
    setLocalClients([...localClients, newClient]);
    toast.info("Linha de cliente adicionada! Não esqueça de clicar em Salvar Alterações no final da página.");
  };
  const updateClient = (id, field, val) => {
    setLocalClients(localClients.map((c) => c.id === id ? {
      ...c,
      [field]: val
    } : c));
  };
  const removeClient = (id) => {
    setLocalClients(localClients.filter((c) => c.id !== id));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight md:text-3xl", children: "Configurações" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Seu perfil e preferências." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 font-semibold", children: "Perfil" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "E-mail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: user?.email ?? "", disabled: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nome completo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Seu nome" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Número do WhatsApp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: whatsapp, onChange: (e) => setWhatsapp(e.target.value), placeholder: "Ex: 5511999999999" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Inclua código do país e DDD (somente números)." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, className: "w-fit", children: "Salvar Alterações" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-5 shadow-soft border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-primary", children: "Automação de E-mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Encaminhe suas notas fiscais e comprovantes para a IA ler automaticamente." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => router.navigate({
        to: "/email-setup"
      }), children: "Configurar E-mail" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Gestão Financeira" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Defina suas metas e impostos para a IA acompanhar." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5 text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meta de Gastos Mensal (R$)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: budget, onChange: (e) => setBudget(e.target.value), placeholder: "Ex: 5000.00" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Para o controle de consumo (Budgeting)." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Alíquota Estimada Impostos PJ (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: taxRate, onChange: (e) => setTaxRate(e.target.value), placeholder: "Ex: 6.0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Aplicado sobre o faturamento PJ do mês." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, className: "mt-4", children: "Salvar Alterações" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Cronograma Fiscal/Contábil (PJ)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Defina os prazos para enviar documentos ao contador e faturar clientes." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-5 w-5 text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dia do Fechamento Contábil" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", max: "31", value: closingDay, onChange: (e) => setClosingDay(e.target.value), placeholder: "Ex: 5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "O sistema lembrará você de exportar os dados neste dia." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Clientes / Empresas (Prazos de Nota Fiscal)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: addClient, variant: "outline", size: "sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
              " Adicionar Cliente"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            localClients.map((client) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg border p-3 bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Nome do Cliente" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: client.client_name, onChange: (e) => updateClient(client.id, "client_name", e.target.value), className: "h-8 text-sm mt-1" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-32", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Dia Limite" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", max: "31", value: client.billing_limit_day, onChange: (e) => updateClient(client.id, "billing_limit_day", e.target.value), className: "h-8 text-sm mt-1" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => removeClient(client.id), className: "text-destructive h-8 w-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) }) })
            ] }, client.id)),
            localClients.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg", children: "Nenhum cliente cadastrado." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, className: "mt-6", children: "Salvar Alterações" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Contas e Cartões" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Cadastre as Contas e Cartões para ajudar a IA na leitura de faturas." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: addCard, variant: "outline", size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " Adicionar Cartão"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
        cards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: card.cardName, onChange: (e) => updateCardName(card.id, e.target.value), className: "h-8 w-48 font-medium" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => removeCard(card.id), className: "text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block text-xs uppercase text-muted-foreground", children: "Contas / Cartões" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2 md:grid-cols-3", children: [
              card.holders.map((holder, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: holder, onChange: (e) => updateHolder(card.id, idx, e.target.value), className: "h-8 text-sm" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-destructive shrink-0", onClick: () => removeHolder(card.id, idx), children: /* @__PURE__ */ jsxRuntimeExports.jsx(XIcon, { className: "h-3 w-3" }) })
              ] }, idx)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "h-8 w-full border-dashed", onClick: () => addHolder(card.id), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3 w-3" }),
                " Adicionar"
              ] })
            ] })
          ] })
        ] }, card.id)),
        cards.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg", children: "Nenhum cartão cadastrado." })
      ] }),
      cards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, className: "mt-4", children: "Salvar Alterações" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-primary/30 bg-primary/5 p-5 shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Inteligência Artificial embutida" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "A Tephinancial usa o Gemini via Lovable AI Gateway. Nenhuma configuração ou chave é necessária — está tudo pronto pra você usar." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-2 font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-5 w-5" }),
        " Segurança da Conta"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Altere sua senha de acesso." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nova Senha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", placeholder: "Mínimo 6 caracteres", value: newPassword, onChange: (e) => setNewPassword(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => updatePassword.mutate(), disabled: updatePassword.isPending, className: "w-full", children: updatePassword.isPending ? "Alterando..." : "Alterar Senha" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 font-semibold", children: "Sessão" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: "Sair da conta neste dispositivo." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: logout, children: "Sair" })
    ] })
  ] });
}
function XIcon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
  ] });
}
export {
  SettingsPage as component
};

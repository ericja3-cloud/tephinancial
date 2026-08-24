import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Trash2, Plus, CreditCard, Target, Building2, Calendar, HeartHandshake, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações – Tephinancial" }] }),
  component: SettingsPage,
});

type CardConfig = {
  id: string;
  cardName: string;
  holders: string[];
};

function SettingsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [budget, setBudget] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [cards, setCards] = useState<CardConfig[]>([]);
  const [localClients, setLocalClients] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState("");

  const { data: clients } = useQuery({
    queryKey: ["pj_clients", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("pj_clients").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setWhatsapp(profile.whatsapp_number || "");
      setBudget(profile.monthly_budget?.toString() || "");
      setTaxRate(profile.pj_tax_rate?.toString() || "");
      setClosingDay(profile.accounting_closing_day?.toString() || "");
      if (profile.cardholders) {
        setCards(profile.cardholders as CardConfig[]);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (clients) setLocalClients(clients);
  }, [clients]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("profiles").upsert({ 
        id: user.id, 
        full_name: name,
        whatsapp_number: whatsapp,
        monthly_budget: budget ? parseFloat(budget) : null,
        pj_tax_rate: taxRate ? parseFloat(taxRate) : null,
        accounting_closing_day: closingDay ? parseInt(closingDay) : null,
        cardholders: cards as any
      });
      if (error) throw error;

      // Sync clients
      const existingIds = clients?.map(c => c.id) || [];
      const currentIds = localClients.map(c => c.id);
      const toDelete = existingIds.filter(id => !currentIds.includes(id));
      
      if (toDelete.length > 0) {
        await supabase.from("pj_clients").delete().in("id", toDelete);
      }

      for (const client of localClients) {
        // Se for um ID temporário (menor que 36 caracteres, que é o tamanho de um UUID), não envia o ID.
        // O Supabase gerará o UUID automaticamente.
        const payload: any = {
          user_id: user.id,
          client_name: client.client_name,
          billing_limit_day: parseInt(client.billing_limit_day as any)
        };
        if (client.id.length === 36) {
           payload.id = client.id;
        }

        const { error } = await supabase.from("pj_clients").upsert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["pj_clients"] });
      toast.success("Configurações salvas");
    },
    onError: (e: any) => {
      console.error(e);
      toast.error(e.message || "Erro ao salvar");
    }
  });

  const updatePassword = useMutation({
    mutationFn: async () => {
      if (!newPassword || newPassword.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres.");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewPassword("");
      toast.success("Senha alterada com sucesso!");
    },
    onError: (e: any) => toast.error(e.message)
  });

  const logout = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  const addCard = () => {
    setCards([...cards, { id: crypto.randomUUID(), cardName: "Novo Cartão", holders: ["Principal"] }]);
  };

  const updateCardName = (id: string, name: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, cardName: name } : c));
  };

  const removeCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const addHolder = (cardId: string) => {
    setCards(cards.map(c => c.id === cardId ? { ...c, holders: [...c.holders, "Nova Conta/Cartão"] } : c));
  };

  const updateHolder = (cardId: string, idx: number, val: string) => {
    setCards(cards.map(c => {
      if (c.id !== cardId) return c;
      const newHolders = [...c.holders];
      newHolders[idx] = val;
      return { ...c, holders: newHolders };
    }));
  };

  const removeHolder = (cardId: string, idx: number) => {
    setCards(cards.map(c => {
      if (c.id !== cardId) return c;
      const newHolders = [...c.holders];
      newHolders.splice(idx, 1);
      return { ...c, holders: newHolders };
    }));
  };

  const addClient = () => {
    // Usamos um ID curto no front-end temporariamente (Date.now())
    const newClient = { id: Date.now().toString(), client_name: "Novo Cliente", billing_limit_day: 1 };
    setLocalClients([...localClients, newClient]);
    toast.info("Linha de cliente adicionada! Não esqueça de clicar em Salvar Alterações no final da página.");
  };

  const updateClient = (id: string, field: string, val: string | number) => {
    setLocalClients(localClients.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  const removeClient = (id: string) => {
    setLocalClients(localClients.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Seu perfil e preferências.</p>
      </header>

      <Card className="p-5 shadow-soft">
        <h2 className="mb-4 font-semibold">Perfil</h2>
        <div className="grid gap-4">
          <div>
            <Label>E-mail</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nome completo</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <Label>Número do WhatsApp</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ex: 5511999999999" />
              <p className="mt-1 text-xs text-muted-foreground">Inclua código do país e DDD (somente números).</p>
            </div>
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending} className="w-fit">Salvar Alterações</Button>
        </div>
      </Card>

      <Card className="p-5 shadow-soft border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-primary">Automação de E-mail</h2>
            <p className="mt-1 text-sm text-muted-foreground">Encaminhe suas notas fiscais e comprovantes para a IA ler automaticamente.</p>
          </div>
          <Button variant="outline" onClick={() => router.navigate({ to: "/email-setup" })}>Configurar E-mail</Button>
        </div>
      </Card>

      <Card className="p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Gestão Financeira</h2>
            <p className="text-sm text-muted-foreground">Defina suas metas e impostos para a IA acompanhar.</p>
          </div>
          <Target className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Meta de Gastos Mensal (R$)</Label>
            <Input type="number" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Ex: 5000.00" />
            <p className="mt-1 text-xs text-muted-foreground">Para o controle de consumo (Budgeting).</p>
          </div>
          <div>
            <Label>Alíquota Estimada Impostos PJ (%)</Label>
            <Input type="number" step="0.1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="Ex: 6.0" />
            <p className="mt-1 text-xs text-muted-foreground">Aplicado sobre o faturamento PJ do mês.</p>
          </div>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="mt-4">Salvar Alterações</Button>
      </Card>

      <Card className="p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Cronograma Fiscal/Contábil (PJ)</h2>
            <p className="text-sm text-muted-foreground">Defina os prazos para enviar documentos ao contador e faturar clientes.</p>
          </div>
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="grid gap-6">
          <div className="max-w-xs">
            <Label>Dia do Fechamento Contábil</Label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input type="number" min="1" max="31" value={closingDay} onChange={(e) => setClosingDay(e.target.value)} placeholder="Ex: 5" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">O sistema lembrará você de exportar os dados neste dia.</p>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label className="text-sm">Clientes / Empresas (Prazos de Nota Fiscal)</Label>
              <Button onClick={addClient} variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" /> Adicionar Cliente
              </Button>
            </div>
            
            <div className="space-y-3">
              {localClients.map(client => (
                <div key={client.id} className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Nome do Cliente</Label>
                    <Input 
                      value={client.client_name} 
                      onChange={e => updateClient(client.id, "client_name", e.target.value)} 
                      className="h-8 text-sm mt-1" 
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-xs text-muted-foreground">Dia Limite</Label>
                    <Input 
                      type="number" min="1" max="31"
                      value={client.billing_limit_day} 
                      onChange={e => updateClient(client.id, "billing_limit_day", e.target.value)} 
                      className="h-8 text-sm mt-1" 
                    />
                  </div>
                  <div className="pt-5">
                    <Button variant="ghost" size="icon" onClick={() => removeClient(client.id)} className="text-destructive h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {localClients.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                  Nenhum cliente cadastrado.
                </div>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="mt-6">Salvar Alterações</Button>
      </Card>

      <Card className="p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Contas e Cartões</h2>
            <p className="text-sm text-muted-foreground">Cadastre as Contas e Cartões para ajudar a IA na leitura de faturas.</p>
          </div>
          <Button onClick={addCard} variant="outline" size="sm">
            <Plus className="mr-1 h-4 w-4" /> Adicionar Cartão
          </Button>
        </div>
        
        <div className="grid gap-4">
          {cards.map(card => (
            <div key={card.id} className="rounded-lg border p-4 bg-muted/30">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <Input 
                    value={card.cardName} 
                    onChange={e => updateCardName(card.id, e.target.value)} 
                    className="h-8 w-48 font-medium" 
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeCard(card.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="pl-6">
                <Label className="mb-2 block text-xs uppercase text-muted-foreground">Contas / Cartões</Label>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {card.holders.map((holder, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <Input 
                        value={holder} 
                        onChange={e => updateHolder(card.id, idx, e.target.value)} 
                        className="h-8 text-sm" 
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeHolder(card.id, idx)}>
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="h-8 w-full border-dashed" onClick={() => addHolder(card.id)}>
                    <Plus className="mr-1 h-3 w-3" /> Adicionar
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {cards.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
              Nenhum cartão cadastrado.
            </div>
          )}
        </div>
        {cards.length > 0 && (
          <Button onClick={() => save.mutate()} disabled={save.isPending} className="mt-4">Salvar Alterações</Button>
        )}
      </Card>


      <Card className="border-primary/30 bg-primary/5 p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Inteligência Artificial embutida</p>
            <p className="mt-1 text-sm text-muted-foreground">
              O Tephinancial usa o Gemini via Lovable AI Gateway. Nenhuma configuração ou chave é necessária — está tudo pronto pra você usar.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5 shadow-soft">
        <h2 className="mb-2 font-semibold flex items-center gap-2"><Lock className="h-5 w-5" /> Segurança da Conta</h2>
        <p className="text-sm text-muted-foreground mb-4">Altere sua senha de acesso.</p>
        <div className="grid gap-4 max-w-sm">
          <div>
            <Label>Nova Senha</Label>
            <Input type="password" placeholder="Mínimo 6 caracteres" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <Button onClick={() => updatePassword.mutate()} disabled={updatePassword.isPending} className="w-full">
            {updatePassword.isPending ? "Alterando..." : "Alterar Senha"}
          </Button>
        </div>
      </Card>

      <Card className="p-5 shadow-soft">
        <h2 className="mb-2 font-semibold">Sessão</h2>
        <p className="mb-4 text-sm text-muted-foreground">Sair da conta neste dispositivo.</p>
        <Button variant="outline" onClick={logout}>Sair</Button>
      </Card>
    </div>
  );
}

function XIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  );
}

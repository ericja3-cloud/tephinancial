import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Mail, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/email-setup")({
  head: () => ({ meta: [{ title: "Conectar e-mail – Tephinancial" }] }),
  component: EmailSetupPage,
});

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{n}</div>
      <div className="flex-1 pb-4">
        <p className="font-semibold">{title}</p>
        <div className="mt-1 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

function EmailSetupPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const inbox = user ? `${user.id.slice(0, 12)}@inbox.friccaozero.app` : "carregando...";

  const copy = async () => {
    await navigator.clipboard.writeText(inbox);
    setCopied(true);
    toast.success("Endereço copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Conectar e-mail</h1>
        <p className="mt-1 text-sm text-muted-foreground">Encaminhe recibos automaticamente do Uber, iFood, Mercado Livre e muito mais.</p>
      </header>

      <Card className="p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Seu endereço exclusivo</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="rounded-lg bg-muted px-3 py-2 font-mono text-sm break-all">{inbox}</code>
              <Button size="sm" onClick={copy} variant="outline">
                {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Tudo que chegar aqui vira uma transação pendente de revisão no seu dashboard.</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 shadow-soft">
        <h2 className="mb-4 font-semibold">Como configurar o encaminhamento automático</h2>
        <Tabs defaultValue="gmail">
          <TabsList className="mb-4">
            <TabsTrigger value="gmail">Gmail</TabsTrigger>
            <TabsTrigger value="outlook">Outlook</TabsTrigger>
          </TabsList>
          <TabsContent value="gmail" className="space-y-1">
            <Step n={1} title="Abra as configurações do Gmail">
              Clique na engrenagem <Badge variant="secondary">⚙️</Badge> e depois em <b>"Ver todas as configurações"</b>.
            </Step>
            <Step n={2} title="Vá em 'Encaminhamento e POP/IMAP'">
              Clique em <b>"Adicionar um endereço de encaminhamento"</b> e cole seu endereço acima.
            </Step>
            <Step n={3} title="Confirme o e-mail">
              O Google enviará um código para <code className="rounded bg-muted px-1">{inbox}</code>. O código aparecerá aqui nesta tela em breve.
            </Step>
            <Step n={4} title="Crie um filtro automático">
              Volte para a aba <b>"Filtros e endereços bloqueados"</b> → <b>"Criar novo filtro"</b>.
              <div className="mt-2 space-y-1 rounded-lg border bg-muted/40 p-3 text-xs">
                <div><b>De:</b> <code>noreply@uber.com, receipts@ifood.com.br, orders@mercadolivre.com</code></div>
                <div className="text-muted-foreground">Adicione outros remetentes de recibos que você recebe.</div>
              </div>
            </Step>
            <Step n={5} title="Escolha a ação">
              Marque <b>"Encaminhar para"</b> e selecione seu endereço <code className="rounded bg-muted px-1">{inbox}</code>. Salve.
            </Step>
          </TabsContent>
          <TabsContent value="outlook" className="space-y-1">
            <Step n={1} title="Abra as configurações do Outlook">
              Engrenagem no canto superior direito → <b>"Ver todas as configurações do Outlook"</b>.
            </Step>
            <Step n={2} title="Vá em 'Correio' → 'Regras'">
              Clique em <b>"Adicionar nova regra"</b>.
            </Step>
            <Step n={3} title="Defina a condição">
              Nome: <code>Recibos Tephinancial</code>. Em <b>"Adicionar uma condição"</b> → <b>"De"</b> → adicione os remetentes de recibos (Uber, iFood, etc).
            </Step>
            <Step n={4} title="Escolha a ação">
              Em <b>"Adicionar uma ação"</b> → <b>"Redirecionar para"</b> → cole <code className="rounded bg-muted px-1">{inbox}</code>.
            </Step>
            <Step n={5} title="Salve a regra">
              Clique em <b>"Salvar"</b>. Novos recibos aparecerão no dashboard automaticamente.
            </Step>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="border-dashed p-5">
        <div className="flex items-start gap-3">
          <ArrowRight className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">O que acontece depois?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada recibo encaminhado é processado pela IA e aparece no dashboard como <b>pendente de revisão</b>. Você só precisa confirmar (ou editar) com um clique.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

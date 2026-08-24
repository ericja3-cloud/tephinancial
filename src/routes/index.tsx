import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Mail, Sparkles, Upload, Zap, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tephinancial – Finanças pessoais no automático" },
      { name: "description", content: "Tire foto do comprovante e pronto: a IA lê, categoriza e organiza suas despesas. Sem digitação manual." },
      { property: "og:title", content: "Tephinancial – Finanças pessoais no automático" },
      { property: "og:description", content: "Zero digitação. Foto, upload ou e-mail — a IA registra pra você." },
    ],
  }),
  component: Landing,
});

function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Tephinancial</span>
        </div>
        <Link to="/auth">
          <Button variant="ghost">Entrar</Button>
        </Link>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-soft">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Powered by IA
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Finanças pessoais sem <span className="bg-gradient-hero bg-clip-text text-transparent">digitar nada</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Tire foto do comprovante, envie um arquivo ou encaminhe seus recibos por e-mail. A IA lê, categoriza e registra tudo pra você.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary shadow-elevated">
                Começar grátis <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline">Como funciona</Button>
            </a>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-primary/10 to-transparent" />
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={Camera} title="Tire uma foto" desc="Fotografe a nota fiscal com o celular. A IA extrai valor, data e categoria." />
          <Feature icon={Upload} title="Arraste e solte" desc="Envie PDFs de fatura ou prints de comprovante e deixe a mágica acontecer." />
          <Feature icon={Mail} title="Encaminhe por e-mail" desc="Configure uma vez e todos os recibos do Uber, iFood e Mercado Livre entram sozinhos." />
          <Feature icon={Sparkles} title="Categorização automática" desc="Alimentação, transporte, lazer, saúde... a IA classifica pra você." />
          <Feature icon={Zap} title="Zero fricção" desc="Sem formulários intermináveis. Aprove com um clique e siga sua vida." />
          <Feature icon={ShieldCheck} title="Privado e seguro" desc="Seus comprovantes ficam só com você, protegidos por autenticação." />
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Tephinancial. Suas finanças no automático.
      </footer>
    </div>
  );
}

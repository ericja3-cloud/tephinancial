import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { BookOpen, Camera, Zap, ListChecks, HeartHandshake, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/manual")({
  component: ManualPage,
});

function ManualPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 md:p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Manual de Uso
        </h1>
        <p className="text-muted-foreground mt-2">
          Aprenda como tirar o máximo proveito da Tephinancial.
        </p>
      </header>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Camera className="h-5 w-5 text-primary" />
            1. Capturar Comprovante (IA)
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Em vez de digitar suas despesas manualmente, deixe a IA fazer o trabalho pesado:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Acesse a aba <strong>Capturar</strong> no menu inferior (ou na barra lateral).</li>
              <li>Clique em <strong>Tirar Foto</strong> se estiver no celular para abrir a câmera.</li>
              <li>Se preferir, você pode enviar o arquivo PDF do comprovante ou uma foto da galeria.</li>
              <li>A Inteligência Artificial vai ler a imagem e extrair os dados como Valor, Data, Estabelecimento e sugerir a Categoria correta!</li>
              <li>Revise as informações e clique em "Salvar transações".</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            2. Importar Extrato (Mensal)
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Se você tem muitas compras no mês, importe seu extrato inteiro de uma vez!
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vá em <strong>Importar Extrato</strong> no menu principal.</li>
              <li>Faça o upload do seu arquivo de extrato (aceitamos planilhas CSV ou prints do aplicativo).</li>
              <li>A IA irá automaticamente agrupar as compras por mês e adivinhar a categoria (Alimentação, Transporte, Saúde, etc).</li>
              <li><strong>Importante:</strong> Se já houver transações salvas, o sistema atualiza o status de pagamento ao invés de duplicá-las.</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            3. Fale com a Tef (Assistente Financeira)
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              O botão flutuante com o ícone do raio ⚡ abre o chat com a sua assistente.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Você pode mandar áudio ou texto.</li>
              <li>Peça coisas como: <em>"Gastei 50 reais de Uber hoje de manhã"</em>, e a Tef lançará a despesa para você.</li>
              <li>Ou pergunte coisas do tipo: <em>"Quanto eu gastei com Ifood esse mês?"</em> ou <em>"Resuma minhas finanças."</em> e ela fará a análise no banco de dados.</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <HeartHandshake className="h-5 w-5 text-primary" />
            4. Finanças do Casal
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Divida contas da casa ou marque despesas como "Compartilhadas".
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>A aba <strong>Casal</strong> mostra exatamente quanto você deve para o seu parceiro (ou quanto ele te deve).</li>
              <li>Quando uma despesa é lançada, você pode indicar se foi pra casa ("Compartilhada") ou Privada ("Pessoal").</li>
              <li>O saldo mostra a diferença ("Acerto") baseado em quem pagou cada conta.</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <ListChecks className="h-5 w-5 text-primary" />
            5. Transações
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Onde tudo fica registrado.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Lá você visualiza a lista completa, podendo filtrar por mês, categoria e verificar os status (Pago ou Pendente).</li>
              <li>É possível editar as transações clicando nos três pontinhos ou anexar o comprovante manualmente caso tenha esquecido.</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

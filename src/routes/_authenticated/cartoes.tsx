import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CalendarClock, Loader2, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { parseCsv, parsePdfOrImage } from "@/lib/statement-parser";
import { TxForm } from "@/routes/_authenticated/capture";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_authenticated/cartoes")({
  component: CartoesPage,
});

function CartoesPage() {
  const router = useRouter();
  const [parsedData, setParsedData] = useState<TxForm[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      if (file.name.endsWith(".csv")) {
        const data = await parseCsv(file);
        setParsedData(data);
        toast.success(`Fatura processada: ${data.length} despesas encontradas.`);
      } else if (file.name.endsWith(".pdf") || file.type.startsWith("image/")) {
        toast.info("Processamento de PDF será implementado em breve com IA.");
      } else {
        toast.error("Formato de arquivo não suportado.");
      }
    } catch (err: any) {
      toast.error(`Erro ao processar fatura: ${err.message}`);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Não autenticado");
      
      const allInserts: any[] = [];
      parsedData.forEach(f => {
        const amount = parseFloat(f.amount.replace(',', '.')); // ensure correct parse
        const insert = {
          user_id: uid,
          type: f.type,
          payment_method: f.payment_method,
          target_source: f.target_source,
          doc_type: f.doc_type,
          classification: f.classification,
          cardholder: f.cardholder,
          amount: isNaN(amount) ? 0 : amount,
          description: f.description || f.establishment || "Fatura Cartão",
          establishment: f.establishment || null,
          category: f.category,
          date: f.date,
          source: "upload_fatura",
          status: f.status,
          sharing_type: f.sharing_type,
        };
        allInserts.push(insert);
      });

      if (allInserts.length > 0) {
        const { error } = await supabase.from("transactions").insert(allInserts);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Fatura salva com sucesso!");
      setParsedData([]);
      router.navigate({ to: "/transactions" });
    },
    onError: (e: any) => toast.error(`Erro ao salvar: ${e.message}`),
  });

  const { data: forecastData, isLoading: isLoadingForecast } = useQuery({
    queryKey: ["forecast-cartoes"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];
      
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch future expenses
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, date")
        .eq("user_id", userData.user.id)
        .eq("type", "expense")
        .gte("date", today);
        
      if (error) throw error;
      
      // Group by month
      const months: Record<string, number> = {};
      data?.forEach(tx => {
        const dateObj = new Date(tx.date);
        const monthYear = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        months[monthYear] = (months[monthYear] || 0) + Number(tx.amount);
      });
      
      // Convert to array and sort
      return Object.entries(months)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => {
          // Simple sort based on raw parsing (may need better logic for production)
          return 0; // Keeping simple for now, as DB query might not be strictly ordered by month
        })
        .slice(0, 6); // next 6 months
    }
  });

  const chartConfig = {
    total: {
      label: "Faturas Futuras",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Cartões de Crédito</h1>
        <p className="text-muted-foreground">
          Importe as faturas do seu cartão para analisar e projetar gastos futuros.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" /> Importar Fatura
            </CardTitle>
            <CardDescription>
              Faça upload do PDF da fatura ou exportação CSV do seu banco.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <input
                type="file"
                id="fatura-upload"
                className="hidden"
                accept=".csv,.pdf,image/*"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
              <label 
                htmlFor="fatura-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 border-muted-foreground/25 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-8 h-8 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Clique para enviar</span> ou arraste o arquivo
                  </p>
                  <p className="text-xs text-muted-foreground">CSV, PDF ou Imagem</p>
                </div>
              </label>
            </div>
            {isProcessing && <p className="text-sm text-blue-500 animate-pulse">Processando arquivo...</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" /> Previsão de Faturas
            </CardTitle>
            <CardDescription>
              Resumo das contas a pagar nos próximos meses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingForecast ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : forecastData && forecastData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-32 w-full">
                <BarChart data={forecastData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                Nenhuma fatura futura encontrada.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revisão de Despesas ({parsedData.length})</CardTitle>
            <CardDescription>
              Verifique as categorias antes de salvar na base de dados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
              {parsedData.map((tx, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-3 rounded-md border bg-card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm block truncate">{tx.description || tx.establishment}</span>
                      <span className="text-xs text-muted-foreground">{tx.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold text-sm ${tx.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                        R$ {Number(tx.amount).toFixed(2).replace('.', ',')}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setParsedData(d => d.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <select 
                      className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs flex-1"
                      value={tx.category}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setParsedData(d => d.map((x, i) => i === idx ? { ...x, category: val } : x));
                      }}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="Outros">Outros</option>
                    </select>
                    
                    <select 
                      className="h-8 w-24 rounded-md border border-input bg-background px-2 py-1 text-xs"
                      value={tx.classification}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setParsedData(d => d.map((x, i) => i === idx ? { ...x, classification: val } : x));
                      }}
                    >
                      <option value="PF">PF</option>
                      <option value="PJ">PJ</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6 gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setParsedData([])}>
                Cancelar
              </Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending || parsedData.length === 0}>
                {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar {parsedData.length} transações
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

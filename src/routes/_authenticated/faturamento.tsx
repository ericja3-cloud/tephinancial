import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, Building2, Plus, Calculator, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/faturamento")({
  component: FaturamentoPage,
});

type Workplace = { id: string; name: string; hourly_rate: number; tax_rate: number };
type Shift = { id: string; workplace_id: string; date: string; hours: number };

function FaturamentoPage() {
  const queryClient = useQueryClient();
  
  // Queries
  const { data: workplaces = [], isLoading: loadingWp } = useQuery({
    queryKey: ["workplaces"],
    queryFn: async () => {
      const { data, error } = await supabase.from("workplaces").select("*");
      if (error) throw error;
      return data as Workplace[];
    }
  });

  const { data: shifts = [], isLoading: loadingShifts } = useQuery({
    queryKey: ["shifts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shifts").select("*");
      if (error) throw error;
      return data as Shift[];
    }
  });

  // States para novos cadastros
  const [newWpName, setNewWpName] = useState("");
  const [newWpRate, setNewWpRate] = useState("");
  const [newWpTax, setNewWpTax] = useState("");
  
  const [newShiftWp, setNewShiftWp] = useState("");
  const [newShiftDate, setNewShiftDate] = useState("");
  const [newShiftHours, setNewShiftHours] = useState("");

  const addWorkplace = useMutation({
    mutationFn: async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("Usuário não autenticado");
      
      const { error } = await supabase.from("workplaces").insert({
        user_id: authData.user.id,
        name: newWpName,
        hourly_rate: Number(newWpRate),
        tax_rate: Number(newWpTax) || 0
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Local de trabalho adicionado!");
      setNewWpName(""); setNewWpRate(""); setNewWpTax("");
      queryClient.invalidateQueries({ queryKey: ["workplaces"] });
    },
    onError: (e: any) => toast.error(e.message)
  });

  const addShift = useMutation({
    mutationFn: async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("shifts").insert({
        user_id: authData.user.id,
        workplace_id: newShiftWp,
        date: newShiftDate,
        hours: Number(newShiftHours)
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Plantão/Horas registradas!");
      setNewShiftHours(""); // keep date and wp for easy multiple entry
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (e: any) => toast.error(e.message)
  });

  const handleAddWorkplace = () => {
    if (!newWpName || !newWpRate) return;
    addWorkplace.mutate();
  };

  const handleAddShift = () => {
    if (!newShiftWp || !newShiftDate || !newShiftHours) return;
    addShift.mutate();
  };

  // Calcula previsão
  const calculateForecast = () => {
    let totalBruto = 0;
    let totalLiquido = 0;

    const breakdown = workplaces.map(wp => {
      const wpShifts = shifts.filter(s => s.workplace_id === wp.id);
      const totalHours = wpShifts.reduce((acc, s) => acc + Number(s.hours), 0);
      const bruto = totalHours * Number(wp.hourly_rate);
      const impostos = bruto * (Number(wp.tax_rate) / 100);
      const liquido = bruto - impostos;
      
      totalBruto += bruto;
      totalLiquido += liquido;
      
      return { ...wp, totalHours, bruto, impostos, liquido };
    });

    return { totalBruto, totalLiquido, breakdown: breakdown.filter(b => b.totalHours > 0) };
  };

  const forecast = calculateForecast();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Faturamento</h1>
        <p className="text-muted-foreground">
          Preveja seus recebimentos cadastrando seus locais de trabalho e horas trabalhadas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card de Configuração de Locais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Locais de Trabalho
            </CardTitle>
            <CardDescription>Cadastre o valor da sua hora e a alíquota de imposto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Nome do Local</Label>
                <Input placeholder="Ex: Hospital X" value={newWpName} onChange={e => setNewWpName(e.target.value)} disabled={addWorkplace.isPending} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Valor Hora Líquido (R$)</Label>
                <Input type="number" placeholder="0.00" value={newWpRate} onChange={e => setNewWpRate(e.target.value)} disabled={addWorkplace.isPending} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Imposto (%)</Label>
                <Input type="number" placeholder="Ex: 6" value={newWpTax} onChange={e => setNewWpTax(e.target.value)} disabled={addWorkplace.isPending} />
              </div>
            </div>
            <Button className="w-full" variant="secondary" onClick={handleAddWorkplace} disabled={!newWpName || !newWpRate || addWorkplace.isPending}>
              {addWorkplace.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />} 
              Adicionar Local
            </Button>

            {loadingWp ? (
              <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : workplaces.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold">Locais Cadastrados</h4>
                {workplaces.map(wp => (
                  <div key={wp.id} className="flex justify-between items-center bg-muted/50 p-2 rounded-md text-sm border">
                    <span className="font-medium">{wp.name}</span>
                    <span className="text-muted-foreground">R$ {Number(wp.hourly_rate).toFixed(2)}/h ({wp.tax_rate}% imp)</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Registro de Horas/Plantões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Registrar Plantão
            </CardTitle>
            <CardDescription>Anote as horas trabalhadas em cada local.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <div className="space-y-1 min-w-0">
                <Label className="text-xs">Local</Label>
                <select 
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={newShiftWp}
                  onChange={e => setNewShiftWp(e.target.value)}
                  disabled={addShift.isPending}
                >
                  <option value="">Selecione...</option>
                  {workplaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data</Label>
                <Input type="date" value={newShiftDate} onChange={e => setNewShiftDate(e.target.value)} className="w-[130px]" disabled={addShift.isPending} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Horas</Label>
                <Input type="number" placeholder="Ex: 12" value={newShiftHours} onChange={e => setNewShiftHours(e.target.value)} className="w-[80px]" disabled={addShift.isPending} />
              </div>
            </div>
            <Button className="w-full" onClick={handleAddShift} disabled={!newShiftWp || !newShiftDate || !newShiftHours || addShift.isPending}>
              {addShift.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar"}
            </Button>
            
            {loadingShifts ? (
              <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : shifts.length > 0 && (
               <div className="mt-4 max-h-32 overflow-y-auto space-y-1 pr-2">
                 {shifts.map(s => {
                   const wp = workplaces.find(w => w.id === s.workplace_id);
                   const dateStr = new Date(s.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                   return (
                    <div key={s.id} className="flex justify-between items-center bg-muted/20 p-2 rounded-md text-xs border">
                      <span>{wp?.name} ({dateStr})</span>
                      <span className="font-semibold">{s.hours} horas</span>
                    </div>
                   )
                 })}
               </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card de Previsão e Link com Extrato */}
      <Card className="border-primary/50 shadow-md">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calculator className="h-5 w-5" /> Previsão de Recebimento
          </CardTitle>
          <CardDescription>Veja o valor projetado baseado nos plantões realizados.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              {forecast.breakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum plantão registrado ainda.</p>
              ) : (
                forecast.breakdown.map(wp => (
                  <div key={wp.id} className="flex flex-col gap-1 pb-3 border-b last:border-0">
                    <div className="flex justify-between font-medium">
                      <span>{wp.name} <span className="text-muted-foreground font-normal text-sm">({wp.totalHours} horas)</span></span>
                      <span className="text-green-600">R$ {wp.liquido.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Bruto: R$ {wp.bruto.toFixed(2)}</span>
                      <span>Impostos ({wp.tax_rate}%): R$ {wp.impostos.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col items-end justify-center min-w-[200px] gap-2 p-4 bg-muted/30 rounded-xl border">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Previsto Líquido</span>
              <span className="text-4xl font-bold text-primary">
                R$ {forecast.totalLiquido.toFixed(2)}
              </span>
              
              <Button className="mt-4 w-full bg-green-600 hover:bg-green-700" onClick={() => toast.info("Em breve: Você poderá vincular este valor com os depósitos do seu extrato bancário.")}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Link c/ Extrato (Dar OK)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

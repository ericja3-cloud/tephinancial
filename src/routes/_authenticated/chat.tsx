import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { askPocketManager } from "@/lib/chat.functions";
import { brl } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "Gerente de Bolso – Tephinancial" }] }),
  component: ChatPage,
});

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
};

function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "bot", content: "Olá! Eu sou a TEF. Como posso te ajudar com suas finanças hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const { data: txs = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("*").order("date", { ascending: false }).limit(100);
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

  const ask = useServerFn(askPocketManager);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      let contextStr = `Usuário: ${profile?.full_name || "Não informado"}\n`;
      contextStr += `Meta de gastos mensal: ${profile?.monthly_budget ? brl(profile.monthly_budget) : "Não definida"}\n\n`;
      
      const now = new Date();
      const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const monthTxs = txs.filter(t => t.date.startsWith(thisMonth));
      const incomes = monthTxs.filter(t => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0);
      const expenses = monthTxs.filter(t => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0);
      
      contextStr += `Resumo deste mês (${thisMonth}):\n- Entradas: ${brl(incomes)}\n- Saídas: ${brl(expenses)}\n- Saldo: ${brl(incomes - expenses)}\n\n`;
      
      contextStr += `Últimas transações cadastradas:\n`;
      txs.slice(0, 15).forEach(t => {
        contextStr += `- ${t.date} | ${t.type === "income" ? "Entrada" : "Saída"} | ${t.category} | ${t.establishment || t.description} | ${brl(Number(t.amount))}\n`;
      });

      const response = await ask({ data: { prompt: userMsg.content, context: contextStr } });
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "bot", content: response.text }]);
    } catch (error: any) {
      toast.error(error.message || "Falha ao processar a resposta");
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "bot", content: "Desculpe, ocorreu um erro ao analisar sua conta." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gerente de Bolso</h1>
            <p className="text-sm text-muted-foreground">Seu assistente de inteligência artificial.</p>
          </div>
        </div>
      </header>

      <Card className="flex flex-1 flex-col overflow-hidden border shadow-soft">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                </div>
                <div className={`rounded-2xl px-4 py-2 text-sm max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 border"}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-2xl px-4 py-2 text-sm max-w-[80%] bg-muted/50 border flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-3 bg-muted/20">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <Input 
              placeholder="Pergunte sobre seus gastos, peça dicas..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-full bg-background"
              disabled={isTyping}
            />
            <Button size="icon" type="submit" disabled={isTyping || !input.trim()} className="rounded-full shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

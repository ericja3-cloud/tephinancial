import { createFileRoute, Outlet, redirect, Link, useRouter, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Camera, ListChecks, Mail, Settings as SettingsIcon, LogOut, Zap, Menu, HeartHandshake, Calendar, BookOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/NotificationBell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agenda", label: "Agenda de Contas", icon: Calendar },
  { to: "/statement-upload", label: "Importar Extrato", icon: Zap },
  { to: "/couple", label: "Finanças Casal", icon: HeartHandshake },
  { to: "/capture", label: "Capturar", icon: Camera },
  { to: "/transactions", label: "Transações", icon: ListChecks },
  { to: "/manual", label: "Manual de Uso", icon: BookOpen },
  { to: "/email-setup", label: "Conectar e-mail", icon: Mail },
  { to: "/settings", label: "Configurações", icon: SettingsIcon },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex h-full flex-col gap-1">
      <div className="mb-3 flex items-center gap-2 px-2 py-2">
        <img src="/logo.png" alt="Tephinancial Logo" className="h-10 w-10 rounded-xl shadow-sm object-contain" />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold">Tephinancial</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">finanças automáticas</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <Button variant="ghost" onClick={handleLogout} className="justify-start gap-2">
        <LogOut className="h-4 w-4" /> Sair
      </Button>
    </div>
  );
}

function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-sidebar p-4 md:flex md:flex-col">
        <div className="absolute top-4 right-4 z-50">
          <NotificationBell />
        </div>
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Tephinancial Logo" className="h-8 w-8 rounded-lg object-contain shadow-sm" />
          <span className="font-semibold">Tephinancial</span>
        </Link>
        <NotificationBell />
      </header>

      <main className="md:pl-64 pb-20 md:pb-10">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t bg-background/80 backdrop-blur pb-safe px-2 py-2 md:hidden">
        <Link to="/dashboard" className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary [&.active]:text-primary">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/couple" className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary [&.active]:text-primary">
          <HeartHandshake className="h-5 w-5" />
          <span className="text-[10px] font-medium">Casal</span>
        </Link>
        <Link to="/capture" className="flex flex-col items-center justify-center -mt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Camera className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-medium mt-1 text-primary">Capturar</span>
        </Link>
        <Link to="/transactions" className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary [&.active]:text-primary">
          <ListChecks className="h-5 w-5" />
          <span className="text-[10px] font-medium">Transações</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary [&.active]:text-primary">
          <SettingsIcon className="h-5 w-5" />
          <span className="text-[10px] font-medium">Ajustes</span>
        </Link>
      </nav>

      <Link 
        to="/chat" 
        className="fixed bottom-20 right-4 z-50 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
      >
        <Zap className="h-5 w-5 fill-current" />
        <span className="font-semibold text-sm">Fale com a Tef</span>
      </Link>
    </div>
  );
}

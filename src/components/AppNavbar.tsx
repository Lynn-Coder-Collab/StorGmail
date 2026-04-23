import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Wallet, History, User, LogOut, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { getUserRole } from "@/lib/deposit.functions";

const navItems = [
  { label: "Dashboard", to: "/dashboard" as const, icon: LayoutDashboard },
  { label: "Saldo", to: "/saldo" as const, icon: Wallet },
  { label: "Riwayat", to: "/riwayat" as const, icon: History },
  { label: "Profile", to: "/profile" as const, icon: User },
];

export function AppNavbar() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!session) return;
    getUserRole({ headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((res) => setIsAdmin(res.role === "admin"))
      .catch(() => {});
  }, [session]);

  const allItems = isAdmin
    ? [...navItems, { label: "Admin", to: "/admin" as const, icon: Shield }]
    : navItems;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {allItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
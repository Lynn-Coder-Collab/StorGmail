import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BulkInputForm } from "@/components/BulkInputForm";
import { PricingCalculator } from "@/components/PricingCalculator";
import { DepositTable } from "@/components/DepositTable";
import { formatRupiah } from "@/lib/eternix";
import { useAuth } from "@/hooks/use-auth";
import { getUserDeposits, getUserProfile } from "@/lib/deposit.functions";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard - Eternix System" },
      { name: "description", content: "Setor akun Gmail dan lihat riwayat setoran Anda" },
    ],
  }),
});

function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [deposits, setDeposits] = useState<Tables<"deposits">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !session) {
      navigate({ to: "/auth" });
      return;
    }
    async function fetchData() {
      try {
        const headers = { Authorization: `Bearer ${session!.access_token}` };
        const [profileRes, depositsRes] = await Promise.all([
          getUserProfile({ headers }),
          getUserDeposits({ headers }),
        ]);
        setProfile(profileRes.profile);
        setDeposits(depositsRes.deposits);
      } catch (e) {
        console.error("Failed to fetch data", e);
      }
      setLoading(false);
    }
    fetchData();
  }, [user, session, authLoading, refreshKey, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const balance = profile?.balance ?? 0;
  const email = user.email ?? "";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">Eternix</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p className="text-sm font-bold text-primary">{formatRupiah(balance)}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">
                {email.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Kelola setoran akun Gmail Anda</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">Total Setoran</p>
            <p className="text-2xl font-bold text-foreground mt-1">{deposits.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">Saldo Aktif</p>
            <p className="text-2xl font-bold text-primary mt-1">{formatRupiah(balance)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning mt-1">
              {deposits.filter((d) => d.status === "pending").length}
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <BulkInputForm onSubmit={() => setRefreshKey((k) => k + 1)} />
          </div>
          <div className="lg:col-span-2">
            <PricingCalculator />
          </div>
        </div>

        {/* Deposit history */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Riwayat Setoran</h2>
          <DepositTable deposits={deposits.map((d) => ({
            id: d.id,
            customId: d.custom_id,
            userId: d.user_id,
            userEmail: email,
            accountData: (d.account_data as any[]) ?? [],
            totalPrice: d.total_price,
            status: d.status as any,
            timestamp: new Date(d.created_at).getTime(),
          }))} />
        </div>
      </main>
    </div>
  );
}
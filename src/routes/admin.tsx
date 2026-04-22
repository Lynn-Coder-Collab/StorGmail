import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DepositTable } from "@/components/DepositTable";
import { formatRupiah } from "@/lib/eternix";
import { useAuth } from "@/hooks/use-auth";
import { getAllDeposits, approveDepositFn, rejectDepositFn, getUserRole } from "@/lib/deposit.functions";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Panel - Eternix System" },
      { name: "description", content: "Kelola setoran dan approve akun" },
    ],
  }),
});

function AdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<Tables<"deposits">[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !session) {
      navigate({ to: "/auth" });
      return;
    }
    async function fetchData() {
      try {
        const headers = { Authorization: `Bearer ${session!.access_token}` };
        const [roleRes, depositsRes] = await Promise.all([
          getUserRole({ headers }),
          getAllDeposits({ headers }),
        ]);
        setIsAdmin(roleRes.role === "admin");
        setDeposits(depositsRes.deposits);
      } catch (e) {
        console.error("Admin fetch error", e);
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-foreground">Akses Ditolak</p>
          <p className="text-muted-foreground">Anda tidak memiliki akses admin.</p>
          <Link to="/dashboard" className="text-primary hover:underline text-sm">
            Ke Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  const pending = deposits.filter((d) => d.status === "pending");
  const totalRevenue = deposits
    .filter((d) => d.status === "valid")
    .reduce((sum, d) => sum + d.total_price, 0);

  async function handleApprove(id: string) {
    try {
      await approveDepositFn({
        data: { depositId: id },
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      alert(e.message || "Gagal approve");
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectDepositFn({
        data: { depositId: id },
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      alert(e.message || "Gagal reject");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">Eternix</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-accent/15 border border-accent/30 px-3 py-1 text-xs font-medium text-accent">
              Admin Mode
            </span>
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
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Kelola dan approve setoran akun</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">Total Setoran</p>
            <p className="text-2xl font-bold text-foreground mt-1">{deposits.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning mt-1">{pending.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-success mt-1">
              {deposits.filter((d) => d.status === "valid").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-primary mt-1">{formatRupiah(totalRevenue)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Semua Setoran</h2>
          <DepositTable
            deposits={deposits.map((d) => ({
              id: d.id,
              customId: d.custom_id,
              userId: d.user_id,
              userEmail: d.user_id,
              accountData: (d.account_data as any[]) ?? [],
              totalPrice: d.total_price,
              status: d.status as any,
              timestamp: new Date(d.created_at).getTime(),
            }))}
            showActions
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </main>
    </div>
  );
}
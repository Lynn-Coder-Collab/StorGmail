import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppNavbar } from "@/components/AppNavbar";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/use-auth";
import { getUserDeposits } from "@/lib/deposit.functions";
import { DepositTable } from "@/components/DepositTable";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/riwayat")({
  component: RiwayatPage,
  head: () => ({
    meta: [
      { title: "Riwayat - Eternix System" },
      { name: "description", content: "Riwayat setoran akun Anda" },
    ],
  }),
});

function RiwayatPage() {
  return (
    <AuthGuard>
      <RiwayatContent />
    </AuthGuard>
  );
}

function RiwayatContent() {
  const { user, session } = useAuth();
  const [deposits, setDeposits] = useState<Tables<"deposits">[]>([]);

  useEffect(() => {
    if (!session) return;
    getUserDeposits({ headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((res) => setDeposits(res.deposits))
      .catch(console.error);
  }, [session]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Riwayat Setoran</h1>
          <p className="text-muted-foreground mt-1">Semua riwayat setoran akun Gmail Anda</p>
        </div>
        <DepositTable deposits={deposits.map((d) => ({
          id: d.id,
          customId: d.custom_id,
          userId: d.user_id,
          userEmail: user?.email ?? "",
          accountData: (d.account_data as any[]) ?? [],
          totalPrice: d.total_price,
          status: d.status as any,
          timestamp: new Date(d.created_at).getTime(),
        }))} />
      </main>
    </div>
  );
}
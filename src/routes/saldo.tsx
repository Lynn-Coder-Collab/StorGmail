import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppNavbar } from "@/components/AppNavbar";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile } from "@/lib/deposit.functions";
import { formatRupiah } from "@/lib/eternix";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/saldo")({
  component: SaldoPage,
  head: () => ({
    meta: [
      { title: "Saldo - Eternix System" },
      { name: "description", content: "Lihat saldo akun Anda" },
    ],
  }),
});

function SaldoPage() {
  return (
    <AuthGuard>
      <SaldoContent />
    </AuthGuard>
  );
}

function SaldoContent() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);

  useEffect(() => {
    if (!session) return;
    getUserProfile({ headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((res) => setProfile(res.profile))
      .catch(console.error);
  }, [session]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saldo</h1>
          <p className="text-muted-foreground mt-1">Informasi saldo akun Anda</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Saldo Aktif</p>
          <p className="text-4xl font-bold text-primary mt-2">{formatRupiah(profile?.balance ?? 0)}</p>
          <p className="text-xs text-muted-foreground mt-4">
            Saldo bertambah otomatis saat setoran Anda diapprove oleh admin.
          </p>
        </div>
      </main>
    </div>
  );
}
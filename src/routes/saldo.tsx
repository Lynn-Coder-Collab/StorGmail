import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppNavbar } from "@/components/AppNavbar";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, createWithdrawal, getUserWithdrawals } from "@/lib/deposit.functions";
import { formatRupiah } from "@/lib/eternix";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [withdrawals, setWithdrawals] = useState<Tables<"withdrawals">[]>([]);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!session) return;
    const headers = { Authorization: `Bearer ${session.access_token}` };
    Promise.all([
      getUserProfile({ headers }),
      getUserWithdrawals({ headers }),
    ]).then(([profileRes, wdRes]) => {
      setProfile(profileRes.profile);
      setWithdrawals(wdRes.withdrawals);
    }).catch(console.error);
  }, [session, refreshKey]);

  async function handleWithdraw() {
    const amt = parseInt(amount);
    if (isNaN(amt) || amt < 50000) {
      setError("Minimal penarikan Rp50.000");
      return;
    }
    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
      setError("Lengkapi semua field");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createWithdrawal({
        data: { amount: amt, bankName: bankName.trim(), accountNumber: accountNumber.trim(), accountHolder: accountHolder.trim() },
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      setSuccess(true);
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountHolder("");
      setRefreshKey(k => k + 1);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Gagal membuat penarikan");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8 pb-24 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saldo</h1>
          <p className="text-muted-foreground mt-1">Informasi saldo akun Anda</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Saldo Aktif</p>
          <p className="text-4xl font-bold text-primary mt-2">{formatRupiah(profile?.balance ?? 0)}</p>
        </div>

        {/* Withdrawal form */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Tarik Uang</h2>
          <p className="text-sm text-muted-foreground">Minimal penarikan Rp50.000</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Jumlah (Rp)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            <Input placeholder="Nama Bank" value={bankName} onChange={e => setBankName(e.target.value)} />
            <Input placeholder="Nomor Rekening" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
            <Input placeholder="Atas Nama" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>
          )}

          <Button onClick={handleWithdraw} disabled={submitting} className="w-full">
            {submitting ? "Memproses..." : success ? "✓ Permintaan Terkirim!" : "Ajukan Penarikan"}
          </Button>
        </div>

        {/* Withdrawal history */}
        {withdrawals.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Riwayat Penarikan</h2>
            <div className="divide-y divide-border">
              {withdrawals.map(w => (
                <div key={w.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatRupiah(w.amount)}</p>
                    <p className="text-xs text-muted-foreground">{w.bank_name} - {w.account_number}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    w.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    w.status === "approved" ? "bg-green-100 text-green-700" :
                    "bg-red-100 text-red-700"
                  }`}>{w.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
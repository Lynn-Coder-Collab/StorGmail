import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { BulkInputForm } from "@/components/BulkInputForm";
import { PricingCalculator } from "@/components/PricingCalculator";
import { DepositTable } from "@/components/DepositTable";
import { getDeposits, getCurrentUser } from "@/lib/store";
import { formatRupiah } from "@/lib/eternix";

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
  const user = getCurrentUser();
  const deposits = getDeposits().filter((d) => d.userId === user.uid);

  return (
    <div className="min-h-screen bg-background" key={refreshKey}>
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
              <p className="text-sm font-bold text-primary">{formatRupiah(user.balance)}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
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
            <p className="text-2xl font-bold text-primary mt-1">{formatRupiah(user.balance)}</p>
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
          <DepositTable deposits={deposits} />
        </div>
      </main>
    </div>
  );
}
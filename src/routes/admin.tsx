import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { DepositTable } from "@/components/DepositTable";
import { getDeposits, approveDeposit, rejectDeposit } from "@/lib/store";
import { formatRupiah } from "@/lib/eternix";

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
  const deposits = getDeposits();
  const pending = deposits.filter((d) => d.status === "pending");
  const totalRevenue = deposits
    .filter((d) => d.status === "valid")
    .reduce((sum, d) => sum + d.totalPrice, 0);

  function handleApprove(id: string) {
    approveDeposit(id);
    setRefreshKey((k) => k + 1);
  }

  function handleReject(id: string) {
    rejectDeposit(id);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-background" key={refreshKey}>
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">Eternix</span>
          </Link>
          <span className="inline-flex items-center rounded-full bg-accent/15 border border-accent/30 px-3 py-1 text-xs font-medium text-accent">
            Admin Mode
          </span>
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
            deposits={deposits}
            showActions
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </main>
    </div>
  );
}
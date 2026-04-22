import { useState } from "react";
import { PRICING_TIERS, getPricePerAccount, calculateTotalPrice, formatRupiah } from "@/lib/eternix";

export function PricingCalculator() {
  const [count, setCount] = useState(1);
  const pricePerAccount = getPricePerAccount(count);
  const total = calculateTotalPrice(count);

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Estimasi Pendapatan</h3>
        <p className="text-sm text-muted-foreground mt-1">Hitung estimasi berdasarkan jumlah akun</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Jumlah Akun</label>
        <input
          type="number"
          min={1}
          max={9999}
          value={count}
          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground text-lg font-mono focus:outline-none focus:ring-2 focus:ring-ring transition"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {PRICING_TIERS.map((tier) => {
          const isActive = count >= tier.min && (tier.max === null || count <= tier.max);
          return (
            <div
              key={tier.label}
              className={`rounded-lg p-3 text-center transition-all ${
                isActive
                  ? "bg-primary/15 border border-primary/40 ring-1 ring-primary/20"
                  : "bg-secondary border border-border"
              }`}
            >
              <p className="text-xs text-muted-foreground">{tier.label}</p>
              <p className={`text-sm font-bold mt-1 ${isActive ? "text-primary" : "text-foreground"}`}>
                {formatRupiah(tier.pricePerAccount)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Harga per akun</p>
          <p className="text-lg font-semibold text-primary">{formatRupiah(pricePerAccount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total Estimasi</p>
          <p className="text-2xl font-bold text-primary">{formatRupiah(total)}</p>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { parseAccountData, calculateTotalPrice, formatRupiah, generateCustomId } from "@/lib/eternix";
import { createDeposit, getNextSequence } from "@/lib/deposit.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface BulkInputFormProps {
  onSubmit?: () => void;
}

export function BulkInputForm({ onSubmit }: BulkInputFormProps) {
  const [raw, setRaw] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const result = parseAccountData(raw);
  const count = result.valid.length;
  const total = calculateTotalPrice(count);

  async function handleSubmit() {
    if (count === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error("Not authenticated");

      const { sequence } = await getNextSequence({
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const customId = generateCustomId(sequence);

      await createDeposit({
        data: { customId, accountData: result.valid, totalPrice: total },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      setSubmitted(true);
      setRaw("");
      onSubmit?.();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      setError(err.message || "Gagal mengirim setoran");
    }
    setSubmitting(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Setor Akun Gmail</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Format: <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">email|password|recovery</code> (satu per baris)
        </p>
      </div>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={"contoh@gmail.com|password123|081234567890\nlainnya@gmail.com|pass456|recovery@email.com"}
        rows={8}
        className="w-full rounded-lg border border-border bg-input px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring resize-none transition"
      />

      {raw.trim() && (
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">{count} valid</span>
          </span>
          {result.invalid.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">{result.invalid.length} invalid</span>
            </span>
          )}
          {count > 0 && (
            <span className="ml-auto font-semibold text-primary">
              Estimasi: {formatRupiah(total)}
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={count === 0 || submitting} className="w-full">
        {submitting ? "Mengirim..." : submitted ? "✓ Berhasil Dikirim!" : `Kirim Setoran (${count} akun)`}
      </Button>
    </div>
  );
}
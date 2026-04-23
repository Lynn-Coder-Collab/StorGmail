import { useState, useCallback } from "react";
import { calculateTotalPrice, formatRupiah, generateCustomId } from "@/lib/eternix";
import { createDeposit, getNextSequence } from "@/lib/deposit.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface BulkInputFormProps {
  onSubmit?: () => void;
}

interface AccountEntry {
  email: string;
  password: string;
  recovery: string;
}

export function BulkInputForm({ onSubmit }: BulkInputFormProps) {
  const [entries, setEntries] = useState<AccountEntry[]>([{ email: "", password: "", recovery: "" }]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validEntries = entries.filter(e => e.email.trim() && e.password.trim() && e.recovery.trim());
  const count = validEntries.length;
  const total = calculateTotalPrice(count);

  const updateEntry = useCallback((index: number, field: keyof AccountEntry, value: string) => {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  }, []);

  const addEntry = useCallback(() => {
    setEntries(prev => [...prev, { email: "", password: "", recovery: "" }]);
  }, []);

  const removeEntry = useCallback((index: number) => {
    setEntries(prev => prev.length <= 1 ? prev : prev.filter((_, i) => i !== index));
  }, []);

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

      const accountData = validEntries.map(e => ({
        email: e.email.trim(),
        password: e.password.trim(),
        recovery: e.recovery.trim(),
      }));

      await createDeposit({
        data: { customId, accountData, totalPrice: total },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      setSubmitted(true);
      setEntries([{ email: "", password: "", recovery: "" }]);
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
        <p className="text-sm text-muted-foreground mt-1">Isi data akun Gmail di bawah ini</p>
      </div>

      <div className="space-y-3">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <Input
                placeholder="Gmail"
                value={entry.email}
                onChange={(e) => updateEntry(i, "email", e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Password"
                value={entry.password}
                onChange={(e) => updateEntry(i, "password", e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Recovery"
                value={entry.recovery}
                onChange={(e) => updateEntry(i, "recovery", e.target.value)}
                className="text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => removeEntry(i)}
              className="mt-2 text-muted-foreground hover:text-destructive transition-colors"
              disabled={entries.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
      >
        <Plus className="h-4 w-4" /> Tambah Akun
      </button>

      {count > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{count} akun valid</span>
          <span className="font-semibold text-primary">Estimasi: {formatRupiah(total)}</span>
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
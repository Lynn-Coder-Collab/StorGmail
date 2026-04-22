import { formatRupiah, type Deposit, type DepositStatus } from "@/lib/eternix";

interface DepositTableProps {
  deposits: Deposit[];
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const statusConfig: Record<DepositStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/15 text-warning" },
  valid: { label: "Valid", className: "bg-success/15 text-success" },
  invalid: { label: "Invalid", className: "bg-destructive/15 text-destructive" },
};

export function DepositTable({ deposits, showActions, onApprove, onReject }: DepositTableProps) {
  if (deposits.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">Belum ada setoran</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Akun</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Waktu</th>
              {showActions && <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {deposits.map((dep) => {
              const status = statusConfig[dep.status];
              return (
                <tr key={dep.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{dep.customId}</td>
                  <td className="px-4 py-3 text-foreground">{dep.userEmail}</td>
                  <td className="px-4 py-3 text-center text-foreground">{dep.accountData.length}</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">{formatRupiah(dep.totalPrice)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                    {new Date(dep.timestamp).toLocaleDateString("id-ID")} {new Date(dep.timestamp).toLocaleTimeString("id-ID", { timeZone: "UTC" })}
                  </td>
                  {showActions && (
                    <td className="px-4 py-3 text-center">
                      {dep.status === "pending" ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => onApprove?.(dep.id)}
                            className="rounded-md bg-success/15 px-3 py-1 text-xs font-medium text-success hover:bg-success/25 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onReject?.(dep.id)}
                            className="rounded-md bg-destructive/15 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/25 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
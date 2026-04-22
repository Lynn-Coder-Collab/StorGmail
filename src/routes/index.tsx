import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">Eternix</span>
          </div>
          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary font-medium">
              ⚡ Eternix System v1.0
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight">
              Setoran Akun &<br />
              <span className="text-primary">SMM Panel</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Platform terpercaya untuk pengepul akun Gmail dan jasa suntik sosial media.
              Cepat, aman, dan transparan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Mulai Setor Akun →
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-base font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              Admin Panel
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
            <div>
              <p className="text-2xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Akun Diproses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">99%</p>
              <p className="text-sm text-muted-foreground">Valid Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">24/7</p>
              <p className="text-sm text-muted-foreground">Sistem Aktif</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

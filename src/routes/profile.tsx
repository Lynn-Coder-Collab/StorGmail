import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppNavbar } from "@/components/AppNavbar";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, getUserRole } from "@/lib/deposit.functions";
import { formatRupiah } from "@/lib/eternix";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile - Eternix System" },
      { name: "description", content: "Profil akun Anda" },
    ],
  }),
});

function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [role, setRole] = useState("user");

  useEffect(() => {
    if (!session) return;
    const headers = { Authorization: `Bearer ${session.access_token}` };
    Promise.all([
      getUserProfile({ headers }),
      getUserRole({ headers }),
    ]).then(([p, r]) => {
      setProfile(p.profile);
      setRole(r.role);
    }).catch(console.error);
  }, [session]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Informasi akun Anda</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-xl font-bold">
                {(user?.email ?? "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{user?.email}</p>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary mt-1">
                {role}
              </span>
            </div>
          </div>
          <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="text-sm font-mono text-foreground mt-0.5 truncate">{user?.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p className="text-sm font-semibold text-primary mt-0.5">{formatRupiah(profile?.balance ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bergabung</p>
              <p className="text-sm text-foreground mt-0.5">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("id-ID") : "-"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Cargando…
      </div>
    );
  }

  if (adminOnly && user.role !== "admin") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
            🚫
          </div>
          <h2 className="font-display text-2xl text-destructive">Acceso denegado</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta sección es solo para administradores.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

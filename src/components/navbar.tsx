import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Menu, X, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Inicio" },
  { to: "/matches", label: "Partidos" },
  { to: "/predictions", label: "Mis pronósticos" },
  { to: "/leaderboard", label: "Tabla" },
] as const;

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <span className="font-display text-lg font-bold tracking-tight">
            Predictor <span className="text-primary">2026</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          {user.role === "admin" && (
            <Link
              to="/admin"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname.startsWith("/admin")
                  ? "bg-warning/15 text-warning"
                  : "text-warning/80 hover:bg-warning/10",
              )}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1">
            <Trophy className="h-3.5 w-3.5 text-gold" />
            <span className="text-xs font-semibold text-gold">
              {user.total_points} pts
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            Hola, <span className="font-medium text-foreground">{user.username}</span>
          </span>
          <button
            onClick={handleLogout}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <button
          className="rounded-md p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card md:hidden">
          <div className="flex flex-col gap-1 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{user.username}</span>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold">
                {user.total_points} pts
              </span>
            </div>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
            {user.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-warning hover:bg-warning/10"
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

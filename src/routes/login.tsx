import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-hero"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            ⚽ World Cup 2026
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Predictor <span className="text-primary">2026</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Predice los partidos. Gana puntos. Conquista la tabla.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-1 shadow-card">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-background/50 p-1">
            <button
              onClick={() => setTab("login")}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                tab === "login"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setTab("register")}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                tab === "register"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Registrarse
            </button>
          </div>

          <div className="p-6">
            {tab === "login" ? (
              <LoginForm onSubmit={login} />
            ) : (
              <RegisterForm onSubmit={register} onDone={() => navigate({ to: "/dashboard" })} />
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo: admin@demo.com / admin123 — o cualquier usuario de la tabla con contraseña{" "}
          <span className="font-mono text-foreground">demo</span>
        </p>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Volver
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoginForm({
  onSubmit,
}: {
  onSubmit: (email: string, password: string) => Promise<void>;
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(email, password);
      toast.success("¡Bienvenido de vuelta!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full shadow-glow" disabled={loading}>
        {loading ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}

function RegisterForm({
  onSubmit,
  onDone,
}: {
  onSubmit: (u: string, e: string, p: string) => Promise<void>;
  onDone: () => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      toast.error("El usuario debe tener al menos 3 caracteres");
      return;
    }
    if (password.length < 4) {
      toast.error("La contraseña debe tener al menos 4 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(username.trim(), email.trim(), password);
      toast.success("¡Cuenta creada! Suerte en el Mundial 🏆");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          maxLength={24}
          placeholder="ej: messi10"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="remail">Email</Label>
        <Input
          id="remail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="rpassword">Contraseña</Label>
          <Input
            id="rpassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full shadow-glow" disabled={loading}>
        {loading ? "Creando…" : "Crear cuenta"}
      </Button>
    </form>
  );
}

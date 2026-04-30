import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { Navbar } from "@/components/navbar";
import {
  MatchMeta,
  PhaseChip,
  ScoreBlock,
  StatusBadge,
  TeamSide,
} from "@/components/match-parts";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { adminGetLock, adminSetLock, adminSetResult, getMatches } from "@/lib/api";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RequireAuth adminOnly>
      <AdminPage />
    </RequireAuth>
  ),
});

function AdminPage() {
  const [tab, setTab] = useState<"results" | "upcoming">("results");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [locked, setLocked] = useState(false);

  const load = async () => {
    const m = await getMatches();
    setMatches(m);
    setLocked(await adminGetLock());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-warning">
            🛡 Admin
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold">Panel de administrador</h1>
        </header>

        <div className="mb-6 inline-flex rounded-xl border border-border bg-card p-1">
          <TabBtn active={tab === "results"} onClick={() => setTab("results")}>
            Cargar resultados
          </TabBtn>
          <TabBtn active={tab === "upcoming"} onClick={() => setTab("upcoming")}>
            Partidos próximos
          </TabBtn>
        </div>

        {!matches ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : tab === "results" ? (
          <ResultsTab matches={matches} onSaved={load} />
        ) : (
          <UpcomingTab
            matches={matches}
            locked={locked}
            onToggleLock={async (v) => {
              setLocked(v);
              await adminSetLock(v);
              toast.success(v ? "Pronósticos bloqueados" : "Pronósticos desbloqueados");
            }}
          />
        )}
      </main>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-glow"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ResultsTab({
  matches,
  onSaved,
}: {
  matches: Match[];
  onSaved: () => void;
}) {
  const pending = matches.filter(
    (m) =>
      (m.status === "live" || m.status === "upcoming" || m.status === "finished") &&
      (m.home_score == null || m.away_score == null),
  );
  const liveOrStarted = matches.filter(
    (m) => m.status === "live" || (m.status === "upcoming" && new Date(m.match_date).getTime() <= Date.now()),
  );
  // Use union of started/finished-without-result
  const all = Array.from(
    new Map([...pending, ...liveOrStarted].map((m) => [m.id, m])).values(),
  );

  if (all.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
        No hay partidos pendientes de resultado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {all.map((m) => (
        <ResultRow key={m.id} match={m} onSaved={onSaved} />
      ))}
    </div>
  );
}

function ResultRow({ match, onSaved }: { match: Match; onSaved: () => void }) {
  const [home, setHome] = useState<number>(match.home_score ?? 0);
  const [away, setAway] = useState<number>(match.away_score ?? 0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await adminSetResult(match.id, home, away);
      toast.success(`Resultado guardado. Puntos recalculados para ${res.affectedUsers} usuarios.`);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <PhaseChip match={match} />
        <StatusBadge match={match} />
      </div>
      <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_auto_auto_auto_auto]">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-xl">{match.home_team.flag_emoji}</span>
          <span className="font-medium">{match.home_team.name}</span>
          <span className="text-muted-foreground">vs</span>
          <span className="font-medium">{match.away_team.name}</span>
          <span className="text-xl">{match.away_team.flag_emoji}</span>
        </div>
        <input
          type="number"
          min={0}
          max={20}
          value={home}
          onChange={(e) => setHome(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="h-10 w-16 rounded-md border border-border bg-background text-center font-display text-lg font-bold"
        />
        <span className="text-muted-foreground">-</span>
        <input
          type="number"
          min={0}
          max={20}
          value={away}
          onChange={(e) => setAway(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="h-10 w-16 rounded-md border border-border bg-background text-center font-display text-lg font-bold"
        />
        <Button size="sm" onClick={save} disabled={saving} className="shadow-glow">
          {saving ? "Guardando…" : "Guardar resultado"}
        </Button>
      </div>
      <div className="mt-2">
        <MatchMeta match={match} />
      </div>
    </div>
  );
}

function UpcomingTab({
  matches,
  locked,
  onToggleLock,
}: {
  matches: Match[];
  locked: boolean;
  onToggleLock: (v: boolean) => void;
}) {
  const upcoming = matches.filter((m) => m.status === "upcoming");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            🚨 Bloqueo global de pronósticos
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Emergencia: impide que cualquier usuario cree o edite pronósticos.
          </p>
        </div>
        <Switch checked={locked} onCheckedChange={onToggleLock} />
      </div>

      <div className="space-y-2">
        {upcoming.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <PhaseChip match={m} />
              <StatusBadge match={m} />
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <TeamSide flag={m.home_team.flag_emoji} name={m.home_team.name} />
              <ScoreBlock match={m} />
              <TeamSide
                flag={m.away_team.flag_emoji}
                name={m.away_team.name}
                align="right"
              />
            </div>
            <div className="mt-2">
              <MatchMeta match={m} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Trophy, ChevronRight } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { Navbar } from "@/components/navbar";
import { PredictionModal } from "@/components/prediction-modal";
import {
  MatchMeta,
  PhaseChip,
  ScoreBlock,
  StatusBadge,
  TeamSide,
} from "@/components/match-parts";
import { Button } from "@/components/ui/button";
import { getLeaderboard, getMatches, getMyPredictions } from "@/lib/api";
import type { LeaderboardEntry, Match } from "@/lib/types";
import type { PredictionWithMatch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
});

function DashboardPage() {
  const { user, refresh } = useAuth();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [preds, setPreds] = useState<PredictionWithMatch[] | null>(null);
  const [board, setBoard] = useState<LeaderboardEntry[] | null>(null);
  const [modalMatch, setModalMatch] = useState<Match | null>(null);

  const load = useCallback(async () => {
    const [m, p, b] = await Promise.all([
      getMatches({ status: "upcoming" }),
      getMyPredictions(),
      getLeaderboard(),
    ]);
    setMatches(m.slice(0, 8));
    setPreds(p.slice(0, 5));
    setBoard(b);
    refresh();
  }, [refresh]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-surface p-6 md:p-8">
          <div className="absolute inset-0 bg-gradient-hero opacity-60" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              ⚽ Mundial 2026
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Hola, {user?.username} 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              Tienes{" "}
              <span className="font-semibold text-gold">{user?.total_points} puntos</span>.{" "}
              ¡A seguir prediciendo!
            </p>
          </div>
        </section>

        {/* Próximos partidos */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Próximos partidos</h2>
              <p className="text-sm text-muted-foreground">
                Predice antes del pitazo inicial.
              </p>
            </div>
            <Link
              to="/matches"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todos →
            </Link>
          </div>

          {!matches ? (
            <ScrollSkeleton />
          ) : matches.length === 0 ? (
            <EmptyBox>No hay partidos próximos.</EmptyBox>
          ) : (
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-hide px-4 pb-2">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="w-[85%] shrink-0 snap-start md:w-[32%]"
                >
                  <UpcomingCard match={m} onPredict={() => setModalMatch(m)} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Mis últimas predicciones */}
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">
            Mis últimas predicciones
          </h2>
          {!preds ? (
            <ListSkeleton />
          ) : preds.length === 0 ? (
            <EmptyBox>
              Aún no tienes pronósticos.{" "}
              <Link to="/matches" className="font-medium text-primary hover:underline">
                ¡Empieza prediciendo!
              </Link>
            </EmptyBox>
          ) : (
            <div className="space-y-2">
              {preds.map((p) => (
                <PredictionRow key={p.id} pred={p} />
              ))}
            </div>
          )}
        </section>

        {/* Top 5 */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">Top 5</h2>
            <Link
              to="/leaderboard"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver tabla →
            </Link>
          </div>
          {!board ? (
            <ListSkeleton />
          ) : (
            <MiniBoard board={board} />
          )}
        </section>
      </main>

      <PredictionModal
        match={modalMatch}
        open={!!modalMatch}
        onOpenChange={(v) => !v && setModalMatch(null)}
        onSaved={load}
      />
    </div>
  );
}

function UpcomingCard({
  match,
  onPredict,
}: {
  match: Match;
  onPredict: () => void;
}) {
  const predicted = match.my_prediction;
  return (
    <div className="group relative h-full rounded-xl border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/40">
      <div className="mb-3 flex items-center justify-between">
        <PhaseChip match={match} />
        <StatusBadge match={match} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <TeamSide flag={match.home_team.flag_emoji} name={match.home_team.name} />
        <ScoreBlock match={match} />
        <TeamSide
          flag={match.away_team.flag_emoji}
          name={match.away_team.name}
          align="right"
        />
      </div>
      <div className="mt-3">
        <MatchMeta match={match} />
      </div>
      <div className="mt-4">
        {predicted ? (
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs">
            <span className="text-muted-foreground">Tu pronóstico:</span>
            <span className="font-display text-base font-bold">
              {predicted.predicted_home} - {predicted.predicted_away}
            </span>
            <button
              onClick={onPredict}
              className="text-xs font-medium text-warning hover:underline"
            >
              Editar
            </button>
          </div>
        ) : (
          <Button
            onClick={onPredict}
            className="w-full shadow-glow"
            size="sm"
          >
            Predecir
          </Button>
        )}
      </div>
    </div>
  );
}

function PredictionRow({ pred }: { pred: PredictionWithMatch }) {
  const { match } = pred;
  const finished = match.status === "finished";
  const pts = pred.points_earned;
  let icon = "⏳";
  if (finished && pts != null) {
    icon = pts >= 5 ? "⭐" : pts >= 2 ? "✓" : "✗";
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span>{match.home_team.flag_emoji}</span>
          <span className="font-medium">{match.home_team.name}</span>
          <span className="text-muted-foreground">vs</span>
          <span className="font-medium">{match.away_team.name}</span>
          <span>{match.away_team.flag_emoji}</span>
        </div>
        <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
          <span>Mi: <span className="font-semibold text-foreground">{pred.predicted_home}-{pred.predicted_away}</span></span>
          {finished && (
            <span>
              Real:{" "}
              <span className="font-semibold text-foreground">
                {match.home_score}-{match.away_score}
              </span>
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <PointsPill points={pts} finished={finished} />
      </div>
    </div>
  );
}

export function PointsPill({
  points,
  finished,
}: {
  points: number | null;
  finished: boolean;
}) {
  if (!finished || points == null) {
    return (
      <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">
        — pts
      </span>
    );
  }
  if (points >= 5) {
    return (
      <span className="rounded-full border border-gold/40 bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-gold">
        {points} pts
      </span>
    );
  }
  if (points > 0) {
    return (
      <span className="rounded-full border border-primary/30 bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
        {points} pts
      </span>
    );
  }
  return (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
      0 pts
    </span>
  );
}

function MiniBoard({ board }: { board: LeaderboardEntry[] }) {
  const top5 = board.slice(0, 5);
  const meInTop = top5.some((e) => e.is_current_user);
  const me = board.find((e) => e.is_current_user);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <th className="w-12 px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Usuario</th>
            <th className="px-4 py-3 text-right">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {top5.map((e) => (
            <BoardRow key={e.user_id} e={e} />
          ))}
          {!meInTop && me && (
            <>
              <tr>
                <td colSpan={3} className="border-t border-dashed border-border px-4 py-1.5 text-center text-xs text-muted-foreground">
                  …
                </td>
              </tr>
              <BoardRow e={me} />
            </>
          )}
        </tbody>
      </table>
      <Link
        to="/leaderboard"
        className="flex items-center justify-center gap-1 border-t border-border py-2.5 text-xs font-medium text-primary hover:bg-primary/5"
      >
        Ver tabla completa <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function BoardRow({ e }: { e: LeaderboardEntry }) {
  const medal = e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : null;
  return (
    <tr
      className={cn(
        "border-b border-border last:border-0",
        e.is_current_user && "bg-primary/10",
      )}
    >
      <td className="px-4 py-3 font-display font-bold">
        {medal ?? e.rank}
      </td>
      <td className="px-4 py-3">
        <span className={cn("font-medium", e.is_current_user && "text-primary")}>
          {e.username}
        </span>
        {e.is_current_user && (
          <span className="ml-2 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            TÚ
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <span className="inline-flex items-center gap-1.5 text-gold">
          <Trophy className="h-3 w-3" />
          <span className="font-display text-base font-bold">{e.total_points}</span>
        </span>
      </td>
    </tr>
  );
}

function ScrollSkeleton() {
  return (
    <div className="-mx-4 flex gap-4 overflow-hidden px-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 w-[85%] shrink-0 animate-pulse rounded-xl bg-card md:w-[32%]" />
      ))}
    </div>
  );
}
function ListSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-card" />
      ))}
    </div>
  );
}
function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

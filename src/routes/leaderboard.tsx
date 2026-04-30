import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { Navbar } from "@/components/navbar";
import { getLeaderboard } from "@/lib/api";
import type { LeaderboardEntry, Phase } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  component: () => (
    <RequireAuth>
      <LeaderboardPage />
    </RequireAuth>
  ),
});

const FILTERS: Array<{ key: Phase | "general"; label: string }> = [
  { key: "general", label: "General" },
  { key: "groups", label: "Grupos" },
  { key: "round_of_32", label: "Ronda 32" },
  { key: "round_of_16", label: "Octavos" },
  { key: "quarterfinal", label: "Cuartos" },
  { key: "semifinal", label: "Semis" },
  { key: "final", label: "Final" },
];

function LeaderboardPage() {
  const [filter, setFilter] = useState<Phase | "general">("general");
  const [board, setBoard] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    setBoard(null);
    getLeaderboard(filter).then(setBoard);
  }, [filter]);

  const top10 = board?.slice(0, 10) ?? [];
  const me = board?.find((e) => e.is_current_user);
  const meInTop = me ? top10.some((e) => e.user_id === me.user_id) : false;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Tabla de posiciones</h1>
            <p className="text-sm text-muted-foreground">
              {board ? `${board.length} participantes` : "Cargando…"}
            </p>
          </div>
        </header>

        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto scrollbar-hide px-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                filter === f.key
                  ? "border-primary bg-primary text-primary-foreground shadow-glow"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {!board ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="hidden grid-cols-[60px_1fr_80px_80px_80px_80px] gap-2 border-b border-border px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:grid">
              <span>#</span>
              <span>Usuario</span>
              <span className="text-right">Pts</span>
              <span className="text-right">Exactos</span>
              <span className="text-right">Parciales</span>
              <span className="text-right">% Acierto</span>
            </div>
            {top10.map((e) => (
              <BoardFullRow key={e.user_id} e={e} />
            ))}
            {!meInTop && me && (
              <>
                <div className="border-t border-dashed border-border py-1 text-center text-xs text-muted-foreground">
                  …
                </div>
                <BoardFullRow e={me} sticky />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function BoardFullRow({ e, sticky }: { e: LeaderboardEntry; sticky?: boolean }) {
  const medal = e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : null;
  const border =
    e.rank === 1
      ? "border-l-gold"
      : e.rank === 2
        ? "border-l-silver"
        : e.rank === 3
          ? "border-l-bronze"
          : "border-l-transparent";
  return (
    <div
      className={cn(
        "grid grid-cols-[40px_1fr_auto] items-center gap-2 border-b border-l-4 border-border bg-card px-4 py-3 md:grid-cols-[60px_1fr_80px_80px_80px_80px]",
        border,
        e.is_current_user && "bg-primary/10",
        sticky && "sticky bottom-0 shadow-[0_-8px_20px_-12px_oklch(0_0_0/0.6)]",
      )}
    >
      <span className="font-display text-lg font-bold">
        {medal ?? e.rank}
      </span>
      <div className="min-w-0">
        <span
          className={cn(
            "truncate text-sm font-semibold",
            e.is_current_user && "text-primary",
          )}
        >
          {e.username}
        </span>
        {e.is_current_user && (
          <span className="ml-2 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
            TÚ
          </span>
        )}
        <div className="mt-0.5 flex gap-3 text-[11px] text-muted-foreground md:hidden">
          <span>⭐ {e.exact_count}</span>
          <span>✓ {e.partial_count}</span>
          <span>{e.accuracy_pct}%</span>
        </div>
      </div>
      <span className="text-right font-display text-lg font-bold text-gold md:text-base">
        {e.total_points}
      </span>
      <span className="hidden text-right text-sm md:block">{e.exact_count}</span>
      <span className="hidden text-right text-sm md:block">{e.partial_count}</span>
      <span className="hidden text-right text-sm md:block">{e.accuracy_pct}%</span>
    </div>
  );
}

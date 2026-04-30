import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
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
import { getMatches } from "@/lib/api";
import type { Match, Phase } from "@/lib/types";
import { PHASE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/matches")({
  component: () => (
    <RequireAuth>
      <MatchesPage />
    </RequireAuth>
  ),
});

const TABS: Array<{ phase: Phase; label: string }> = [
  { phase: "groups", label: "Fase de grupos" },
  { phase: "round_of_32", label: "Ronda de 32" },
  { phase: "round_of_16", label: "Octavos" },
  { phase: "quarterfinal", label: "Cuartos" },
  { phase: "semifinal", label: "Semis" },
  { phase: "final", label: "Final" },
];

function MatchesPage() {
  const [phase, setPhase] = useState<Phase>("groups");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [modalMatch, setModalMatch] = useState<Match | null>(null);

  const load = useCallback(async () => {
    setMatches(null);
    const m = await getMatches({ phase });
    setMatches(m);
  }, [phase]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped: Array<[string, Match[]]> = (() => {
    if (!matches) return [];
    if (phase === "groups") {
      const byMatchday = new Map<number, Match[]>();
      for (const m of matches) {
        const md = m.matchday ?? 1;
        if (!byMatchday.has(md)) byMatchday.set(md, []);
        byMatchday.get(md)!.push(m);
      }
      return Array.from(byMatchday.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([md, ms]) => [`Jornada ${md}`, ms]);
    }
    return [[PHASE_LABELS[phase], matches]];
  })();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="font-display text-3xl font-bold">Calendario</h1>
          <p className="text-sm text-muted-foreground">
            Todos los partidos del Mundial 2026.
          </p>
        </header>

        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto scrollbar-hide px-4">
          {TABS.map((t) => (
            <button
              key={t.phase}
              onClick={() => setPhase(t.phase)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                phase === t.phase
                  ? "border-primary bg-primary text-primary-foreground shadow-glow"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {!matches ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No hay partidos en esta fase todavía.
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(([label, ms]) => (
              <section key={label}>
                <h2 className="mb-3 font-display text-lg font-semibold text-muted-foreground">
                  {label}
                </h2>
                <div className="space-y-2">
                  {ms.map((m) => (
                    <MatchRow key={m.id} match={m} onPredict={() => setModalMatch(m)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
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

function MatchRow({ match, onPredict }: { match: Match; onPredict: () => void }) {
  const canPredict = match.status === "upcoming";
  const pred = match.my_prediction;
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <PhaseChip match={match} />
        <StatusBadge match={match} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamSide flag={match.home_team.flag_emoji} name={match.home_team.name} />
        <ScoreBlock match={match} />
        <TeamSide
          flag={match.away_team.flag_emoji}
          name={match.away_team.name}
          align="right"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <MatchMeta match={match} />
        <div className="flex items-center gap-2">
          {pred && (
            <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs">
              <span className="text-muted-foreground">Pronóstico: </span>
              <span className="font-semibold">
                {pred.predicted_home}-{pred.predicted_away}
              </span>
              {pred.points_earned != null && (
                <span className="ml-1.5 font-bold text-gold">
                  · +{pred.points_earned} pts
                </span>
              )}
            </span>
          )}
          {canPredict && (
            <Button
              size="sm"
              variant={pred ? "secondary" : "default"}
              onClick={onPredict}
              className={cn(pred ? "text-warning" : "shadow-glow")}
            >
              {pred ? "Editar" : "Predecir"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

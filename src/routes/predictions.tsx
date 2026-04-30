import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { Navbar } from "@/components/navbar";
import { PointsPill } from "./dashboard";
import { getMyPredictions } from "@/lib/api";
import type { PredictionWithMatch } from "@/lib/api";
import type { Phase } from "@/lib/types";
import { PHASE_LABELS } from "@/lib/types";
import { formatMatchDate } from "@/lib/format";

export const Route = createFileRoute("/predictions")({
  component: () => (
    <RequireAuth>
      <PredictionsPage />
    </RequireAuth>
  ),
});

type StatusFilter = "all" | "pending" | "exact" | "correct" | "wrong";

function PredictionsPage() {
  const [preds, setPreds] = useState<PredictionWithMatch[] | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<Phase | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    getMyPredictions().then(setPreds);
  }, []);

  const summary = useMemo(() => {
    if (!preds) return null;
    let total = 0;
    let finished = 0;
    let exact = 0;
    for (const p of preds) {
      if (p.match.status !== "finished" || p.points_earned == null) continue;
      finished++;
      total += p.points_earned;
      if (p.points_earned >= 5) exact++;
    }
    return {
      total,
      count: preds.length,
      exact,
      pct: finished > 0 ? Math.round((exact / finished) * 100) : 0,
    };
  }, [preds]);

  const filtered = useMemo(() => {
    if (!preds) return [];
    return preds.filter((p) => {
      if (phaseFilter !== "all" && p.match.phase !== phaseFilter) return false;
      const finished = p.match.status === "finished" && p.points_earned != null;
      switch (statusFilter) {
        case "pending":
          return !finished;
        case "exact":
          return finished && (p.points_earned ?? 0) >= 5;
        case "correct":
          return finished && (p.points_earned ?? 0) > 0;
        case "wrong":
          return finished && p.points_earned === 0;
        default:
          return true;
      }
    });
  }, [preds, phaseFilter, statusFilter]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="font-display text-3xl font-bold">Mis pronósticos</h1>
          <p className="text-sm text-muted-foreground">
            Historial completo y estadísticas.
          </p>
        </header>

        {summary && (
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Total pts" value={summary.total} accent="gold" />
            <StatCard label="Predichos" value={summary.count} />
            <StatCard label="Exactos" value={summary.exact} />
            <StatCard label="% acierto" value={`${summary.pct}%`} />
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as Phase | "all")}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="all">Todas las fases</option>
            {(Object.keys(PHASE_LABELS) as Phase[]).map((p) => (
              <option key={p} value={p}>
                {PHASE_LABELS[p]}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "Todos"],
                ["pending", "Pendientes"],
                ["exact", "Exactos"],
                ["correct", "Acertados"],
                ["wrong", "Fallados"],
              ] as [StatusFilter, string][]
            ).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setStatusFilter(k)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === k
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {!preds ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            {preds.length === 0 ? (
              <>
                Aún no tienes pronósticos.{" "}
                <Link to="/matches" className="font-medium text-primary hover:underline">
                  ¡Empieza prediciendo!
                </Link>
              </>
            ) : (
              "No hay pronósticos con estos filtros."
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 text-left">Partido</th>
                    <th className="px-4 py-3 text-center">Mi pronóstico</th>
                    <th className="px-4 py-3 text-center">Resultado</th>
                    <th className="px-4 py-3 text-center">Puntos</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <PredRowDesktop key={p.id} p={p} />
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="space-y-2 md:hidden">
              {filtered.map((p) => (
                <PredCardMobile key={p.id} p={p} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "gold";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-2xl font-bold ${
          accent === "gold" ? "text-gold" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function statusLabel(p: PredictionWithMatch): { icon: string; text: string } {
  if (p.match.status !== "finished" || p.points_earned == null) {
    return { icon: "⏳", text: "Pendiente" };
  }
  if (p.points_earned >= 5) return { icon: "⭐", text: "Exacto" };
  if (p.points_earned > 0) return { icon: "✓", text: "Acertado" };
  return { icon: "✗", text: "Fallo" };
}

function PredRowDesktop({ p }: { p: PredictionWithMatch }) {
  const { icon, text } = statusLabel(p);
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span>{p.match.home_team.flag_emoji}</span>
          <span className="font-medium">{p.match.home_team.name}</span>
          <span className="text-muted-foreground">vs</span>
          <span className="font-medium">{p.match.away_team.name}</span>
          <span>{p.match.away_team.flag_emoji}</span>
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {formatMatchDate(p.match.match_date)}
        </div>
      </td>
      <td className="px-4 py-3 text-center font-display text-base font-bold">
        {p.predicted_home} - {p.predicted_away}
      </td>
      <td className="px-4 py-3 text-center font-display text-base">
        {p.match.status === "finished"
          ? `${p.match.home_score} - ${p.match.away_score}`
          : "—"}
      </td>
      <td className="px-4 py-3 text-center">
        <PointsPill points={p.points_earned} finished={p.match.status === "finished"} />
      </td>
      <td className="px-4 py-3 text-left">
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span>{icon}</span>
          <span>{text}</span>
        </span>
      </td>
    </tr>
  );
}

function PredCardMobile({ p }: { p: PredictionWithMatch }) {
  const { icon, text } = statusLabel(p);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <span>{p.match.home_team.flag_emoji}</span>
          <span>{p.match.home_team.code}</span>
          <span className="text-muted-foreground">vs</span>
          <span>{p.match.away_team.code}</span>
          <span>{p.match.away_team.flag_emoji}</span>
        </div>
        <span className="text-xs">{icon} {text}</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {formatMatchDate(p.match.match_date)}
      </div>
      <div className="mt-3 grid grid-cols-3 items-center gap-2 rounded-lg bg-background/50 p-2 text-center">
        <div>
          <div className="text-[10px] uppercase text-muted-foreground">Mío</div>
          <div className="font-display text-lg font-bold">
            {p.predicted_home}-{p.predicted_away}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-muted-foreground">Real</div>
          <div className="font-display text-lg font-bold">
            {p.match.status === "finished"
              ? `${p.match.home_score}-${p.match.away_score}`
              : "—"}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-muted-foreground">Pts</div>
          <div className="mt-0.5">
            <PointsPill points={p.points_earned} finished={p.match.status === "finished"} />
          </div>
        </div>
      </div>
    </div>
  );
}

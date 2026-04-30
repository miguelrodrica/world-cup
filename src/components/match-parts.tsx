import type { Match } from "@/lib/types";
import { formatCountdown, formatMatchDate, phaseLabelFor } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StatusBadge({ match }: { match: Match }) {
  if (match.status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-live/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-live">
        <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-live" />
        EN VIVO
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Finalizado
      </span>
    );
  }
  return (
    <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      Próximo
    </span>
  );
}

export function TeamSide({
  flag,
  name,
  align = "left",
}: {
  flag: string;
  name: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      <span className="text-2xl leading-none">{flag}</span>
      <span className="truncate text-sm font-semibold">{name}</span>
    </div>
  );
}

export function ScoreBlock({ match }: { match: Match }) {
  if (match.status === "upcoming") {
    return (
      <div className="font-display text-xl text-muted-foreground">vs</div>
    );
  }
  return (
    <div className="font-display text-2xl font-bold">
      <span>{match.home_score}</span>
      <span className="mx-1.5 text-muted-foreground">-</span>
      <span>{match.away_score}</span>
    </div>
  );
}

export function MatchMeta({ match }: { match: Match }) {
  const countdown = match.status === "upcoming" ? formatCountdown(match.match_date) : null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span>{formatMatchDate(match.match_date)}</span>
      <span className="opacity-40">·</span>
      <span className="truncate">{match.venue}</span>
      {countdown && (
        <>
          <span className="opacity-40">·</span>
          <span className="font-medium text-primary">{countdown}</span>
        </>
      )}
    </div>
  );
}

export function PhaseChip({ match }: { match: Match }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      {phaseLabelFor(match)}
    </span>
  );
}

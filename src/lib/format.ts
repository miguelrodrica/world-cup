import type { Phase, Match } from "./types";
import { PHASE_LABELS } from "./types";

export function formatMatchDate(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(d);
  const time = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${date.charAt(0).toUpperCase()}${date.slice(1)} · ${time}`;
}

export function formatCountdown(iso: string): string | null {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const hr = h % 24;
    return `Cierra en ${d}d ${hr}h`;
  }
  return `Cierra en ${h}h ${m}m`;
}

export function phaseLabelFor(match: Match): string {
  const base = PHASE_LABELS[match.phase];
  if (match.phase === "groups") {
    return `${base} · Grupo ${match.home_team.group_name}`;
  }
  return base;
}

export function phaseShortLabel(phase: Phase): string {
  return PHASE_LABELS[phase];
}

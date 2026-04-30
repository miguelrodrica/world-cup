export interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  total_points: number;
}

export type Phase =
  | "groups"
  | "round_of_32"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "third_place"
  | "final";

export type MatchStatus = "upcoming" | "live" | "finished";

export interface Team {
  id: number;
  name: string;
  code: string;
  flag_emoji: string;
  group_name: string;
}

export interface Prediction {
  id: number;
  match_id: number;
  predicted_home: number;
  predicted_away: number;
  points_earned: number | null;
}

export interface Match {
  id: number;
  home_team: Team;
  away_team: Team;
  match_date: string;
  venue: string;
  phase: Phase;
  matchday?: number;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  my_prediction?: Prediction;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  total_points: number;
  exact_count: number;
  partial_count: number;
  accuracy_pct: number;
  is_current_user: boolean;
}

export const PHASE_LABELS: Record<Phase, string> = {
  groups: "Fase de grupos",
  round_of_32: "Ronda de 32",
  round_of_16: "Octavos",
  quarterfinal: "Cuartos de final",
  semifinal: "Semifinales",
  third_place: "Tercer puesto",
  final: "Final",
};

export const PHASE_MULTIPLIER: Record<Phase, number> = {
  groups: 1,
  round_of_32: 1.5,
  round_of_16: 2,
  quarterfinal: 3,
  semifinal: 4,
  third_place: 4,
  final: 5,
};

export function computeBasePoints(
  pHome: number,
  pAway: number,
  rHome: number | null,
  rAway: number | null,
): number {
  if (rHome === null || rAway === null) return 0;
  if (pHome === rHome && pAway === rAway) return 5;
  const pDiff = pHome - pAway;
  const rDiff = rHome - rAway;
  const sameWinner =
    (pDiff > 0 && rDiff > 0) || (pDiff < 0 && rDiff < 0) || (pDiff === 0 && rDiff === 0);
  if (sameWinner && pDiff === rDiff) return 4;
  if (sameWinner) return 2;
  return 0;
}

export function computeFinalPoints(base: number, phase: Phase): number {
  return Math.round(base * PHASE_MULTIPLIER[phase]);
}

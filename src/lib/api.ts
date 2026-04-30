import type {
  LeaderboardEntry,
  Match,
  Phase,
  Prediction,
  User,
} from "./types";
import { computeBasePoints, computeFinalPoints } from "./types";
import { mockLeaderboard, mockMatches } from "./mockData";

const AUTH_KEY = "auth";
const USERS_KEY = "predictor_users";
const MATCHES_KEY = "predictor_matches";
const PREDICTIONS_KEY = "predictor_predictions";
const LOCK_KEY = "predictor_lock";

type StoredAuth = { token: string; user: User } | null;

function isBrowser() {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function seed() {
  if (!isBrowser()) return;
  if (!localStorage.getItem(MATCHES_KEY)) {
    writeJSON(MATCHES_KEY, mockMatches);
  }
  if (!localStorage.getItem(USERS_KEY)) {
    // Seed with the mock leaderboard as "other" users (no password login for them).
    const seeded: Array<User & { password?: string }> = mockLeaderboard.map(
      (e) => ({
        id: e.user_id,
        username: e.username,
        email: `${e.username}@demo.com`,
        role: e.username === "tu_usuario" ? "user" : "user",
        total_points: e.total_points,
      }),
    );
    // Demo admin
    seeded.push({
      id: 999,
      username: "admin",
      email: "admin@demo.com",
      role: "admin",
      total_points: 0,
      password: "admin123",
    });
    writeJSON(USERS_KEY, seeded);
  }
  if (!localStorage.getItem(PREDICTIONS_KEY)) {
    // Seed predictions for the current demo user from my_prediction in mocks
    const preds: Array<Prediction & { user_id: number }> = [];
    for (const m of mockMatches) {
      if (m.my_prediction) {
        preds.push({ ...m.my_prediction, user_id: 1 });
      }
    }
    writeJSON(PREDICTIONS_KEY, preds);
  }
}

seed();

function currentAuth(): StoredAuth {
  return readJSON<StoredAuth>(AUTH_KEY, null);
}

function requireAuth(): { token: string; user: User } {
  const a = currentAuth();
  if (!a) throw new Error("401");
  return a;
}

function delay<T>(v: T, ms = 250): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

// ---------- Auth ----------

export async function login(email: string, password: string) {
  const users = readJSON<Array<User & { password?: string }>>(USERS_KEY, []);
  // Demo rule: any user with email matches → allow with password "demo" OR exact password for admin seed
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("Credenciales inválidas");
  if (user.password && user.password !== password) {
    throw new Error("Credenciales inválidas");
  }
  if (!user.password && password !== "demo") {
    throw new Error("Credenciales inválidas (usa 'demo' para cuentas de demo)");
  }
  const safe: User = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    total_points: user.total_points,
  };
  const payload = { token: `mock.${user.id}.${Date.now()}`, user: safe };
  writeJSON(AUTH_KEY, payload);
  return delay(payload);
}

export async function register(
  username: string,
  email: string,
  password: string,
) {
  const users = readJSON<Array<User & { password?: string }>>(USERS_KEY, []);
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Ese email ya está registrado");
  }
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("Ese nombre de usuario ya existe");
  }
  const id = Math.max(0, ...users.map((u) => u.id)) + 1;
  const newUser: User & { password: string } = {
    id,
    username,
    email,
    role: "user",
    total_points: 0,
    password,
  };
  users.push(newUser);
  writeJSON(USERS_KEY, users);
  const safe: User = {
    id,
    username,
    email,
    role: "user",
    total_points: 0,
  };
  const payload = { token: `mock.${id}.${Date.now()}`, user: safe };
  writeJSON(AUTH_KEY, payload);
  return delay(payload);
}

export function logout() {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_KEY);
}

export function getAuth(): StoredAuth {
  return currentAuth();
}

// ---------- Matches ----------

function readMatches(): Match[] {
  return readJSON<Match[]>(MATCHES_KEY, mockMatches);
}
function writeMatches(m: Match[]) {
  writeJSON(MATCHES_KEY, m);
}

function readPredictionsRaw(): Array<Prediction & { user_id: number }> {
  return readJSON<Array<Prediction & { user_id: number }>>(PREDICTIONS_KEY, []);
}
function writePredictions(p: Array<Prediction & { user_id: number }>) {
  writeJSON(PREDICTIONS_KEY, p);
}

function attachMyPrediction(match: Match, userId: number): Match {
  const all = readPredictionsRaw();
  const mine = all.find((p) => p.match_id === match.id && p.user_id === userId);
  const copy = { ...match } as Match;
  copy.my_prediction = mine
    ? {
        id: mine.id,
        match_id: mine.match_id,
        predicted_home: mine.predicted_home,
        predicted_away: mine.predicted_away,
        points_earned: mine.points_earned,
      }
    : undefined;
  return copy;
}

export async function getMatches(opts?: {
  phase?: Phase | "all";
  status?: "all" | "upcoming" | "live" | "finished";
}): Promise<Match[]> {
  const { user } = requireAuth();
  let list = readMatches();
  if (opts?.phase && opts.phase !== "all") {
    list = list.filter((m) => m.phase === opts.phase);
  }
  if (opts?.status && opts.status !== "all") {
    list = list.filter((m) => m.status === opts.status);
  }
  list = list
    .map((m) => attachMyPrediction(m, user.id))
    .sort(
      (a, b) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
    );
  return delay(list);
}

export async function getMatch(id: number): Promise<Match> {
  const { user } = requireAuth();
  const m = readMatches().find((x) => x.id === id);
  if (!m) throw new Error("Partido no encontrado");
  return delay(attachMyPrediction(m, user.id));
}

// ---------- Predictions ----------

export type PredictionWithMatch = Prediction & { match: Match };

export async function getMyPredictions(): Promise<PredictionWithMatch[]> {
  const { user } = requireAuth();
  const all = readPredictionsRaw().filter((p) => p.user_id === user.id);
  const matches = readMatches();
  const joined: PredictionWithMatch[] = [];
  for (const p of all) {
    const match = matches.find((m) => m.id === p.match_id);
    if (!match) continue;
    joined.push({
      id: p.id,
      match_id: p.match_id,
      predicted_home: p.predicted_home,
      predicted_away: p.predicted_away,
      points_earned: p.points_earned,
      match,
    });
  }
  joined.sort(
    (a, b) =>
      new Date(b.match.match_date).getTime() -
      new Date(a.match.match_date).getTime(),
  );
  return delay(joined);
}

export async function upsertPrediction(input: {
  match_id: number;
  predicted_home: number;
  predicted_away: number;
}): Promise<Prediction> {
  const { user } = requireAuth();
  if (readJSON<boolean>(LOCK_KEY, false)) {
    throw new Error("Los pronósticos están bloqueados por el admin");
  }
  const match = readMatches().find((m) => m.id === input.match_id);
  if (!match) throw new Error("Partido no encontrado");
  if (match.status !== "upcoming") {
    throw new Error("Este partido ya comenzó, no puedes predecir");
  }
  if (new Date(match.match_date).getTime() <= Date.now()) {
    throw new Error("El partido ya comenzó");
  }

  const all = readPredictionsRaw();
  const idx = all.findIndex(
    (p) => p.match_id === input.match_id && p.user_id === user.id,
  );
  let saved: Prediction & { user_id: number };
  if (idx >= 0) {
    saved = {
      ...all[idx],
      predicted_home: input.predicted_home,
      predicted_away: input.predicted_away,
      points_earned: null,
    };
    all[idx] = saved;
  } else {
    const id = Math.max(0, ...all.map((p) => p.id)) + 1;
    saved = {
      id,
      user_id: user.id,
      match_id: input.match_id,
      predicted_home: input.predicted_home,
      predicted_away: input.predicted_away,
      points_earned: null,
    };
    all.push(saved);
  }
  writePredictions(all);
  return delay({
    id: saved.id,
    match_id: saved.match_id,
    predicted_home: saved.predicted_home,
    predicted_away: saved.predicted_away,
    points_earned: saved.points_earned,
  });
}

// ---------- Leaderboard ----------

function recomputeTotals() {
  const preds = readPredictionsRaw();
  const users = readJSON<Array<User & { password?: string }>>(USERS_KEY, []);
  const totals = new Map<number, { pts: number; exact: number; partial: number; finished: number }>();
  for (const u of users) {
    totals.set(u.id, { pts: 0, exact: 0, partial: 0, finished: 0 });
  }
  for (const p of preds) {
    if (p.points_earned == null) continue;
    const t = totals.get(p.user_id);
    if (!t) continue;
    t.pts += p.points_earned;
    t.finished += 1;
    if (p.points_earned >= 5) t.exact += 1;
    else if (p.points_earned > 0) t.partial += 1;
  }
  // Blend seeded totals for demo users who have no finished preds
  const blended = users.map((u) => {
    const t = totals.get(u.id)!;
    const seeded = mockLeaderboard.find((e) => e.user_id === u.id);
    if (t.finished === 0 && seeded) {
      return {
        ...u,
        total_points: seeded.total_points,
        _exact: seeded.exact_count,
        _partial: seeded.partial_count,
      } as User & { password?: string; _exact: number; _partial: number };
    }
    return {
      ...u,
      total_points: t.pts,
      _exact: t.exact,
      _partial: t.partial,
    } as User & { password?: string; _exact: number; _partial: number };
  });
  writeJSON(USERS_KEY, blended.map(({ _exact, _partial, ...rest }) => rest));
  return blended;
}

export async function getLeaderboard(
  _phase: Phase | "general" = "general",
): Promise<LeaderboardEntry[]> {
  const auth = currentAuth();
  const currentId = auth?.user.id ?? 0;
  const blended = recomputeTotals() as Array<
    User & { _exact: number; _partial: number }
  >;
  const sorted = [...blended].sort((a, b) => b.total_points - a.total_points);
  const entries: LeaderboardEntry[] = sorted.map((u, i) => {
    const total = u._exact + u._partial;
    return {
      rank: i + 1,
      user_id: u.id,
      username: u.username,
      total_points: u.total_points,
      exact_count: u._exact,
      partial_count: u._partial,
      accuracy_pct: total > 0 ? Math.round((u._exact / Math.max(total, 1)) * 100) : 0,
      is_current_user: u.id === currentId,
    };
  });
  return delay(entries);
}

// ---------- Admin ----------

export async function adminSetResult(
  matchId: number,
  home_score: number,
  away_score: number,
): Promise<{ affectedUsers: number }> {
  const { user } = requireAuth();
  if (user.role !== "admin") throw new Error("No autorizado");
  const matches = readMatches();
  const idx = matches.findIndex((m) => m.id === matchId);
  if (idx < 0) throw new Error("Partido no encontrado");
  matches[idx] = {
    ...matches[idx],
    home_score,
    away_score,
    status: "finished",
  };
  writeMatches(matches);

  // Recompute points for all predictions of this match
  const preds = readPredictionsRaw();
  let affected = 0;
  for (const p of preds) {
    if (p.match_id !== matchId) continue;
    const base = computeBasePoints(
      p.predicted_home,
      p.predicted_away,
      home_score,
      away_score,
    );
    p.points_earned = computeFinalPoints(base, matches[idx].phase);
    affected += 1;
  }
  writePredictions(preds);
  recomputeTotals();

  // Refresh auth user total_points if current user was affected
  const auth = currentAuth();
  if (auth) {
    const users = readJSON<Array<User>>(USERS_KEY, []);
    const me = users.find((u) => u.id === auth.user.id);
    if (me) {
      writeJSON(AUTH_KEY, { ...auth, user: { ...auth.user, total_points: me.total_points } });
    }
  }
  return delay({ affectedUsers: affected });
}

export async function adminGetLock(): Promise<boolean> {
  return delay(readJSON<boolean>(LOCK_KEY, false));
}
export async function adminSetLock(locked: boolean) {
  const { user } = requireAuth();
  if (user.role !== "admin") throw new Error("No autorizado");
  writeJSON(LOCK_KEY, locked);
  return delay({ locked });
}

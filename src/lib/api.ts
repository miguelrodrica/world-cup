// src/lib/api.ts
// Reescrito para usar Supabase directamente.
// Mismas funciones exportadas → el resto de la app NO cambia.

import { createClient } from "@supabase/supabase-js";
import type { LeaderboardEntry, Match, Phase, Prediction, User } from "./types";
import { computeBasePoints, computeFinalPoints } from "./types";

// ── Supabase client ────────────────────────────────────────────
// VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY van en .env.local (desarrollo)
// y en las variables de entorno de Vercel (producción)
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth helpers ───────────────────────────────────────────────
const AUTH_KEY = "auth";

type StoredAuth = { token: string; user: User } | null;

function saveAuth(user: User, token: string) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ token, user }));
}

export function getAuth(): StoredAuth {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function requireAuth() {
  const a = getAuth();
  if (!a) throw new Error("401");
  return a;
}

// ── Auth ───────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  // 1. Autenticar con Supabase
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Credenciales inválidas");

  // 2. Obtener perfil de la tabla users
  const { data: profile, error: profileErr } = await supabase
    .from("users")
    .select("id, username, email, role, total_points")
    .eq("email", email)
    .single();

  if (profileErr || !profile) throw new Error("Perfil no encontrado");

  const user: User = {
    id:           profile.id,
    username:     profile.username,
    email:        profile.email,
    role:         profile.role,
    total_points: profile.total_points,
  };

  saveAuth(user, data.session!.access_token);
  return { token: data.session!.access_token, user };
}

export async function logout() {
  await supabase.auth.signOut();

  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export async function register(
  username: string,
  email: string,
  password: string,
) {
  // Verificar username disponible
  const { data: taken } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (taken) {
    throw new Error("Ese nombre de usuario ya existe");
  }

  // Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("No se pudo crear el usuario");
  }

  // Si tienes confirmación de email activada
  // es normal que no exista sesión todavía
  if (!data.session) {
    return {
      token: "",
      user: null,
    };
  }

  // Esperar un momento para que el trigger cree el perfil
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { data: profile, error: profileErr } = await supabase
    .from("users")
    .select("id, username, email, role, total_points")
    .eq("id", data.user.id)
    .single();

  if (profileErr || !profile) {
    throw new Error("El usuario fue creado pero no se encontró el perfil");
  }

  const user: User = {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    role: profile.role,
    total_points: profile.total_points,
  };

  saveAuth(user, data.session.access_token);

  return {
    token: data.session.access_token,
    user,
  };
}

// ── Matches ────────────────────────────────────────────────────

export async function getMatches(opts?: {
  phase?: Phase | "all";
  status?: "all" | "upcoming" | "live" | "finished";
}): Promise<Match[]> {
  const { user } = requireAuth();

  let query = supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*)
    `)
    .order("match_date");

  if (opts?.phase && opts.phase !== "all") {
    query = query.eq("phase", opts.phase);
  }
  if (opts?.status && opts.status !== "all") {
    query = query.eq("status", opts.status);
  }

  const { data: matches, error } = await query;
  if (error) throw new Error(error.message);

  // Traer predicciones del usuario en una sola consulta
  const { data: preds } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", user.id);

  const predMap = new Map((preds || []).map((p) => [p.match_id, p]));

  return (matches || []).map((m) => ({
    ...m,
    my_prediction: predMap.get(m.id) ?? undefined,
  })) as Match[];
}

export async function getMatch(id: number): Promise<Match> {
  const { user } = requireAuth();

  const { data: match, error } = await supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*)
    `)
    .eq("id", id)
    .single();

  if (error || !match) throw new Error("Partido no encontrado");

  const { data: pred } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  return { ...match, my_prediction: pred ?? undefined } as Match;
}

// ── Predictions ────────────────────────────────────────────────

export type PredictionWithMatch = Prediction & { match: Match };

export async function getMyPredictions(): Promise<PredictionWithMatch[]> {
  const { user } = requireAuth();

  const { data, error } = await supabase
    .from("predictions")
    .select(`
      *,
      match:matches(
        *,
        home_team:teams!home_team_id(*),
        away_team:teams!away_team_id(*)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((p) => ({
    id:             p.id,
    match_id:       p.match_id,
    predicted_home: p.predicted_home,
    predicted_away: p.predicted_away,
    points_earned:  p.points_earned,
    match:          p.match as unknown as Match,
  }));
}

export async function upsertPrediction(input: {
  match_id: number;
  predicted_home: number;
  predicted_away: number;
}): Promise<Prediction> {
  const { user } = requireAuth();

  // Verificar que el partido existe y no ha empezado
  const { data: match, error: matchErr } = await supabase
    .from("matches")
    .select("id, status, match_date")
    .eq("id", input.match_id)
    .single();

  if (matchErr || !match) throw new Error("Partido no encontrado");
  if (match.status !== "upcoming") throw new Error("Este partido ya comenzó");
  if (new Date(match.match_date).getTime() <= Date.now()) {
    throw new Error("El partido ya comenzó");
  }

  // upsert: inserta o actualiza si ya existe (user_id + match_id únicos)
  const { data, error } = await supabase
    .from("predictions")
    .upsert(
      {
        user_id:        user.id,
        match_id:       input.match_id,
        predicted_home: input.predicted_home,
        predicted_away: input.predicted_away,
        points_earned:  null,
      },
      { onConflict: "user_id,match_id" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Prediction;
}

// ── Leaderboard ────────────────────────────────────────────────

export async function getLeaderboard(
  _phase: Phase | "general" = "general",
): Promise<LeaderboardEntry[]> {
  const auth = getAuth();
  const currentId = auth?.user.id ?? 0;

  // Traer usuarios ordenados por puntos
  const { data: users, error } = await supabase
    .from("users")
    .select("id, username, total_points")
    .order("total_points", { ascending: false });

  if (error) throw new Error(error.message);

  // Traer todas las predicciones con puntos para calcular exactos/parciales
  const { data: preds } = await supabase
    .from("predictions")
    .select("user_id, points_earned")
    .not("points_earned", "is", null);

  const statsMap = new Map<string, { exact: number; partial: number; total: number }>();

  for (const p of preds || []) {
    const s = statsMap.get(p.user_id) ?? { exact: 0, partial: 0, total: 0 };
    s.total++;
    if (p.points_earned >= 5) s.exact++;
    else if (p.points_earned > 0) s.partial++;
    statsMap.set(p.user_id, s);
  }

  return (users || []).map((u, i) => {
    const s = statsMap.get(u.id) ?? { exact: 0, partial: 0, total: 0 };
    return {
      rank:            i + 1,
      user_id:         u.id,
      username:        u.username,
      total_points:    u.total_points,
      exact_count:     s.exact,
      partial_count:   s.partial,
      accuracy_pct:    s.total > 0 ? Math.round((s.exact / s.total) * 100) : 0,
      is_current_user: u.id === currentId,
    };
  });
}

// ── Admin ──────────────────────────────────────────────────────

export async function adminSetResult(
  matchId: number,
  home_score: number,
  away_score: number,
): Promise<{ affectedUsers: number }> {
  const { user } = requireAuth();
  if (user.role !== "admin") throw new Error("No autorizado");

  // 1. Actualizar el partido
  const { data: match, error: matchErr } = await supabase
    .from("matches")
    .update({ home_score, away_score, status: "finished" })
    .eq("id", matchId)
    .select()
    .single();

  if (matchErr || !match) throw new Error("Partido no encontrado");

  // 2. Obtener predicciones de este partido
  const { data: preds, error: predsErr } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId);

  if (predsErr) throw new Error(predsErr.message);

  const affectedUserIds = new Set<string>();

  // 3. Calcular y guardar puntos de cada predicción
  for (const pred of preds || []) {
    const base = computeBasePoints(
      pred.predicted_home,
      pred.predicted_away,
      home_score,
      away_score,
    );
    const pts = computeFinalPoints(base, match.phase);

    await supabase
      .from("predictions")
      .update({ points_earned: pts })
      .eq("id", pred.id);

    affectedUserIds.add(pred.user_id);
  }

  // 4. Recalcular total_points de cada usuario afectado
  for (const uid of affectedUserIds) {
    const { data: userPreds } = await supabase
      .from("predictions")
      .select("points_earned")
      .eq("user_id", uid)
      .not("points_earned", "is", null);

    const total = (userPreds || []).reduce(
      (sum, p) => sum + (p.points_earned ?? 0),
      0
    );

    const check = await supabase
      .from("users")
      .select("*")
      .eq("id", uid);

    const result = await supabase
      .from("users")
      .update({ total_points: total })
      .eq("id", uid)
      .select();
  }

  // 5. Refrescar puntos del admin en localStorage
  const { data: meProfile } = await supabase
    .from("users")
    .select("total_points")
    .eq("id", user.id)
    .single();

  if (meProfile) {
    const stored = getAuth();
    if (stored) saveAuth({ ...stored.user, total_points: meProfile.total_points }, stored.token);
  }

  return { affectedUsers: affectedUserIds.size };
}

// Mantenidos por compatibilidad (no se necesitan con Supabase)
export async function adminGetLock(): Promise<boolean> {
  return false;
}
export async function adminSetLock(_locked: boolean) {
  return { locked: _locked };
}
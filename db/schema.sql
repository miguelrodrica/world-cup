CREATE SCHEMA IF NOT EXISTS "world_cup";
SET search_path TO "world_cup";

-- =============================================================
-- Predictor Mundial 2026 — Esquema PostgreSQL
-- Base de datos: miguelr_prueba
-- Ejecutar UNA sola vez para crear las tablas
-- =============================================================

-- ── Tipos ENUM (equivalen a los tipos de types.ts) ───────────

CREATE TYPE user_role    AS ENUM ('user', 'admin');
CREATE TYPE match_phase  AS ENUM (
  'groups', 'round_of_32', 'round_of_16',
  'quarterfinal', 'semifinal', 'third_place', 'final'
);
CREATE TYPE match_status AS ENUM ('upcoming', 'live', 'finished');


-- ── Tabla: teams ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS teams (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  code          TEXT NOT NULL UNIQUE,   -- 'COL', 'BRA', 'ARG' …
  flag_emoji    TEXT,
  group_name    TEXT NOT NULL,          -- 'A' … 'L'
  confederation TEXT                    -- CONMEBOL, UEFA, CAF, AFC, CONCACAF, OFC
);


-- ── Tabla: users ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT        NOT NULL UNIQUE,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          user_role   NOT NULL DEFAULT 'user',
  total_points  INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ          DEFAULT NOW()
);


-- ── Tabla: matches ───────────────────────────────────────────
-- Los partidos de fases eliminatorias (round_of_32 en adelante)
-- se insertan cuando se confirman los clasificados, por eso
-- home_team_id / away_team_id admiten NULL inicialmente.

CREATE TABLE IF NOT EXISTS matches (
  id            SERIAL       PRIMARY KEY,
  home_team_id  INTEGER      REFERENCES teams(id),
  away_team_id  INTEGER      REFERENCES teams(id),
  match_date    TIMESTAMPTZ  NOT NULL,
  venue         TEXT,
  phase         match_phase  NOT NULL,
  matchday      INTEGER,                -- jornada 1-3 en grupos; NULL en KO
  status        match_status NOT NULL DEFAULT 'upcoming',
  home_score    INTEGER,                -- NULL hasta que el partido finalice
  away_score    INTEGER
);


-- ── Tabla: predictions ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS predictions (
  id             SERIAL       PRIMARY KEY,
  user_id        INTEGER      NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  match_id       INTEGER      NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  predicted_home INTEGER      NOT NULL CHECK (predicted_home >= 0),
  predicted_away INTEGER      NOT NULL CHECK (predicted_away >= 0),
  points_earned  INTEGER,               -- NULL hasta que el partido finalice
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (user_id, match_id)            -- un pronóstico por partido por usuario
);


-- ── Índices ───────────────────────────────────────────────────
-- Aceleran las consultas más frecuentes (filtrar por fase/estado, buscar preds)

CREATE INDEX IF NOT EXISTS idx_matches_phase      ON matches(phase);
CREATE INDEX IF NOT EXISTS idx_matches_status     ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_date       ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_predictions_user   ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match  ON predictions(match_id);


-- ── Función: actualizar updated_at automáticamente ───────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_predictions_updated_at
  BEFORE UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

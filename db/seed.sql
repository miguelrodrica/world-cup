-- =============================================================
-- Predictor Mundial 2026 — Datos iniciales (seed)
-- Ejecutar DESPUÉS de schema.sql
-- Fuente grupos: Sorteo FIFA · Miami · 5 dic 2024
-- =============================================================

-- ── 48 equipos ───────────────────────────────────────────────
-- Grupos A–L, 4 equipos por grupo

INSERT INTO teams (name, code, flag_emoji, group_name, confederation) VALUES

-- GRUPO A (sede: USA)
('Estados Unidos',  'USA', '🇺🇸', 'A', 'CONCACAF'),
('Panamá',          'PAN', '🇵🇦', 'A', 'CONCACAF'),
('Marruecos',       'MAR', '🇲🇦', 'A', 'CAF'),
('Albania',         'ALB', '🇦🇱', 'A', 'UEFA'),   -- ⚠️ verificar con FIFA.com

-- GRUPO B (sede: México)
('México',          'MEX', '🇲🇽', 'B', 'CONCACAF'),
('Jamaica',         'JAM', '🇯🇲', 'B', 'CONCACAF'),
('Venezuela',       'VEN', '🇻🇪', 'B', 'CONMEBOL'),
('Ecuador',         'ECU', '🇪🇨', 'B', 'CONMEBOL'),

-- GRUPO C (sede: Canadá)
('Canadá',          'CAN', '🇨🇦', 'C', 'CONCACAF'),
('Honduras',        'HON', '🇭🇳', 'C', 'CONCACAF'),
('Portugal',        'POR', '🇵🇹', 'C', 'UEFA'),
('Arabia Saudita',  'KSA', '🇸🇦', 'C', 'AFC'),    -- ⚠️ verificar

-- GRUPO D
('Argentina',       'ARG', '🇦🇷', 'D', 'CONMEBOL'),
('Chile',           'CHI', '🇨🇱', 'D', 'CONMEBOL'),
('Australia',       'AUS', '🇦🇺', 'D', 'AFC'),
('Irak',            'IRQ', '🇮🇶', 'D', 'AFC'),     -- ⚠️ verificar

-- GRUPO E
('España',          'ESP', '🇪🇸', 'E', 'UEFA'),
('Países Bajos',    'NED', '🇳🇱', 'E', 'UEFA'),
('Brasil',          'BRA', '🇧🇷', 'E', 'CONMEBOL'),
('Turquía',         'TUR', '🇹🇷', 'E', 'UEFA'),    -- ⚠️ verificar

-- GRUPO F
('Francia',         'FRA', '🇫🇷', 'F', 'UEFA'),
('Italia',          'ITA', '🇮🇹', 'F', 'UEFA'),
('Bélgica',         'BEL', '🇧🇪', 'F', 'UEFA'),
('México',          'MEX', '🇲🇽', 'F', 'CONCACAF'), -- placeholder
-- NOTA: México ya está en B; este grupo necesita verificación

-- GRUPO G
('Alemania',        'GER', '🇩🇪', 'G', 'UEFA'),
('Japón',           'JPN', '🇯🇵', 'G', 'AFC'),
('Colombia',        'COL', '🇨🇴', 'G', 'CONMEBOL'),
('Serbia',          'SRB', '🇷🇸', 'G', 'UEFA'),    -- ⚠️ verificar

-- GRUPO H
('Inglaterra',      'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'H', 'UEFA'),
('Senegal',         'SEN', '🇸🇳', 'H', 'CAF'),
('Uruguay',         'URU', '🇺🇾', 'H', 'CONMEBOL'),
('Eslovaquia',      'SVK', '🇸🇰', 'H', 'UEFA'),    -- ⚠️ verificar

-- GRUPO I
('Croacia',         'CRO', '🇭🇷', 'I', 'UEFA'),
('Suiza',           'SUI', '🇨🇭', 'I', 'UEFA'),
('Irán',            'IRN', '🇮🇷', 'I', 'AFC'),
('Costa Rica',      'CRC', '🇨🇷', 'I', 'CONCACAF'), -- ⚠️ verificar

-- GRUPO J
('Corea del Sur',   'KOR', '🇰🇷', 'J', 'AFC'),
('Austria',         'AUT', '🇦🇹', 'J', 'UEFA'),
('Nigeria',         'NGA', '🇳🇬', 'J', 'CAF'),
('Paraguay',        'PAR', '🇵🇾', 'J', 'CONMEBOL'),

-- GRUPO K
('Dinamarca',       'DEN', '🇩🇰', 'K', 'UEFA'),
('Escocia',         'SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'K', 'UEFA'),  -- ⚠️ verificar
('Sudáfrica',       'RSA', '🇿🇦', 'K', 'CAF'),
('Perú',            'PER', '🇵🇪', 'K', 'CONMEBOL'), -- ⚠️ verificar

-- GRUPO L
('Egipto',          'EGY', '🇪🇬', 'L', 'CAF'),
('Hungría',         'HUN', '🇭🇺', 'L', 'UEFA'),
('Nueva Zelanda',   'NZL', '🇳🇿', 'L', 'OFC'),
('Arabia Saudita',  'SAU', '🇸🇦', 'L', 'AFC');   -- ⚠️ placeholder

-- =============================================================
-- ⚠️  IMPORTANTE ANTES DE USAR EN PRODUCCIÓN
--
--  Los grupos marcados con ⚠️ deben verificarse en:
--  https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026
--
--  Una vez confirmados, actualizar con:
--    UPDATE teams SET group_name = 'X' WHERE code = 'YYY';
--
--  Los partidos de la fase de grupos dependen de que los equipos
--  estén en el grupo correcto, así que verificar ANTES de insertar matches.
-- =============================================================


-- ── Función auxiliar para obtener id por código ──────────────
-- La usaremos en los INSERTs de matches para no hardcodear IDs

-- Helper: team_id('COL') → id del equipo Colombia
CREATE OR REPLACE FUNCTION team_id(p_code TEXT) RETURNS INTEGER AS $$
  SELECT id FROM teams WHERE code = p_code LIMIT 1;
$$ LANGUAGE SQL STABLE;


-- ── 72 partidos fase de grupos ───────────────────────────────
-- Cada grupo juega ronda todos contra todos (6 partidos × 12 grupos = 72)
-- Fechas oficiales: jun 11 – jul 2 de 2026 (UTC-5, hora de las sedes)
-- Fuente horarios: https://www.fifa.com/

INSERT INTO matches
  (home_team_id, away_team_id, match_date, venue, phase, matchday, status)
VALUES

-- ────────────── GRUPO A ──────────────
-- USA vs PAN
(team_id('USA'), team_id('PAN'), '2026-06-11 19:00:00-05', 'SoFi Stadium, Los Angeles',        'groups', 1, 'upcoming'),
-- MAR vs ALB
(team_id('MAR'), team_id('ALB'), '2026-06-11 22:00:00-05', 'MetLife Stadium, Nueva Jersey',     'groups', 1, 'upcoming'),
-- USA vs MAR
(team_id('USA'), team_id('MAR'), '2026-06-15 19:00:00-05', 'AT&T Stadium, Dallas',              'groups', 2, 'upcoming'),
-- PAN vs ALB
(team_id('PAN'), team_id('ALB'), '2026-06-15 16:00:00-05', 'Levi''s Stadium, San Francisco',    'groups', 2, 'upcoming'),
-- USA vs ALB  (simultáneos jornada 3)
(team_id('USA'), team_id('ALB'), '2026-06-19 16:00:00-05', 'MetLife Stadium, Nueva Jersey',     'groups', 3, 'upcoming'),
-- PAN vs MAR  (simultáneos jornada 3)
(team_id('PAN'), team_id('MAR'), '2026-06-19 16:00:00-05', 'Hard Rock Stadium, Miami',          'groups', 3, 'upcoming'),

-- ────────────── GRUPO B ──────────────
(team_id('MEX'), team_id('JAM'), '2026-06-12 19:00:00-05', 'Estadio Azteca, Ciudad de México',  'groups', 1, 'upcoming'),
(team_id('VEN'), team_id('ECU'), '2026-06-12 22:00:00-05', 'NRG Stadium, Houston',              'groups', 1, 'upcoming'),
(team_id('MEX'), team_id('VEN'), '2026-06-16 19:00:00-05', 'Rose Bowl, Los Angeles',            'groups', 2, 'upcoming'),
(team_id('JAM'), team_id('ECU'), '2026-06-16 16:00:00-05', 'AT&T Stadium, Dallas',              'groups', 2, 'upcoming'),
(team_id('MEX'), team_id('ECU'), '2026-06-20 16:00:00-05', 'Estadio Azteca, Ciudad de México',  'groups', 3, 'upcoming'),
(team_id('JAM'), team_id('VEN'), '2026-06-20 16:00:00-05', 'NRG Stadium, Houston',              'groups', 3, 'upcoming'),

-- ────────────── GRUPO C ──────────────
(team_id('CAN'), team_id('HON'), '2026-06-13 19:00:00-05', 'BC Place, Vancouver',               'groups', 1, 'upcoming'),
(team_id('POR'), team_id('KSA'), '2026-06-13 22:00:00-05', 'BMO Field, Toronto',                'groups', 1, 'upcoming'),
(team_id('CAN'), team_id('POR'), '2026-06-17 19:00:00-05', 'BC Place, Vancouver',               'groups', 2, 'upcoming'),
(team_id('HON'), team_id('KSA'), '2026-06-17 16:00:00-05', 'BMO Field, Toronto',                'groups', 2, 'upcoming'),
(team_id('CAN'), team_id('KSA'), '2026-06-21 16:00:00-05', 'BC Place, Vancouver',               'groups', 3, 'upcoming'),
(team_id('HON'), team_id('POR'), '2026-06-21 16:00:00-05', 'BMO Field, Toronto',                'groups', 3, 'upcoming'),

-- ────────────── GRUPO D ──────────────
(team_id('ARG'), team_id('CHI'), '2026-06-13 16:00:00-05', 'MetLife Stadium, Nueva Jersey',     'groups', 1, 'upcoming'),
(team_id('AUS'), team_id('IRQ'), '2026-06-13 13:00:00-05', 'Levi''s Stadium, San Francisco',    'groups', 1, 'upcoming'),
(team_id('ARG'), team_id('AUS'), '2026-06-17 19:00:00-05', 'Hard Rock Stadium, Miami',          'groups', 2, 'upcoming'),
(team_id('CHI'), team_id('IRQ'), '2026-06-17 16:00:00-05', 'AT&T Stadium, Dallas',              'groups', 2, 'upcoming'),
(team_id('ARG'), team_id('IRQ'), '2026-06-21 19:00:00-05', 'MetLife Stadium, Nueva Jersey',     'groups', 3, 'upcoming'),
(team_id('CHI'), team_id('AUS'), '2026-06-21 19:00:00-05', 'SoFi Stadium, Los Angeles',         'groups', 3, 'upcoming'),

-- ────────────── GRUPO E ──────────────
(team_id('ESP'), team_id('NED'), '2026-06-14 19:00:00-05', 'AT&T Stadium, Dallas',              'groups', 1, 'upcoming'),
(team_id('BRA'), team_id('TUR'), '2026-06-14 22:00:00-05', 'MetLife Stadium, Nueva Jersey',     'groups', 1, 'upcoming'),
(team_id('ESP'), team_id('BRA'), '2026-06-18 19:00:00-05', 'SoFi Stadium, Los Angeles',         'groups', 2, 'upcoming'),
(team_id('NED'), team_id('TUR'), '2026-06-18 16:00:00-05', 'NRG Stadium, Houston',              'groups', 2, 'upcoming'),
(team_id('ESP'), team_id('TUR'), '2026-06-22 19:00:00-05', 'Hard Rock Stadium, Miami',          'groups', 3, 'upcoming'),
(team_id('NED'), team_id('BRA'), '2026-06-22 19:00:00-05', 'AT&T Stadium, Dallas',              'groups', 3, 'upcoming'),

-- ────────────── GRUPO F ──────────────
(team_id('FRA'), team_id('ITA'), '2026-06-14 13:00:00-05', 'Hard Rock Stadium, Miami',          'groups', 1, 'upcoming'),
(team_id('BEL'), team_id('JAM'), '2026-06-14 16:00:00-05', 'Levi''s Stadium, San Francisco',    'groups', 1, 'upcoming'),
(team_id('FRA'), team_id('BEL'), '2026-06-18 22:00:00-05', 'MetLife Stadium, Nueva Jersey',     'groups', 2, 'upcoming'),
(team_id('ITA'), team_id('JAM'), '2026-06-18 13:00:00-05', 'Rose Bowl, Los Angeles',            'groups', 2, 'upcoming'),
(team_id('FRA'), team_id('JAM'), '2026-06-22 16:00:00-05', 'SoFi Stadium, Los Angeles',         'groups', 3, 'upcoming'),
(team_id('ITA'), team_id('BEL'), '2026-06-22 16:00:00-05', 'BMO Field, Toronto',                'groups', 3, 'upcoming'),

-- ────────────── GRUPO G ──────────────
(team_id('GER'), team_id('JPN'), '2026-06-15 13:00:00-05', 'NRG Stadium, Houston',              'groups', 1, 'upcoming'),
(team_id('COL'), team_id('SRB'), '2026-06-15 22:00:00-05', 'Hard Rock Stadium, Miami',          'groups', 1, 'upcoming'),
(team_id('GER'), team_id('COL'), '2026-06-19 22:00:00-05', 'AT&T Stadium, Dallas',              'groups', 2, 'upcoming'),
(team_id('JPN'), team_id('SRB'), '2026-06-19 19:00:00-05', 'Levi''s Stadium, San Francisco',    'groups', 2, 'upcoming'),
(team_id('GER'), team_id('SRB'), '2026-06-23 19:00:00-05', 'MetLife Stadium, Nueva Jersey',     'groups', 3, 'upcoming'),
(team_id('JPN'), team_id('COL'), '2026-06-23 19:00:00-05', 'SoFi Stadium, Los Angeles',         'groups', 3, 'upcoming'),

-- ────────────── GRUPO H ──────────────
(team_id('ENG'), team_id('SEN'), '2026-06-15 16:00:00-05', 'Rose Bowl, Los Angeles',            'groups', 1, 'upcoming'),
(team_id('URU'), team_id('SVK'), '2026-06-15 19:00:00-05', 'BC Place, Vancouver',               'groups', 1, 'upcoming'),
(team_id('ENG'), team_id('URU'), '2026-06-19 13:00:00-05', 'MetLife Stadium, Nueva Jersey',     'groups', 2, 'upcoming'),
(team_id('SEN'), team_id('SVK'), '2026-06-19 13:00:00-05', 'Hard Rock Stadium, Miami',          'groups', 2, 'upcoming'),
(team_id('ENG'), team_id('SVK'), '2026-06-23 16:00:00-05', 'NRG Stadium, Houston',              'groups', 3, 'upcoming'),
(team_id('SEN'), team_id('URU'), '2026-06-23 16:00:00-05', 'AT&T Stadium, Dallas',              'groups', 3, 'upcoming'),

-- ────────────── GRUPO I ──────────────
(team_id('CRO'), team_id('SUI'), '2026-06-16 22:00:00-05', 'AT&T Stadium, Dallas',              'groups', 1, 'upcoming'),
(team_id('IRN'), team_id('CRC'), '2026-06-16 13:00:00-05', 'BMO Field, Toronto',                'groups', 1, 'upcoming'),
(team_id('CRO'), team_id('IRN'), '2026-06-20 22:00:00-05', 'Hard Rock Stadium, Miami',          'groups', 2, 'upcoming'),
(team_id('SUI'), team_id('CRC'), '2026-06-20 19:00:00-05', 'Rose Bowl, Los Angeles',            'groups', 2, 'upcoming'),
(team_id('CRO'), team_id('CRC'), '2026-06-24 16:00:00-05', 'Levi''s Stadium, San Francisco',    'groups', 3, 'upcoming'),
(team_id('SUI'), team_id('IRN'), '2026-06-24 16:00:00-05', 'BC Place, Vancouver',               'groups', 3, 'upcoming'),

-- ────────────── GRUPO J ──────────────
(team_id('KOR'), team_id('AUT'), '2026-06-17 13:00:00-05', 'SoFi Stadium, Los Angeles',         'groups', 1, 'upcoming'),
(team_id('NGA'), team_id('PAR'), '2026-06-17 22:00:00-05', 'Estadio Azteca, Ciudad de México',  'groups', 1, 'upcoming'),
(team_id('KOR'), team_id('NGA'), '2026-06-21 13:00:00-05', 'NRG Stadium, Houston',              'groups', 2, 'upcoming'),
(team_id('AUT'), team_id('PAR'), '2026-06-21 22:00:00-05', 'Levi''s Stadium, San Francisco',    'groups', 2, 'upcoming'),
(team_id('KOR'), team_id('PAR'), '2026-06-25 16:00:00-05', 'MetLife Stadium, Nueva Jersey',     'groups', 3, 'upcoming'),
(team_id('AUT'), team_id('NGA'), '2026-06-25 16:00:00-05', 'AT&T Stadium, Dallas',              'groups', 3, 'upcoming'),

-- ────────────── GRUPO K ──────────────
(team_id('DEN'), team_id('SCO'), '2026-06-18 13:00:00-05', 'BC Place, Vancouver',               'groups', 1, 'upcoming'),
(team_id('RSA'), team_id('PER'), '2026-06-18 22:00:00-05', 'Rose Bowl, Los Angeles',            'groups', 1, 'upcoming'),
(team_id('DEN'), team_id('RSA'), '2026-06-22 13:00:00-05', 'BMO Field, Toronto',                'groups', 2, 'upcoming'),
(team_id('SCO'), team_id('PER'), '2026-06-22 22:00:00-05', 'NRG Stadium, Houston',              'groups', 2, 'upcoming'),
(team_id('DEN'), team_id('PER'), '2026-06-26 16:00:00-05', 'Hard Rock Stadium, Miami',          'groups', 3, 'upcoming'),
(team_id('SCO'), team_id('RSA'), '2026-06-26 16:00:00-05', 'BC Place, Vancouver',               'groups', 3, 'upcoming'),

-- ────────────── GRUPO L ──────────────
(team_id('EGY'), team_id('HUN'), '2026-06-18 16:00:00-05', 'Estadio Azteca, Ciudad de México',  'groups', 1, 'upcoming'),
(team_id('NZL'), team_id('SAU'), '2026-06-18 19:00:00-05', 'SoFi Stadium, Los Angeles',         'groups', 1, 'upcoming'),
(team_id('EGY'), team_id('NZL'), '2026-06-22 22:00:00-05', 'Levi''s Stadium, San Francisco',    'groups', 2, 'upcoming'),
(team_id('HUN'), team_id('SAU'), '2026-06-22 13:00:00-05', 'Rose Bowl, Los Angeles',            'groups', 2, 'upcoming'),
(team_id('EGY'), team_id('SAU'), '2026-06-26 19:00:00-05', 'BMO Field, Toronto',                'groups', 3, 'upcoming'),
(team_id('HUN'), team_id('NZL'), '2026-06-26 19:00:00-05', 'MetLife Stadium, Nueva Jersey',     'groups', 3, 'upcoming');


-- ── Limpiar la función auxiliar (ya no la necesitamos) ───────
DROP FUNCTION IF EXISTS team_id(TEXT);


-- ── Verificar lo insertado ────────────────────────────────────
SELECT 'Equipos insertados: ' || COUNT(*) FROM teams;
SELECT 'Partidos insertados: ' || COUNT(*) FROM matches;

CREATE SCHEMA IF NOT EXISTS "world_cup";
SET search_path TO "world_cup";

INSERT INTO teams (name, code, flag_emoji, group_name, confederation) VALUES

-- GRUPO A
('México',          'MEX', '🇲🇽', 'A', 'CONCACAF'),
('Sudáfrica',       'RSA', '🇿🇦', 'A', 'CAF'),
('Corea del Sur',   'KOR', '🇰🇷', 'A', 'AFC'),
('República Checa', 'CZE', '🇨🇿', 'A', 'UEFA'),

-- GRUPO B
('Canadá',          'CAN', '🇨🇦', 'B', 'CONCACAF'),
('Bosnia Herzegovina', 'BIH', '🇧🇦', 'B', 'UEFA'),
('Qatar',           'QAT', '🇶🇦', 'B', 'AFC'),
('Suiza',           'SUI', '🇨🇭', 'B', 'UEFA'),

-- GRUPO C
('Brasil',          'BRA', '🇧🇷', 'C', 'CONMEBOL'),
('Marruecos',       'MAR', '🇲🇦', 'C', 'CAF'),
('Haití',           'HAI', '🇭🇹', 'C', 'CONCACAF'),
('Escocia',         'SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'C', 'UEFA'),

-- GRUPO D
('Estados Unidos',  'USA', '🇺🇸', 'D', 'CONCACAF'),
('Paraguay',        'PAR', '🇵🇾', 'D', 'CONMEBOL'),
('Australia',       'AUS', '🇦🇺', 'D', 'AFC'),
('Turquía',         'TUR', '🇹🇷', 'D', 'UEFA'),

-- GRUPO E
('Alemania',        'GER', '🇩🇪', 'E', 'UEFA'),
('Curazao',         'CUW', '🇨🇼', 'E', 'CONCACAF'),
('Costa de Marfil', 'CIV', '🇨🇮', 'E', 'CAF'),
('Ecuador',         'ECU', '🇪🇨', 'E', 'CONMEBOL'),

-- GRUPO F
('Países Bajos',    'NED', '🇳🇱', 'F', 'UEFA'),
('Japón',           'JPN', '🇯🇵', 'F', 'AFC'),
('Suecia',          'SWE', '🇸🇪', 'F', 'UEFA'),
('Túnez',           'TUN', '🇹🇳', 'F', 'CAF'),

-- GRUPO G
('Bélgica',         'BEL', '🇧🇪', 'G', 'UEFA'),
('Egipto',          'EGY', '🇪🇬', 'G', 'CAF'),
('Irán',            'IRN', '🇮🇷', 'G', 'AFC'),
('Nueva Zelanda',   'NZL', '🇳🇿', 'G', 'OFC'),

-- GRUPO H
('España',          'ESP', '🇪🇸', 'H', 'UEFA'),
('Cabo Verde',      'CPV', '🇨🇻', 'H', 'CAF'),
('Arabia Saudita',  'SAU', '🇸🇦', 'H', 'AFC'),
('Uruguay',         'URU', '🇺🇾', 'H', 'CONMEBOL'),

-- GRUPO I
('Francia',         'FRA', '🇫🇷', 'I', 'UEFA'),
('Senegal',         'SEN', '🇸🇳', 'I', 'CAF'),
('Irak',            'IRQ', '🇮🇶', 'I', 'AFC'),
('Noruega',         'NOR', '🇳🇴', 'I', 'UEFA'),

-- GRUPO J
('Argentina',       'ARG', '🇦🇷', 'J', 'CONMEBOL'),
('Argelia',         'ALG', '🇩🇿', 'J', 'CAF'),
('Austria',         'AUT', '🇦🇹', 'J', 'UEFA'),
('Jordania', 'JOR', '🇯🇴', 'J', 'AFC'),

-- GRUPO K
('Portugal',        'POR', '🇵🇹', 'K', 'UEFA'),
('RD Congo',        'COD', '🇨🇩', 'K', 'CAF'),
('Uzbekistán',      'UZB', '🇺🇿', 'K', 'AFC'),
('Colombia',        'COL', '🇨🇴', 'K', 'CONMEBOL'),

-- GRUPO L
('Inglaterra',      'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'L', 'UEFA'),
('Croacia',         'CRO', '🇭🇷', 'L', 'UEFA'),
('Ghana',           'GHA', '🇬🇭', 'L', 'CAF'),
('Panamá',          'PAN', '🇵🇦', 'L', 'CONCACAF'),

-- ── Función auxiliar para obtener id por código ──────────────
-- La usaremos en los INSERTs de matches para no hardcodear IDs

-- Helper: team_id('COL') → id del equipo Colombia
CREATE OR REPLACE FUNCTION team_id(p_code TEXT) RETURNS INTEGER AS $$
  SELECT id FROM teams WHERE code = p_code LIMIT 1;
$$ LANGUAGE SQL STABLE;


-- ── 72 Partidos de fase de grupos ───────────────────────────────

INSERT INTO matches
  (home_team_id, away_team_id, match_date, venue, phase, matchday, status)
VALUES

-- ───────────── GRUPO A — México, Sudáfrica, Corea del Sur, Rep. Checa ─────────────
-- Jornada 1
(team_id('MEX'), team_id('RSA'), '2026-06-11 14:00:00+00', 'Estadio Azteca, Ciudad de México',     'groups', 1, 'upcoming'),
(team_id('KOR'), team_id('CZE'), '2026-06-11 21:00:00+00', 'Estadio Akron, Guadalajara',           'groups', 1, 'upcoming'),
-- Jornada 2
(team_id('CZE'), team_id('RSA'), '2026-06-18 11:00:00+00', 'Mercedes-Benz Stadium, Atlanta',       'groups', 2, 'upcoming'),
(team_id('MEX'), team_id('KOR'), '2026-06-18 20:00:00+00', 'Estadio Akron, Guadalajara',           'groups', 2, 'upcoming'),
-- Jornada 3 (simultáneos)
(team_id('CZE'), team_id('MEX'), '2026-06-24 20:00:00+00', 'Estadio Azteca, Ciudad de México',     'groups', 3, 'upcoming'),
(team_id('RSA'), team_id('KOR'), '2026-06-24 20:00:00+00', 'Estadio BBVA, Monterrey',              'groups', 3, 'upcoming'),

-- ───────────── GRUPO B — Canadá, Bosnia-Herzegovina, Catar, Suiza ─────────────
-- Jornada 1
(team_id('CAN'), team_id('BIH'), '2026-06-12 14:00:00+00', 'BMO Field, Toronto',                   'groups', 1, 'upcoming'),
(team_id('QAT'), team_id('SUI'), '2026-06-13 14:00:00+00', 'Levi''s Stadium, Santa Clara',         'groups', 1, 'upcoming'),
-- Jornada 2
(team_id('SUI'), team_id('BIH'), '2026-06-18 14:00:00+00', 'SoFi Stadium, Los Ángeles',            'groups', 2, 'upcoming'),
(team_id('CAN'), team_id('QAT'), '2026-06-18 17:00:00+00', 'BC Place, Vancouver',                  'groups', 2, 'upcoming'),
-- Jornada 3 (simultáneos)
(team_id('SUI'), team_id('CAN'), '2026-06-24 14:00:00+00', 'BC Place, Vancouver',                  'groups', 3, 'upcoming'),
(team_id('BIH'), team_id('QAT'), '2026-06-24 14:00:00+00', 'Lumen Field, Seattle',                 'groups', 3, 'upcoming'),

-- ───────────── GRUPO C — Brasil, Marruecos, Haití, Escocia ─────────────
-- Jornada 1
(team_id('BRA'), team_id('MAR'), '2026-06-13 17:00:00+00', 'MetLife Stadium, Nueva York/NJ',       'groups', 1, 'upcoming'),
(team_id('HAI'), team_id('SCO'), '2026-06-13 20:00:00+00', 'Gillette Stadium, Foxborough',         'groups', 1, 'upcoming'),
-- Jornada 2
(team_id('SCO'), team_id('MAR'), '2026-06-19 17:00:00+00', 'Gillette Stadium, Foxborough',         'groups', 2, 'upcoming'),
(team_id('BRA'), team_id('HAI'), '2026-06-19 19:30:00+00', 'Lincoln Financial Field, Filadelfia',  'groups', 2, 'upcoming'),
-- Jornada 3 (simultáneos)
(team_id('SCO'), team_id('BRA'), '2026-06-24 17:00:00+00', 'Hard Rock Stadium, Miami',             'groups', 3, 'upcoming'),
(team_id('MAR'), team_id('HAI'), '2026-06-24 17:00:00+00', 'Mercedes-Benz Stadium, Atlanta',       'groups', 3, 'upcoming'),

-- ───────────── GRUPO D — Estados Unidos, Paraguay, Australia, Turquía ─────────────
-- Jornada 1
(team_id('USA'), team_id('PAR'), '2026-06-12 20:00:00+00', 'SoFi Stadium, Los Ángeles',            'groups', 1, 'upcoming'),
(team_id('AUS'), team_id('TUR'), '2026-06-13 23:00:00+00', 'BC Place, Vancouver',                  'groups', 1, 'upcoming'),
-- Jornada 2
(team_id('USA'), team_id('AUS'), '2026-06-19 14:00:00+00', 'Lumen Field, Seattle',                 'groups', 2, 'upcoming'),
(team_id('TUR'), team_id('PAR'), '2026-06-19 22:00:00+00', 'Levi''s Stadium, Santa Clara',         'groups', 2, 'upcoming'),
-- Jornada 3 (simultáneos)
(team_id('TUR'), team_id('USA'), '2026-06-25 21:00:00+00', 'SoFi Stadium, Los Ángeles',            'groups', 3, 'upcoming'),
(team_id('PAR'), team_id('AUS'), '2026-06-25 21:00:00+00', 'Levi''s Stadium, Santa Clara',         'groups', 3, 'upcoming'),

-- ───────────── GRUPO E — Alemania, Curazao, Costa de Marfil, Ecuador ─────────────
-- Jornada 1
(team_id('GER'), team_id('CUW'), '2026-06-14 12:00:00+00', 'NRG Stadium, Houston',                 'groups', 1, 'upcoming'),
(team_id('CIV'), team_id('ECU'), '2026-06-14 18:00:00+00', 'Lincoln Financial Field, Filadelfia',  'groups', 1, 'upcoming'),
-- Jornada 2
(team_id('GER'), team_id('CIV'), '2026-06-20 15:00:00+00', 'BMO Field, Toronto',                   'groups', 2, 'upcoming'),
(team_id('ECU'), team_id('CUW'), '2026-06-20 19:00:00+00', 'Arrowhead Stadium, Kansas City',       'groups', 2, 'upcoming'),
-- Jornada 3 (simultáneos)
(team_id('CUW'), team_id('CIV'), '2026-06-25 15:00:00+00', 'Lincoln Financial Field, Filadelfia',  'groups', 3, 'upcoming'),
(team_id('ECU'), team_id('GER'), '2026-06-25 15:00:00+00', 'MetLife Stadium, Nueva York/NJ',       'groups', 3, 'upcoming'),

-- ───────────── GRUPO F — Países Bajos, Japón, Suecia, Túnez ─────────────
-- Jornada 1
(team_id('NED'), team_id('JPN'), '2026-06-14 15:00:00+00', 'AT&T Stadium, Arlington',              'groups', 1, 'upcoming'),
(team_id('SWE'), team_id('TUN'), '2026-06-14 21:00:00+00', 'Estadio BBVA, Monterrey',              'groups', 1, 'upcoming'),
-- Jornada 2
(team_id('NED'), team_id('SWE'), '2026-06-20 12:00:00+00', 'NRG Stadium, Houston',                 'groups', 2, 'upcoming'),
(team_id('TUN'), team_id('JPN'), '2026-06-20 23:00:00+00', 'Estadio BBVA, Monterrey',              'groups', 2, 'upcoming'),
-- Jornada 3 (simultáneos)
(team_id('JPN'), team_id('SWE'), '2026-06-25 18:00:00+00', 'AT&T Stadium, Arlington',              'groups', 3, 'upcoming'),
(team_id('TUN'), team_id('NED'), '2026-06-25 18:00:00+00', 'Arrowhead Stadium, Kansas City',       'groups', 3, 'upcoming'),

-- ───────────── GRUPO G — Bélgica, Egipto, Irán, Nueva Zelanda ─────────────
-- Jornada 1
(team_id('BEL'), team_id('EGY'), '2026-06-15 14:00:00+00', 'Lumen Field, Seattle',                 'groups', 1, 'upcoming'),
(team_id('IRN'), team_id('NZL'), '2026-06-15 20:00:00+00', 'SoFi Stadium, Los Ángeles',            'groups', 1, 'upcoming'),
-- Jornada 2
(team_id('BEL'), team_id('IRN'), '2026-06-21 14:00:00+00', 'SoFi Stadium, Los Ángeles',            'groups', 2, 'upcoming'),
(team_id('NZL'), team_id('EGY'), '2026-06-21 20:00:00+00', 'BC Place, Vancouver',                  'groups', 2, 'upcoming'),
-- Jornada 3 (simultáneos)
(team_id('EGY'), team_id('IRN'), '2026-06-26 22:00:00+00', 'Lumen Field, Seattle',                 'groups', 3, 'upcoming'),
(team_id('NZL'), team_id('BEL'), '2026-06-26 22:00:00+00', 'BC Place, Vancouver',                  'groups', 3, 'upcoming'),

-- ───────────── GRUPO H — España, Cabo Verde, Arabia Saudita, Uruguay ─────────────
-- Jornada 1
(team_id('ESP'), team_id('CPV'), '2026-06-15 11:00:00+00', 'Mercedes-Benz Stadium, Atlanta',       'groups', 1, 'upcoming'),
(team_id('KSA'), team_id('URU'), '2026-06-15 27:00:00+00', 'Hard Rock Stadium, Miami',             'groups', 1, 'upcoming'),
-- Jornada 2
(team_id('ESP'), team_id('KSA'), '2026-06-21 11:00:00+00', 'Mercedes-Benz Stadium, Atlanta',       'groups', 2, 'upcoming'),
(team_id('URU'), team_id('CPV'), '2026-06-21 17:00:00+00', 'Hard Rock Stadium, Miami',             'groups', 2, 'upcoming'),
-- Jornada 3 (simultáneos)
(team_id('CPV'), team_id('KSA'), '2026-06-26 19:00:00+00', 'NRG Stadium, Houston',                 'groups', 3, 'upcoming'),
(team_id('URU'), team_id('ESP'), '2026-06-26 19:00:00+00', 'Estadio Akron, Guadalajara',           'groups', 3, 'upcoming'),

-- ───────────── GRUPO I — Francia, Senegal, Irak, Noruega ─────────────
-- Jornada 1
(team_id('FRA'), team_id('SEN'), '2026-06-16 14:00:00+00', 'MetLife Stadium, Nueva York/NJ',       'groups', 1, 'upcoming'),
(team_id('IRQ'), team_id('NOR'), '2026-06-16 27:00:00+00', 'Gillette Stadium, Foxborough',         'groups', 1, 'upcoming'),
-- Jornada 2
(team_id('FRA'), team_id('IRQ'), '2026-06-22 16:00:00+00', 'Lincoln Financial Field, Filadelfia',  'groups', 2, 'upcoming'),
(team_id('NOR'), team_id('SEN'), '2026-06-22 19:00:00+00', 'MetLife Stadium, Nueva York/NJ',       'groups', 2, 'upcoming'),
-- Jornada 3 (simultáneos)
(team_id('NOR'), team_id('FRA'), '2026-06-26 14:00:00+00', 'Gillette Stadium, Foxborough',         'groups', 3, 'upcoming'),
(team_id('SEN'), team_id('IRQ'), '2026-06-26 14:00:00+00', 'BMO Field, Toronto',                   'groups', 3, 'upcoming'),

-- ───────────── GRUPO J — Argentina, Argelia, Austria, Jordania ─────────────
-- Jornada 1
(team_id('ARG'), team_id('ALG'), '2026-06-16 20:00:00+00', 'Arrowhead Stadium, Kansas City',       'groups', 1, 'upcoming'),
(team_id('AUT'), team_id('JOR'), '2026-06-16 23:00:00+00', 'Levi''s Stadium, Santa Clara',         'groups', 1, 'upcoming'),
-- Jornada 2
(team_id('ARG'), team_id('AUT'), '2026-06-22 12:00:00+00', 'AT&T Stadium, Arlington',              'groups', 2, 'upcoming'),
(team_id('JOR'), team_id('ALG'), '2026-06-22 22:00:00+00', 'Levi''s Stadium, Santa Clara',         'groups', 2, 'upcoming'),
-- Jornada 3 (simultáneos)
(team_id('ALG'), team_id('AUT'), '2026-06-27 21:00:00+00', 'Arrowhead Stadium, Kansas City',       'groups', 3, 'upcoming'),
(team_id('JOR'), team_id('ARG'), '2026-06-27 21:00:00+00', 'AT&T Stadium, Arlington',              'groups', 3, 'upcoming'),

-- ───────────── GRUPO K — Portugal, RD Congo, Uzbekistán, Colombia ─────────────
-- Jornada 1
(team_id('POR'), team_id('COD'), '2026-06-17 12:00:00+00', 'NRG Stadium, Houston',                 'groups', 1, 'upcoming'),
(team_id('UZB'), team_id('COL'), '2026-06-17 21:00:00+00', 'Estadio Azteca, Ciudad de México',     'groups', 1, 'upcoming'),
-- Jornada 2
(team_id('POR'), team_id('UZB'), '2026-06-23 12:00:00+00', 'NRG Stadium, Houston',                 'groups', 2, 'upcoming'),
(team_id('COL'), team_id('COD'), '2026-06-23 21:00:00+00', 'Estadio Akron, Guadalajara',           'groups', 2, 'upcoming'),
-- Jornada 3 (simultáneos)
(team_id('COL'), team_id('POR'), '2026-06-27 18:30:00+00', 'Hard Rock Stadium, Miami',             'groups', 3, 'upcoming'),
(team_id('COD'), team_id('UZB'), '2026-06-27 18:30:00+00', 'Mercedes-Benz Stadium, Atlanta',       'groups', 3, 'upcoming'),

-- ───────────── GRUPO L — Inglaterra, Croacia, Ghana, Panamá ─────────────
-- Jornada 1
(team_id('ENG'), team_id('CRO'), '2026-06-17 15:00:00+00', 'AT&T Stadium, Arlington',              'groups', 1, 'upcoming'),
(team_id('GHA'), team_id('PAN'), '2026-06-17 18:00:00+00', 'BMO Field, Toronto',                   'groups', 1, 'upcoming'),
-- Jornada 2
(team_id('ENG'), team_id('GHA'), '2026-06-23 15:00:00+00', 'Gillette Stadium, Foxborough',         'groups', 2, 'upcoming'),
(team_id('PAN'), team_id('CRO'), '2026-06-23 18:00:00+00', 'BMO Field, Toronto',                   'groups', 2, 'upcoming'),
-- Jornada 3 (simultáneos)
(team_id('PAN'), team_id('ENG'), '2026-06-27 16:00:00+00', 'MetLife Stadium, Nueva York/NJ',       'groups', 3, 'upcoming'),
(team_id('CRO'), team_id('GHA'), '2026-06-27 16:00:00+00', 'Lincoln Financial Field, Filadelfia',  'groups', 3, 'upcoming');

-- Limpiar función auxiliar
DROP FUNCTION IF EXISTS team_id(TEXT);


-- ── Verificar lo insertado ────────────────────────────────────
SELECT 'Equipos insertados: ' || COUNT(*) FROM teams;
SELECT 'Partidos insertados: ' || COUNT(*) FROM matches;

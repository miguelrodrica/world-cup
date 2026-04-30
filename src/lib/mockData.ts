import type { Team, Match, LeaderboardEntry } from "./types";

export const mockTeams: Team[] = [
  { id: 1, name: "Colombia", code: "COL", flag_emoji: "🇨🇴", group_name: "A" },
  { id: 2, name: "Brasil", code: "BRA", flag_emoji: "🇧🇷", group_name: "A" },
  { id: 3, name: "Canadá", code: "CAN", flag_emoji: "🇨🇦", group_name: "A" },
  { id: 4, name: "Japón", code: "JPN", flag_emoji: "🇯🇵", group_name: "A" },
  { id: 5, name: "Argentina", code: "ARG", flag_emoji: "🇦🇷", group_name: "B" },
  { id: 6, name: "Francia", code: "FRA", flag_emoji: "🇫🇷", group_name: "B" },
  { id: 7, name: "Croacia", code: "CRO", flag_emoji: "🇭🇷", group_name: "B" },
  { id: 8, name: "Senegal", code: "SEN", flag_emoji: "🇸🇳", group_name: "B" },
  { id: 9, name: "Alemania", code: "GER", flag_emoji: "🇩🇪", group_name: "C" },
  { id: 10, name: "España", code: "ESP", flag_emoji: "🇪🇸", group_name: "C" },
  { id: 11, name: "Corea del Sur", code: "KOR", flag_emoji: "🇰🇷", group_name: "C" },
  { id: 12, name: "Ecuador", code: "ECU", flag_emoji: "🇪🇨", group_name: "C" },
  { id: 13, name: "México", code: "MEX", flag_emoji: "🇲🇽", group_name: "D" },
  { id: 14, name: "Estados Unidos", code: "USA", flag_emoji: "🇺🇸", group_name: "D" },
  { id: 15, name: "Inglaterra", code: "ENG", flag_emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group_name: "D" },
  { id: 16, name: "Australia", code: "AUS", flag_emoji: "🇦🇺", group_name: "D" },
  { id: 17, name: "Marruecos", code: "MAR", flag_emoji: "🇲🇦", group_name: "E" },
  { id: 18, name: "Portugal", code: "POR", flag_emoji: "🇵🇹", group_name: "E" },
  { id: 19, name: "Países Bajos", code: "NED", flag_emoji: "🇳🇱", group_name: "E" },
  { id: 20, name: "Uruguay", code: "URU", flag_emoji: "🇺🇾", group_name: "E" },
];

const T = (i: number) => mockTeams[i - 1];

// Build a spread of matches: some finished, some live, many upcoming, plus KOs.
export const mockMatches: Match[] = [
  // FINISHED groups
  {
    id: 1, home_team: T(9), away_team: T(10),
    match_date: "2026-06-10T15:00:00Z", venue: "AT&T Stadium, Dallas",
    phase: "groups", matchday: 1, status: "finished",
    home_score: 1, away_score: 2,
    my_prediction: { id: 101, match_id: 1, predicted_home: 2, predicted_away: 0, points_earned: 0 },
  },
  {
    id: 2, home_team: T(13), away_team: T(14),
    match_date: "2026-06-11T20:00:00Z", venue: "Estadio Azteca, Ciudad de México",
    phase: "groups", matchday: 1, status: "finished",
    home_score: 2, away_score: 1,
    my_prediction: { id: 102, match_id: 2, predicted_home: 2, predicted_away: 1, points_earned: 5 },
  },
  {
    id: 3, home_team: T(17), away_team: T(18),
    match_date: "2026-06-11T23:00:00Z", venue: "BMO Field, Toronto",
    phase: "groups", matchday: 1, status: "finished",
    home_score: 1, away_score: 1,
    my_prediction: { id: 103, match_id: 3, predicted_home: 2, predicted_away: 2, points_earned: 2 },
  },
  {
    id: 4, home_team: T(5), away_team: T(6),
    match_date: "2026-06-12T01:00:00Z", venue: "SoFi Stadium, Los Angeles",
    phase: "groups", matchday: 1, status: "finished",
    home_score: 2, away_score: 1,
    my_prediction: { id: 104, match_id: 4, predicted_home: 3, predicted_away: 1, points_earned: 4 },
  },
  // LIVE
  {
    id: 5, home_team: T(15), away_team: T(16),
    match_date: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    venue: "MetLife Stadium, New Jersey",
    phase: "groups", matchday: 2, status: "live",
    home_score: 1, away_score: 0,
    my_prediction: { id: 105, match_id: 5, predicted_home: 2, predicted_away: 0, points_earned: null },
  },
  // UPCOMING
  {
    id: 6, home_team: T(1), away_team: T(2),
    match_date: new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    venue: "MetLife Stadium, New Jersey",
    phase: "groups", matchday: 2, status: "upcoming",
    home_score: null, away_score: null,
  },
  {
    id: 7, home_team: T(3), away_team: T(4),
    match_date: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    venue: "BC Place, Vancouver",
    phase: "groups", matchday: 2, status: "upcoming",
    home_score: null, away_score: null,
    my_prediction: { id: 107, match_id: 7, predicted_home: 1, predicted_away: 2, points_earned: null },
  },
  {
    id: 8, home_team: T(19), away_team: T(20),
    match_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Mercedes-Benz Stadium, Atlanta",
    phase: "groups", matchday: 2, status: "upcoming",
    home_score: null, away_score: null,
  },
  {
    id: 9, home_team: T(7), away_team: T(8),
    match_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Arrowhead Stadium, Kansas City",
    phase: "groups", matchday: 2, status: "upcoming",
    home_score: null, away_score: null,
  },
  {
    id: 10, home_team: T(11), away_team: T(12),
    match_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Gillette Stadium, Boston",
    phase: "groups", matchday: 3, status: "upcoming",
    home_score: null, away_score: null,
  },
  // Jornada 3
  {
    id: 11, home_team: T(1), away_team: T(3),
    match_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Lincoln Financial Field, Philadelphia",
    phase: "groups", matchday: 3, status: "upcoming",
    home_score: null, away_score: null,
  },
  {
    id: 12, home_team: T(5), away_team: T(7),
    match_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Hard Rock Stadium, Miami",
    phase: "groups", matchday: 3, status: "upcoming",
    home_score: null, away_score: null,
  },
  // Round of 32
  {
    id: 20, home_team: T(2), away_team: T(8),
    match_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "NRG Stadium, Houston",
    phase: "round_of_32", status: "upcoming",
    home_score: null, away_score: null,
  },
  {
    id: 21, home_team: T(6), away_team: T(12),
    match_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "Levi's Stadium, San Francisco",
    phase: "round_of_32", status: "upcoming",
    home_score: null, away_score: null,
  },
  // Round of 16
  {
    id: 30, home_team: T(5), away_team: T(18),
    match_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "AT&T Stadium, Dallas",
    phase: "round_of_16", status: "upcoming",
    home_score: null, away_score: null,
  },
  // Quarter
  {
    id: 40, home_team: T(2), away_team: T(6),
    match_date: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "MetLife Stadium, New Jersey",
    phase: "quarterfinal", status: "upcoming",
    home_score: null, away_score: null,
  },
  // Semi
  {
    id: 50, home_team: T(5), away_team: T(10),
    match_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "MetLife Stadium, New Jersey",
    phase: "semifinal", status: "upcoming",
    home_score: null, away_score: null,
  },
  // Final
  {
    id: 60, home_team: T(5), away_team: T(2),
    match_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "MetLife Stadium, New Jersey",
    phase: "final", status: "upcoming",
    home_score: null, away_score: null,
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, user_id: 2, username: "maria_gol", total_points: 142, exact_count: 18, partial_count: 24, accuracy_pct: 62, is_current_user: false },
  { rank: 2, user_id: 3, username: "pedro2026", total_points: 138, exact_count: 16, partial_count: 26, accuracy_pct: 60, is_current_user: false },
  { rank: 3, user_id: 1, username: "tu_usuario", total_points: 127, exact_count: 14, partial_count: 21, accuracy_pct: 54, is_current_user: true },
  { rank: 4, user_id: 4, username: "futbol_fan", total_points: 119, exact_count: 12, partial_count: 20, accuracy_pct: 50, is_current_user: false },
  { rank: 5, user_id: 5, username: "goles2026", total_points: 104, exact_count: 10, partial_count: 18, accuracy_pct: 44, is_current_user: false },
  { rank: 6, user_id: 6, username: "elcrack", total_points: 98, exact_count: 9, partial_count: 17, accuracy_pct: 42, is_current_user: false },
  { rank: 7, user_id: 7, username: "la10", total_points: 91, exact_count: 8, partial_count: 17, accuracy_pct: 39, is_current_user: false },
  { rank: 8, user_id: 8, username: "tiki_taka", total_points: 85, exact_count: 7, partial_count: 16, accuracy_pct: 37, is_current_user: false },
  { rank: 9, user_id: 9, username: "catenaccio", total_points: 78, exact_count: 6, partial_count: 15, accuracy_pct: 34, is_current_user: false },
  { rank: 10, user_id: 10, username: "jogo_bonito", total_points: 71, exact_count: 5, partial_count: 14, accuracy_pct: 31, is_current_user: false },
  { rank: 11, user_id: 11, username: "gambeta", total_points: 64, exact_count: 4, partial_count: 13, accuracy_pct: 28, is_current_user: false },
];

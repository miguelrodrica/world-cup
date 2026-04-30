# Prompt para Lovable — Predictor Mundial 2026

---

Build a **World Cup 2026 football prediction web app** called **"Predictor Mundial 2026"**. This is a private competition app where registered users predict match scores, earn points for correct predictions, and compete on a leaderboard.

---

## Visual identity & design

- **Color palette:** Dark theme with green accents. Use deep dark navy/black backgrounds (`#0A0E1A`), card surfaces in dark gray (`#111827`), and FIFA-green as primary accent (`#00A550`). Secondary accent: gold (`#FFD700`) for rankings and scores.
- **Typography:** Modern, bold headers. Use a font that feels sporty but clean.
- **Style:** Premium sports app feel — think ESPN or Sofascore. Cards with subtle borders, glowing accents on active elements, country flags as emoji. No childish colors.
- **Fully responsive** — mobile-first. The app will be used on phones during match days.

---

## App structure — Pages & routing

Use React Router with these routes:

| Route | Page | Access |
|---|---|---|
| `/` | Redirect to `/dashboard` if logged in, else `/login` |  |
| `/login` | Login + Register tabs | Public |
| `/dashboard` | Main hub | Auth required |
| `/matches` | Full match calendar | Auth required |
| `/predictions` | My predictions history | Auth required |
| `/leaderboard` | Rankings table | Auth required |
| `/admin` | Admin panel | Admin role only |

Protect all routes except `/login` using an auth guard. If the user has no token in `localStorage`, redirect to `/login`.

---

## Authentication — `/login`

Two tabs: **Iniciar sesión** and **Registrarse**.

**Login form fields:**
- Email
- Password
- Button: "Entrar"

**Register form fields:**
- Username (unique display name)
- Email
- Password
- Confirm password
- Button: "Crear cuenta"

On success, store `{ token, user: { id, username, role, total_points } }` in `localStorage` as `auth`. Show a toast notification on error (wrong credentials, email taken, etc.).

The top navigation bar (present on all auth pages) should show:
- App logo/name left: ⚽ **Predictor 2026**
- Right: username, total points badge (gold color), logout icon
- On mobile: hamburger menu

---

## Dashboard — `/dashboard`

Three sections stacked vertically:

### Section 1 — "Próximos partidos" (Next matches)
Horizontal scroll of cards (3 visible on desktop, 1.5 on mobile). Each card shows:
- Home team flag + name vs Away team flag + name
- Match date and time (formatted as "Jue 12 Jun · 18:00")
- Phase badge (e.g. "Fase de grupos · Grupo A")
- Venue
- If user has NOT predicted yet: a highlighted green button **"Predecir"** that opens a prediction modal
- If user HAS predicted: show their prediction (e.g. "Tu pronóstico: 2 - 1") in a muted chip

### Section 2 — "Mis últimas predicciones" (Recent predictions)
A list of the last 5 predictions with:
- Match: Team A vs Team B
- My prediction: "2 - 1"
- Real result (if match finished): show actual score
- Points earned: colored badge (green if > 0, gray if 0, yellow if match pending)
- Status icon: ✓ (exact), ~ (partial), ✗ (wrong), ⏳ (pending)

### Section 3 — "Top 5 tabla de posiciones" (Mini leaderboard)
A compact table showing rank, username, and total points for the top 5 users. The current user's row is always shown (even if outside top 5) highlighted in green. Link to full leaderboard at the bottom.

---

## Match calendar — `/matches`

**Phase tabs** across the top (horizontal scroll on mobile):
- Fase de grupos
- Ronda de 32
- Octavos
- Cuartos de final
- Semifinales
- Final

Under each tab, matches are grouped by **Jornada** (matchday) in groups phase, or just listed chronologically in knockout phases.

**Each match card shows:**
- Home flag + name — score — Away flag + name
  - Score shown as "vs" if not played yet, or actual score if finished
- Date, time, venue
- Phase + group label
- Status badge: `PRÓXIMO` (gray) / `EN VIVO` (blinking green) / `FINALIZADO` (muted)
- My prediction chip (if exists): "Pronóstico: 2-1 · +4 pts"
- **"Predecir" button**: 
  - Enabled (green): match hasn't started yet and user hasn't predicted
  - "Editar" (yellow): user has prediction and match hasn't started
  - Disabled/hidden: match already started or finished

Clicking "Predecir" or "Editar" opens the **Prediction Modal**.

### Prediction Modal
A centered modal overlay with:
- Match header: flags, team names, date
- Two number inputs (spinners, min 0 max 20): one per team score
- Points preview text: "Si aciertas el marcador exacto → 5 pts × 1 = **5 pts**" (update dynamically based on phase)
- Buttons: "Cancelar" and "Guardar pronóstico" (green)

---

## My predictions — `/predictions`

**Summary bar** at top: Total pts | Partidos predichos | Aciertos exactos | % de acierto

**Filter row:**
- Phase dropdown (All / each phase)
- Status filter: Todos / Pendientes / Acertados / Fallados

**Predictions table** (card-style on mobile, table on desktop):

| Partido | Mi pronóstico | Resultado real | Puntos | Estado |
|---|---|---|---|---|
| 🇨🇴 Colombia vs 🇧🇷 Brasil | 2 - 1 | 1 - 1 | 2 pts | Ganador ✓ |
| 🇦🇷 Argentina vs 🇫🇷 Francia | 1 - 1 | 1 - 1 | 5 pts | Exacto ⭐ |
| 🇩🇪 Alemania vs 🇪🇸 España | 2 - 0 | 1 - 2 | 0 pts | Fallo ✗ |
| 🇲🇽 México vs 🇺🇸 EEUU | 3 - 1 | — | — pts | Pendiente ⏳ |

Points cell color: gold for 5pts (exact), green for 2-4pts, gray for 0, muted for pending.

---

## Leaderboard — `/leaderboard`

**Phase filter tabs** at top: General | Grupos | Ronda 32 | Octavos | Cuartos | Semis | Final

**Ranking table:**

| # | Usuario | Pts | Exactos | Parciales | % Acierto |
|---|---|---|---|---|---|
| 🥇 1 | juanito99 | 142 | 18 | 24 | 62% |
| 🥈 2 | mariana_fc | 138 | 16 | 26 | 60% |
| 🥉 3 | carlos2026 | 127 | 14 | 21 | 54% |

- Top 3 rows get gold/silver/bronze left border accent
- The logged-in user's row is always visible (sticky at bottom if outside top 10), highlighted
- Medal emoji for top 3 ranks
- Show total participant count: "47 participantes"

---

## Admin panel — `/admin`

Only visible/accessible to users with `role === 'admin'`. Show a red "Acceso denegado" screen for non-admins.

**Two tabs:**

### Tab 1 — Cargar resultados
List of finished/live matches without a result yet. Each row has:
- Match info (teams, date)
- Two number inputs for final score
- "Guardar resultado" button → calls `PUT /api/admin/matches/:id` → shows success toast
- On success, show "Puntos recalculados para X usuarios"

### Tab 2 — Partidos próximos
Read-only list of upcoming matches for context. Toggle to lock/unlock predictions globally (emergency switch).

---

## Scoring system — display rules

Use this logic only for **displaying** expected points in the prediction modal and in the predictions table. The actual calculation happens on the backend.

```
Base points:
  - Exact score match → 5 pts
  - Correct winner + exact goal difference → 4 pts
  - Correct winner or draw → 2 pts
  - Wrong → 0 pts

Phase multipliers:
  groups → ×1
  round_of_32 → ×1.5
  round_of_16 → ×2
  quarterfinal → ×3
  semifinal → ×4
  third_place → ×4
  final → ×5

Final points = base × multiplier (rounded to nearest integer)
```

In the prediction modal, show a real-time preview:
- "Marcador exacto → 5 × 2 = **10 pts**" (for octavos)
- Update this text as the user changes the score inputs

---

## API integration

All API calls go to `/api/...` (same origin). Create a centralized `api.js` or `api.ts` service that:
- Reads the JWT token from `localStorage` key `auth`
- Attaches `Authorization: Bearer <token>` header to every request
- Handles 401 responses by clearing localStorage and redirecting to `/login`

**Endpoints to call:**

```
POST /api/auth/login              → { token, user }
POST /api/auth/register           → { token, user }

GET  /api/matches                 → Match[]  (query: ?phase=groups&status=upcoming)
GET  /api/matches/:id             → Match & { my_prediction }

GET  /api/predictions             → Prediction[]
POST /api/predictions             → body: { match_id, predicted_home, predicted_away }
PUT  /api/predictions/:id         → body: { predicted_home, predicted_away }

GET  /api/leaderboard             → LeaderboardEntry[]  (query: ?phase=general)

PUT  /api/admin/matches/:id       → body: { home_score, away_score }  (admin only)
```

---

## Data types (TypeScript interfaces)

```typescript
interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  total_points: number;
}

type Phase = 'groups' | 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'third_place' | 'final';
type MatchStatus = 'upcoming' | 'live' | 'finished';

interface Team {
  id: number;
  name: string;
  code: string;       // 'COL', 'BRA'
  flag_emoji: string; // '🇨🇴'
  group_name: string; // 'A'
}

interface Match {
  id: number;
  home_team: Team;
  away_team: Team;
  match_date: string; // ISO string
  venue: string;
  phase: Phase;
  matchday?: number;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  my_prediction?: Prediction;
}

interface Prediction {
  id: number;
  match_id: number;
  predicted_home: number;
  predicted_away: number;
  points_earned: number | null;
}

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  total_points: number;
  exact_count: number;
  partial_count: number;
  accuracy_pct: number;
  is_current_user: boolean;
}
```

---

## Mock data for development

Since the backend doesn't exist yet, use this mock data to build and demo the frontend. Create a `mockData.ts` file:

```typescript
export const mockTeams: Team[] = [
  { id: 1, name: 'Colombia', code: 'COL', flag_emoji: '🇨🇴', group_name: 'A' },
  { id: 2, name: 'Brasil', code: 'BRA', flag_emoji: '🇧🇷', group_name: 'A' },
  { id: 3, name: 'Argentina', code: 'ARG', flag_emoji: '🇦🇷', group_name: 'B' },
  { id: 4, name: 'Francia', code: 'FRA', flag_emoji: '🇫🇷', group_name: 'B' },
  { id: 5, name: 'Alemania', code: 'GER', flag_emoji: '🇩🇪', group_name: 'C' },
  { id: 6, name: 'España', code: 'ESP', flag_emoji: '🇪🇸', group_name: 'C' },
  { id: 7, name: 'México', code: 'MEX', flag_emoji: '🇲🇽', group_name: 'D' },
  { id: 8, name: 'Estados Unidos', code: 'USA', flag_emoji: '🇺🇸', group_name: 'D' },
  { id: 9, name: 'Marruecos', code: 'MAR', flag_emoji: '🇲🇦', group_name: 'E' },
  { id: 10, name: 'Portugal', code: 'POR', flag_emoji: '🇵🇹', group_name: 'E' },
];

export const mockMatches: Match[] = [
  {
    id: 1, home_team: mockTeams[0], away_team: mockTeams[1],
    match_date: '2026-06-12T18:00:00Z', venue: 'MetLife Stadium, New Jersey',
    phase: 'groups', matchday: 1, status: 'upcoming',
    home_score: null, away_score: null
  },
  {
    id: 2, home_team: mockTeams[2], away_team: mockTeams[3],
    match_date: '2026-06-13T21:00:00Z', venue: 'SoFi Stadium, Los Angeles',
    phase: 'groups', matchday: 1, status: 'upcoming',
    home_score: null, away_score: null
  },
  {
    id: 3, home_team: mockTeams[4], away_team: mockTeams[5],
    match_date: '2026-06-10T15:00:00Z', venue: 'AT&T Stadium, Dallas',
    phase: 'groups', matchday: 1, status: 'finished',
    home_score: 1, away_score: 2,
    my_prediction: { id: 1, match_id: 3, predicted_home: 2, predicted_away: 0, points_earned: 0 }
  },
  {
    id: 4, home_team: mockTeams[6], away_team: mockTeams[7],
    match_date: '2026-06-11T20:00:00Z', venue: 'Estadio Azteca, Ciudad de México',
    phase: 'groups', matchday: 1, status: 'finished',
    home_score: 2, away_score: 1,
    my_prediction: { id: 2, match_id: 4, predicted_home: 2, predicted_away: 1, points_earned: 5 }
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, user_id: 2, username: 'maria_gol', total_points: 142, exact_count: 18, partial_count: 24, accuracy_pct: 62, is_current_user: false },
  { rank: 2, user_id: 3, username: 'pedro2026', total_points: 138, exact_count: 16, partial_count: 26, accuracy_pct: 60, is_current_user: false },
  { rank: 3, user_id: 1, username: 'tu_usuario', total_points: 127, exact_count: 14, partial_count: 21, accuracy_pct: 54, is_current_user: true },
  { rank: 4, user_id: 4, username: 'futbol_fan', total_points: 119, exact_count: 12, partial_count: 20, accuracy_pct: 50, is_current_user: false },
  { rank: 5, user_id: 5, username: 'goles2026', total_points: 104, exact_count: 10, partial_count: 18, accuracy_pct: 44, is_current_user: false },
];
```

Use these mocks in all components during development. Add a toggle or environment variable so real API calls can be switched on easily once the backend is ready.

---

## Additional UX requirements

- **Toast notifications** for all actions: successful prediction saved, prediction updated, error messages. Use a toast system (top-right, auto-dismiss after 3s).
- **Loading skeletons** while fetching data — never show empty white space.
- **Empty states**: if no predictions yet, show "Aún no tienes pronósticos. ¡Empieza prediciendo!" with a button to go to matches.
- **Countdown timer** on upcoming match cards showing time remaining until kickoff (e.g. "Cierra en 2h 15m").
- **Confirm dialog** before overwriting an existing prediction.
- The prediction modal should **not allow editing** if the match has already started (disable inputs and show "Este partido ya comenzó").
- Show a **"⚽ EN VIVO"** blinking badge on live matches.
- All dates/times should be displayed in the **user's local timezone** using `Intl.DateTimeFormat`.

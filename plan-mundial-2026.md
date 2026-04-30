# Plan de proyecto — Predictor Mundial 2026

## Visión general

Aplicación web privada de predicciones para el Mundial de Fútbol 2026. Cada usuario registrado puede predecir los resultados de los 104 partidos del torneo, acumular puntos según su precisión y competir en una tabla de posiciones global.

---

## Stack tecnológico

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | HTML + CSS + Bootstrap 5 + JS vanilla | Ya lo dominas, no necesitas framework |
| Backend | Node.js + Express.js | Ya lo dominas |
| Base de datos | SQLite (librería `better-sqlite3`) | Sin servidor, archivo único, ideal para < 50 usuarios |
| Autenticación | JWT (`jsonwebtoken`) + `bcryptjs` | Simple, stateless, sin sesiones de servidor |
| Despliegue | Railway o Render (plan gratuito) | Deploy en minutos, soporte Node.js nativo |

---

## Estructura de archivos

```
mundial-2026/
├── server/
│   ├── index.js                  ← Punto de entrada Express
│   ├── db/
│   │   ├── database.js           ← Conexión y creación de tablas
│   │   └── seed.js               ← Datos iniciales (equipos y partidos)
│   ├── routes/
│   │   ├── auth.js               ← Registro y login
│   │   ├── matches.js            ← Consulta de partidos
│   │   ├── predictions.js        ← CRUD de predicciones
│   │   ├── leaderboard.js        ← Tabla de posiciones
│   │   └── admin.js              ← Gestión de resultados
│   ├── middleware/
│   │   ├── authMiddleware.js     ← Verificar JWT en cada request
│   │   └── adminMiddleware.js    ← Verificar rol admin
│   └── utils/
│       └── scoring.js            ← Lógica de puntuación
├── public/
│   ├── login.html
│   ├── dashboard.html
│   ├── matches.html
│   ├── predictions.html
│   ├── leaderboard.html
│   ├── admin.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js                ← Wrapper fetch con token JWT
│       ├── auth.js
│       ├── dashboard.js
│       ├── matches.js
│       ├── predictions.js
│       ├── leaderboard.js
│       └── admin.js
├── package.json
└── .env                          ← JWT_SECRET, PORT
```

---

## Base de datos — Esquema completo (SQLite)

### Tabla `users`
```sql
CREATE TABLE users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  username     TEXT    NOT NULL UNIQUE,
  email        TEXT    NOT NULL UNIQUE,
  password_hash TEXT   NOT NULL,
  role         TEXT    NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `teams`
```sql
CREATE TABLE teams (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  code          TEXT NOT NULL,   -- 'COL', 'BRA', 'ARG', etc.
  flag_emoji    TEXT,            -- emoji de bandera
  group_name    TEXT,            -- 'A' .. 'L' (12 grupos)
  confederation TEXT             -- CONMEBOL, UEFA, etc.
);
```

### Tabla `matches`
```sql
CREATE TABLE matches (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  match_date   DATETIME NOT NULL,
  venue        TEXT,
  phase        TEXT NOT NULL,   -- ver fases abajo
  matchday     INTEGER,         -- jornada (1-3 en grupos)
  status       TEXT NOT NULL DEFAULT 'upcoming',  -- 'upcoming' | 'live' | 'finished'
  home_score   INTEGER,         -- NULL hasta que termine
  away_score   INTEGER,
  locked_at    DATETIME         -- cierre de predicciones = match_date
);
-- Fases: 'groups' | 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'third_place' | 'final'
```

> El Mundial 2026 tiene **104 partidos**: 72 en fase de grupos (12 grupos × 6 partidos) + 16 en ronda de 32 + 8 octavos + 4 cuartos + 2 semis + 1 tercer puesto + 1 final.

### Tabla `predictions`
```sql
CREATE TABLE predictions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id),
  match_id       INTEGER NOT NULL REFERENCES matches(id),
  predicted_home INTEGER NOT NULL,
  predicted_away INTEGER NOT NULL,
  points_earned  INTEGER,   -- NULL hasta que el partido termine
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, match_id)  -- 1 predicción por partido por usuario
);
```

### Tabla `tournament_predictions` (bonus pre-torneo)
```sql
CREATE TABLE tournament_predictions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id),
  champion_id     INTEGER REFERENCES teams(id),
  finalist_id     INTEGER REFERENCES teams(id),
  bonus_points    INTEGER DEFAULT 0,
  locked          INTEGER DEFAULT 0  -- 0=abierto, 1=cerrado al inicio del torneo
);
```

---

## Sistema de puntuación

### Puntuación por partido

| Resultado | Puntos base |
|---|---|
| Marcador exacto (ej. predijo 2-1, fue 2-1) | **5 puntos** |
| Ganador correcto + diferencia exacta (ej. predijo 3-1, fue 2-0) | **4 puntos** |
| Solo ganador o empate correcto | **2 puntos** |
| Predicción incorrecta | **0 puntos** |

### Multiplicador por fase

| Fase | Multiplicador |
|---|---|
| Fase de grupos | ×1 |
| Ronda de 32 | ×1.5 |
| Octavos de final | ×2 |
| Cuartos de final | ×3 |
| Semifinal | ×4 |
| Final | ×5 |

### Ejemplos reales

- Predijiste 2-1, fue 2-1 en fase de grupos → **5 × 1 = 5 pts**
- Predijiste 3-0, fue 2-0 en octavos → ganador correcto + diferencia exacta → **4 × 2 = 8 pts**
- Predijiste 1-0, fue 2-1 en cuartos → solo ganador correcto → **2 × 3 = 6 pts**
- Predijiste 2-1, fue 2-1 en la final → **5 × 5 = 25 pts** ← máximo por partido

### Bonus pre-torneo (se cierran al iniciar el torneo)

| Predicción | Puntos |
|---|---|
| Campeón correcto | +20 pts |
| Finalista correcto (cualquiera de los dos) | +10 pts |

### Puntuación máxima teórica

Si un usuario predice todos los 104 partidos con marcador exacto y también acierta el campeón y finalista:

- Grupos (72 partidos × 5 pts × 1): 360 pts
- Ronda 32 (16 × 5 × 1.5): 120 pts
- Octavos (8 × 5 × 2): 80 pts
- Cuartos (4 × 5 × 3): 60 pts
- Semis (2 × 5 × 4): 40 pts
- Final (1 × 5 × 5): 25 pts
- Tercer puesto (1 × 5 × 4): 20 pts
- Bonus campeón + finalista: 30 pts
- **Total teórico: 735 pts**

---

## API — Endpoints

### Autenticación
```
POST /api/auth/register    Body: { username, email, password }
POST /api/auth/login       Body: { email, password } → { token, user }
```

### Partidos (requiere JWT)
```
GET  /api/matches                    → todos (query: ?phase=groups&status=upcoming)
GET  /api/matches/:id                → detalle de un partido + mi predicción
```

### Predicciones (requiere JWT)
```
GET  /api/predictions                → todas mis predicciones + puntos
POST /api/predictions                → Body: { match_id, predicted_home, predicted_away }
PUT  /api/predictions/:id            → actualizar (solo si partido no ha iniciado)
GET  /api/predictions/match/:matchId → mi predicción para un partido específico
```

### Tabla de posiciones (requiere JWT)
```
GET  /api/leaderboard                → ranking completo (query: ?phase=groups)
```

### Predicciones de torneo (requiere JWT)
```
GET  /api/tournament                 → mis predicciones bonus
POST /api/tournament                 → Body: { champion_id, finalist_id }
```

### Admin (requiere JWT + rol admin)
```
POST /api/admin/matches              → crear partido
PUT  /api/admin/matches/:id          → actualizar resultado + recalcular puntos
GET  /api/admin/users                → lista de usuarios
```

---

## Páginas del frontend

### `login.html` — Acceso
- Formulario de login y registro en tabs
- Al hacer login guarda el JWT en `localStorage`
- Redirige a `dashboard.html`

### `dashboard.html` — Panel principal
- Barra de navegación con nombre de usuario y puntos totales
- Sección "Próximos partidos" (3-5 más cercanos con botón de predecir)
- Sección "Mis últimas predicciones" (con resultado y puntos ganados)
- Mini tabla de posiciones (top 5)

### `matches.html` — Calendario
- Tabs por fase (Grupos / Ronda 32 / Octavos / Cuartos / Semis / Final)
- Cada partido muestra: equipos, fecha, estado, marcador (si ya jugó) y tu predicción
- Botón "Predecir" (deshabilitado si el partido ya empezó o terminó)

### `predictions.html` — Mis predicciones
- Tabla con todos tus pronósticos: partido, tu predicción, resultado real, puntos
- Resumen de puntos por fase
- Filtro por fase y por estado (pendiente / acertado / fallado)

### `leaderboard.html` — Tabla de posiciones
- Ranking completo con posición, usuario, puntos totales
- Filtro por fase para ver quién va mejor en cada etapa
- Tu posición resaltada siempre visible

### `admin.html` — Panel de administración
- Lista de partidos con botón "Cargar resultado"
- Modal para ingresar marcador final → actualiza DB y recalcula puntos automáticamente
- Sección para activar/desactivar predicciones de torneo

---

## Lógica clave — `scoring.js`

```javascript
// Determina los puntos base según el resultado predicho vs real
function calculateBasePoints(predHome, predAway, realHome, realAway) {
  const predResult = Math.sign(predHome - predAway); // 1, 0, -1
  const realResult = Math.sign(realHome - realAway);

  if (predHome === realHome && predAway === realAway) return 5; // marcador exacto
  if (predResult === realResult && (predHome - predAway) === (realHome - realAway)) return 4; // ganador + diferencia
  if (predResult === realResult) return 2; // solo ganador/empate
  return 0;
}

// Multiplicador según la fase
const MULTIPLIERS = {
  groups: 1, round_of_32: 1.5, round_of_16: 2,
  quarterfinal: 3, semifinal: 4, third_place: 4, final: 5
};

function calculatePoints(predHome, predAway, realHome, realAway, phase) {
  const base = calculateBasePoints(predHome, predAway, realHome, realAway);
  return Math.round(base * MULTIPLIERS[phase]);
}
```

---

## Flujo de usuario típico

```
1. Usuario entra a login.html → se registra → recibe JWT
2. Ve dashboard.html → ve los próximos partidos
3. Hace clic en "Predecir" → ingresa marcador predicho → se guarda en DB
4. El partido se juega → admin carga el resultado real
5. El sistema recalcula los puntos de todas las predicciones de ese partido
6. Usuario ve sus puntos actualizados en leaderboard.html
```

---

## Fases de desarrollo

### Fase 1 — Cimientos (1-2 semanas)
- Inicializar proyecto Node.js, instalar dependencias
- Crear esquema de DB y datos seed (48 equipos, 104 partidos)
- Implementar autenticación completa (registro, login, JWT, middleware)
- Servir archivos estáticos desde `public/`

### Fase 2 — Lógica principal (1-2 semanas)
- Rutas de partidos (GET con filtros)
- Sistema completo de predicciones (crear, editar, cierre automático)
- Motor de puntuación (`scoring.js`)
- Ruta de leaderboard con cálculo en tiempo real

### Fase 3 — Frontend (1 semana)
- Todas las páginas HTML con Bootstrap
- `api.js` centralizado para todas las llamadas fetch
- Manejo de JWT: adjuntar en headers, expiración, logout

### Fase 4 — Panel de administración (3-4 días)
- Página `admin.html` protegida
- Endpoint para cargar resultados y disparar recálculo de puntos
- Actualización de `total_points` en tabla `users`

### Fase 5 — Extras opcionales
- Predicciones bonus (campeón, finalista)
- Filtros de leaderboard por fase
- Notificación visual de partidos próximos en el dashboard
- Estadísticas personales (% de aciertos, racha, mejor fase)

---

## Dependencias npm

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "better-sqlite3": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

---

## Notas importantes

**Cierre de predicciones:** Cuando el campo `match_date` de un partido llega, las predicciones deben bloquearse. En el backend, antes de guardar una predicción, comparar `new Date() < match.match_date`. No confiar en el frontend para esto.

**Recálculo de puntos:** Al cargar un resultado desde admin, recorrer todas las predicciones de ese partido, calcular puntos, actualizarlos, y luego hacer un `UPDATE users SET total_points = (SELECT SUM(points_earned) FROM predictions WHERE user_id = ?)` para cada usuario afectado.

**Seguridad mínima:** Hashear contraseñas siempre con bcrypt. El `JWT_SECRET` va en `.env` y nunca en el código. Agregar `.env` al `.gitignore` desde el inicio.

**Datos iniciales:** El archivo `seed.js` debe poblar los 48 equipos y los 104 partidos de la fase de grupos (los de fases eliminatorias se agregan conforme avanza el torneo, ya que los equipos se conocen sobre la marcha).

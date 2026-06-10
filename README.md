# ⚽ World Cup Predictor 2026

Aplicación web para pronosticar resultados del Mundial FIFA 2026, competir con otros usuarios en una tabla de posiciones y administrar resultados oficiales en tiempo real.

---

## Tabla de Contenidos

* Características
* Tecnologías
* Arquitectura
* Instalación
* Variables de Entorno
* Ejecución Local
* Estructura del Proyecto
* Base de Datos
* Roles del Sistema
* Sistema de Puntuación
* Despliegue

---

# Características

### Usuarios

* Registro e inicio de sesión.
* Crear y editar pronósticos antes del inicio de cada partido.
* Consultar partidos próximos, en juego y finalizados.
* Ver historial de pronósticos.
* Consultar puntos obtenidos.
* Visualizar tabla general de posiciones.

### Administradores

* Gestionar resultados oficiales de los partidos.
* Finalizar encuentros.
* Calcular automáticamente los puntos obtenidos por cada usuario.
* Actualizar la clasificación general.

---

# Tecnologías

## Frontend

* React
* TypeScript
* Vite
* TanStack Router
* Tailwind CSS
* shadcn/ui
* Lucide Icons

## Backend / BaaS

* Supabase Authentication
* Supabase Database (PostgreSQL)
* Supabase Row Level Security (RLS)

## Hosting

* Vercel

---

# Arquitectura

```text
┌───────────────┐
│    React      │
│   Frontend    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   Supabase    │
│ Authentication│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ PostgreSQL DB │
│   Supabase    │
└───────────────┘
```

---

# Instalación

## 1. Clonar repositorio

```bash
git clone <repository-url>
cd world-cup
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Crear archivo de entorno

```bash
cp .env.example .env.local
```

---

# Variables de Entorno

Crear un archivo `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

# Ejecución Local

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:5173
```

---

# Estructura del Proyecto

```text
src/
│
├── components/
│   ├── navbar.tsx
│   ├── prediction-modal.tsx
│   └── ...
│
├── routes/
│   ├── dashboard.tsx
│   ├── matches.tsx
│   ├── leaderboard.tsx
│   ├── predictions.tsx
│   ├── admin.tsx
│   ├── login.tsx
│   └── register.tsx
│
├── lib/
│   ├── api.ts
│   ├── auth-context.tsx
│   ├── types.ts
│   └── utils.ts
│
└── main.tsx
```

---

# Base de Datos

## Tabla users

```text
id
username
email
role
total_points
created_at
updated_at
```

## Tabla teams

```text
id
name
code
flag_emoji
group_letter
```

## Tabla matches

```text
id
home_team_id
away_team_id
match_date
phase
status
home_score
away_score
```

## Tabla predictions

```text
id
user_id
match_id
predicted_home
predicted_away
points_earned
```

---

# Roles del Sistema

## user

Puede:

* Crear pronósticos.
* Consultar estadísticas.
* Ver clasificación.

## admin

Puede:

* Todo lo anterior.
* Registrar resultados oficiales.
* Finalizar partidos.
* Ejecutar el cálculo de puntos.

---

# Sistema de Puntuación

| Resultado                 | Puntos |
| ------------------------- | ------ |
| Marcador exacto           | 5      |
| Ganador o empate correcto | 2      |
| Incorrecto                | 0      |

> Dependiendo de la fase del torneo se pueden aplicar multiplicadores adicionales.

---

# Flujo de Juego

1. El usuario crea un pronóstico.
2. El partido inicia.
3. El administrador registra el resultado oficial.
4. Se calculan automáticamente los puntos obtenidos.
5. Se actualiza la tabla general.
6. Los usuarios visualizan sus resultados y clasificación.

---

# Despliegue

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Producción

El proyecto está preparado para desplegarse en:

* Vercel
* Netlify
* Railway

---

# Autor

**Miguel Ángel Rodríguez Cano**

Proyecto académico desarrollado para practicar:

* React
* TypeScript
* Supabase
* PostgreSQL
* Autenticación
* Arquitectura Frontend Moderna
* Gestión de Estado
* Consumo de APIs
* Desarrollo Full Stack

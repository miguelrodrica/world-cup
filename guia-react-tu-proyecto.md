# Guía React — Tu proyecto World Cup Predictor

Esta guía explica React usando el código que ya está en tu repositorio. Nada genérico.

---

## Lo primero: ¿qué cambió respecto a lo que conoces?

| Lo que conoces | Lo que usa este proyecto | Diferencia clave |
|---|---|---|
| Archivos `.html` separados | Componentes `.tsx` | Una página = una función JavaScript que devuelve HTML |
| Bootstrap CSS | Tailwind CSS | Clases utilitarias directamente en el HTML |
| `<script>` en el HTML | TypeScript (`.ts` / `.tsx`) | JavaScript con tipos |
| Express rutas con `res.render()` | TanStack Router | El routing vive en el frontend, no en el servidor |
| `fetch()` que llama a tu backend | `api.ts` que lee/escribe `localStorage` | Por ahora todo es mock, sin servidor |

---

## 1. JSX — HTML dentro de JavaScript

En `dashboard.tsx` verás esto:

```tsx
function Index() {
  const { user, loading } = useAuth();
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      Cargando…
    </div>
  );
}
```

Esto se llama **JSX**. Es HTML escrito dentro de una función JavaScript. Reglas importantes:

- `class` se escribe `className` (porque `class` es palabra reservada en JS)
- Todo tiene que estar dentro de un solo elemento contenedor
- Las variables se insertan con `{}`: `<span>{user.username}</span>`
- Los eventos se escriben camelCase: `onClick`, `onChange` (no `onclick`)

En HTML/JS vanilla harías:
```html
<!-- HTML -->
<div id="nombre"></div>
<!-- JS -->
document.getElementById('nombre').textContent = user.username;
```

En React haces:
```tsx
<div>{user.username}</div>
```
React actualiza el DOM automáticamente cuando cambia `user.username`.

---

## 2. TypeScript — JavaScript con tipos

Verás el archivo `src/lib/types.ts`. Esto no es código que "hace" algo, es una declaración de cómo lucen los datos:

```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";   // solo puede ser uno de estos dos valores
  total_points: number;
}
```

Luego en cualquier archivo puedes escribir:

```typescript
const user: User = { ... }  // TypeScript te avisa si falta un campo o el tipo está mal
```

El archivo también exporta funciones de cálculo de puntos que ya puedes usar:

```typescript
// En types.ts
export function computeBasePoints(pHome, pAway, rHome, rAway): number { ... }
export function computeFinalPoints(base, phase): number { ... }
```

Estas funciones las usará tanto el frontend (para el preview en el modal) como tu backend cuando lo construyas.

---

## 3. Componentes — las piezas reutilizables

Un componente es una función que devuelve JSX. Miremos `require-auth.tsx`:

```tsx
export function RequireAuth({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Cargando…</div>;
  if (!user) { navigate({ to: "/login" }); return null; }
  if (adminOnly && user.role !== "admin") return <div>Acceso denegado</div>;
  
  return <>{children}</>;
}
```

Luego en `dashboard.tsx` lo usan así:

```tsx
export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireAuth>        ← RequireAuth "envuelve" el dashboard
      <DashboardPage />  ← Solo se renderiza si el usuario está logueado
    </RequireAuth>
  ),
});
```

**`children`** es lo que va "adentro" del componente cuando lo usas. Como el contenido entre etiquetas HTML.

Los componentes reciben datos a través de **props** (propiedades):

```tsx
// Definición: acepta flag (string) y name (string)
function TeamSide({ flag, name }: { flag: string; name: string }) {
  return (
    <div>
      <span>{flag}</span>
      <span>{name}</span>
    </div>
  );
}

// Uso: se pasan como atributos HTML
<TeamSide flag="🇨🇴" name="Colombia" />
```

---

## 4. Hooks — el estado y los efectos

### `useState` — datos que cambian

Cada vez que cambia un `useState`, React re-renderiza el componente automáticamente.

En `dashboard.tsx`:

```tsx
const [matches, setMatches] = useState<Match[] | null>(null);
```

- `matches` = el valor actual (empieza en `null`)
- `setMatches` = la función para cambiarlo
- `Match[] | null` = TypeScript: puede ser un array de Match o null

Cuando haces `setMatches(data)`, React actualiza la pantalla sin que tengas que tocar el DOM.

En HTML/JS vanilla harías `document.getElementById(...).innerHTML = ...`. Con React simplemente cambias el estado y el HTML se actualiza solo.

### `useEffect` — código que corre después de renderizar

```tsx
useEffect(() => {
  load();    // carga los datos cuando el componente aparece en pantalla
}, [load]); // ← el array de dependencias: "ejecuta esto solo cuando 'load' cambie"
```

Si el array está vacío `[]`, solo se ejecuta una vez al montar el componente (equivale a `DOMContentLoaded`).

### `useCallback` — funciones que no se recrean en cada render

```tsx
const load = useCallback(async () => {
  const [m, p, b] = await Promise.all([
    getMatches({ status: "upcoming" }),
    getMyPredictions(),
    getLeaderboard(),
  ]);
  setMatches(m.slice(0, 8));
  setPreds(p.slice(0, 5));
  setBoard(b);
}, [refresh]);  // solo se recrea si 'refresh' cambia
```

---

## 5. Context — estado global compartido

El problema: si el usuario está en `navbar.tsx` y en `dashboard.tsx`, ambos necesitan saber quién está logueado. No puedes pasar props entre componentes que no están relacionados directamente.

La solución: **Context**. Mira `auth-context.tsx`:

```tsx
// 1. Crear el contexto
const AuthContext = createContext<AuthContextValue | null>(null);

// 2. Crear el "proveedor" que envuelve toda la app
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Crear el hook para usarlo en cualquier componente
export function useAuth() {
  return useContext(AuthContext);
}
```

En `__root.tsx` (el layout raíz), el `AuthProvider` envuelve toda la app:

```tsx
function RootComponent() {
  return (
    <AuthProvider>     ← Aquí se "provee" el contexto a toda la app
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}
```

Ahora desde cualquier componente puedes hacer:

```tsx
const { user, login, logout } = useAuth();
```

---

## 6. El routing — TanStack Router

Este proyecto usa **TanStack Router** con archivos de rutas. Cada archivo en `src/routes/` es una página:

```
src/routes/
├── __root.tsx      ← Layout raíz (Navbar, AuthProvider, etc.)
├── index.tsx       ← Ruta "/" → redirige a /dashboard o /login
├── login.tsx       ← Ruta "/login"
├── dashboard.tsx   ← Ruta "/dashboard"
├── matches.tsx     ← Ruta "/matches"
├── predictions.tsx ← Ruta "/predictions"
├── leaderboard.tsx ← Ruta "/leaderboard"
└── admin.tsx       ← Ruta "/admin"
```

Cada archivo exporta su ruta así:

```tsx
// En dashboard.tsx
export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
});
```

Para navegar entre páginas **no usas `<a href="...">`**. Usas el componente `<Link>` de TanStack Router:

```tsx
import { Link } from "@tanstack/react-router";

<Link to="/matches">Ver todos →</Link>
```

Esto evita que la página se recargue completa (es una SPA — Single Page Application).

---

## 7. La API falsa — cómo funciona hoy

El archivo `src/lib/api.ts` es la capa de datos. Por ahora **no llama a ningún servidor**. Todo lo guarda en `localStorage` del navegador.

Funciona así:

```
mockData.ts          → datos de ejemplo (equipos, partidos, leaderboard)
      ↓
api.ts (seed)        → los carga en localStorage la primera vez
      ↓
api.ts (funciones)   → lee/escribe de localStorage simulando un backend
      ↓
dashboard.tsx etc.   → llaman a las funciones de api.ts
```

Las funciones retornan Promesas con un `delay()` artificial de 250ms para simular latencia de red:

```typescript
function delay<T>(v: T, ms = 250): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

export async function getMatches(opts?) {
  // ... lee de localStorage ...
  return delay(list);  // ← simula tiempo de respuesta del servidor
}
```

Cuando construyas tu backend Node.js + Express, reemplazarás el contenido de estas funciones con `fetch('/api/matches')` reales. **El resto de la app no cambia.**

---

## 8. Los componentes UI — shadcn/ui

La carpeta `src/components/ui/` tiene +40 componentes listos: `Button`, `Dialog`, `Table`, `Badge`, `Input`, `Select`, etc.

Estos son componentes de **shadcn/ui** (basados en Radix UI). Los usas así:

```tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

<Button onClick={onPredict} className="w-full">
  Predecir
</Button>
```

El prefijo `@/` es un alias para `src/`. En vez de escribir `../../components/ui/button` puedes escribir `@/components/ui/button`.

---

## 9. Tailwind CSS

En vez de escribir clases CSS propias, Tailwind tiene clases utilitarias para todo:

```tsx
<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
```

| Clase | Equivale a |
|---|---|
| `flex` | `display: flex` |
| `items-center` | `align-items: center` |
| `gap-4` | `gap: 1rem` |
| `rounded-xl` | `border-radius: 0.75rem` |
| `p-4` | `padding: 1rem` |
| `text-sm` | `font-size: 0.875rem` |
| `text-muted-foreground` | color gris tenue (variable CSS del tema) |

El proyecto define colores propios en `styles.css` como `text-gold`, `bg-gradient-hero`, etc., que son extensiones de Tailwind para el tema del Mundial.

---

## 10. El flujo completo de una pantalla

Tomemos el Dashboard para ver todo junto:

```
1. El usuario navega a /dashboard
        ↓
2. TanStack Router carga dashboard.tsx
        ↓
3. RequireAuth verifica si hay sesión (useAuth)
   — Si no hay sesión → redirige a /login
   — Si hay sesión → renderiza DashboardPage
        ↓
4. DashboardPage se monta. useEffect dispara load()
        ↓
5. load() llama en paralelo:
   getMatches() + getMyPredictions() + getLeaderboard()
   (por ahora leen de localStorage)
        ↓
6. Los useState se actualizan:
   setMatches(m) / setPreds(p) / setBoard(b)
        ↓
7. React re-renderiza DashboardPage con los datos
   — Mientras carga: muestra <ScrollSkeleton /> (cajas grises animadas)
   — Con datos: muestra las tarjetas reales
```

---

## Cómo correr el proyecto localmente

```bash
# 1. Clonar el repo
git clone https://github.com/miguelrodrica/world-cup-predictor.git
cd world-cup-predictor

# 2. Instalar dependencias
npm install

# 3. Correr en desarrollo
npm run dev

# Abre http://localhost:5173 en el navegador
```

**Credenciales de prueba:**
- Cualquier email del mock + contraseña `demo`
- Admin: `admin@demo.com` + `admin123`

---

## Resumen del mapa mental

```
src/
├── routes/          ← Una página = un archivo. Aquí empieza todo.
├── components/
│   ├── ui/          ← Botones, modales, tablas... no tocar.
│   ├── navbar.tsx   ← Barra de navegación compartida
│   ├── match-parts.tsx      ← Piezas reutilizables de partidos
│   ├── prediction-modal.tsx ← El modal de predicción
│   └── require-auth.tsx     ← Guarda de rutas privadas
└── lib/
    ├── types.ts        ← Los "moldes" de los datos (interfaces)
    ├── api.ts          ← Toda la lógica de datos (hoy: localStorage)
    ├── auth-context.tsx ← Estado global de sesión
    ├── mockData.ts     ← Datos de ejemplo
    ├── format.ts       ← Funciones para formatear fechas, etc.
    └── utils.ts        ← Helpers (la función cn() para combinar clases)
```

**Cuando llegue el momento de conectar el backend**, el único archivo que cambia es `api.ts`. Reemplazas cada función de localStorage por un `fetch()` a tu Express, y el resto de la app funciona igual.

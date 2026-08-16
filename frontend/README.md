# thyTache — Frontend

Frontend React 19 + TypeScript d'une application de gestion de tâches, avec toutes les données simulées (mock). Aucune dépendance à un backend n'est requise pour faire fonctionner l'application.

## Stack

Vite, TypeScript, TailwindCSS v4, shadcn/ui (primitives Radix écrites à la main), React Router DOM, TanStack Query, React Hook Form + Zod, Axios, Zustand, Framer Motion, Recharts, Sonner, date-fns, lucide-react.

## Démarrer

```bash
npm install
npm run dev
```

Comptes de démonstration (voir `src/mocks/data/users.ts`) :

- Admin : `admin@thytache.com` / `Admin1234`
- Membre : `aicha.diallo@thytache.com` / `Password1`

Le code OTP de démonstration (inscription, mot de passe oublié) est toujours **123456**.

## Architecture

```
src/
  components/     ui/ forms/ layout/ cards/ tables/ modals/ charts/ notifications/ shared/
  pages/          auth/ dashboard/ tasks/ profile/ admin/ emails/ notifications/ errors/
  services/       fonctions async simulant l'API (voir "Brancher le backend")
  mocks/          données de départ + "base de données" en mémoire (src/mocks/db.ts)
  hooks/          hooks React Query par domaine (useTasks, useUsers, useNotifications, useAuth...)
  store/          état global léger (Zustand) : session, thème, préférences UI
  context/        NotificationProvider (moteur de simulation de notifications en temps réel)
  routes/         routeur + gardes (ProtectedRoute, AdminRoute)
  layouts/        AuthLayout, DashboardLayout, AdminLayout
  types/          types partagés (Task, User, Notification...)
```

## Brancher le futur backend Express

Toutes les données transitent par la couche `src/services/*.ts` (ex. `taskService.list()`, `authService.login()`). Ces fonctions ont déjà la signature et la forme de retour attendues par les hooks et composants — elles résolvent aujourd'hui des données en mémoire (`src/mocks/db.ts`) avec un délai simulé.

Pour connecter un vrai backend :

1. Renseigner `VITE_API_BASE_URL` dans `.env` (voir `.env.example`) avec l'URL de l'API Express.
2. Dans chaque fonction de `src/services/*.ts`, remplacer le corps par un appel à l'instance Axios déjà configurée dans `src/lib/axios.ts` (gestion du token d'auth déjà en place via un interceptor), en conservant la signature et le type de retour.
3. Aucun changement n'est nécessaire dans les hooks, pages ou composants : ils ne connaissent que la signature des services.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — vérification TypeScript + build de production
- `npm run preview` — prévisualiser le build de production

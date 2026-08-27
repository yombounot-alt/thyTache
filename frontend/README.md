# thyTache — Frontend

Frontend React 19 + TypeScript d'une application de gestion de tâches, branché sur le backend Express (`../backend`).

## Stack

Vite, TypeScript, TailwindCSS v4, shadcn/ui (primitives Radix écrites à la main), React Router DOM, TanStack Query, React Hook Form + Zod, Axios, Zustand, Framer Motion, Recharts, Sonner, date-fns, lucide-react.

## Démarrer

Le backend (`../backend`) doit tourner en parallèle (voir son README) — auth, tâches, utilisateurs et notifications transitent tous par l'API réelle.

```bash
npm install
cp .env.example .env   # ajuster VITE_API_BASE_URL si besoin
npm run dev
```

Le code OTP est envoyé par e-mail par le backend (ou loggé côté serveur si SMTP n'est pas configuré, voir `backend/README.md`).

## Architecture

```
src/
  components/     ui/ forms/ layout/ cards/ tables/ modals/ charts/ notifications/ shared/
  pages/          auth/ dashboard/ tasks/ profile/ admin/ emails/ notifications/ errors/
  services/       appels à l'API backend (taskService, authService, userService, notificationService, roleService)
  hooks/          hooks React Query par domaine (useTasks, useUsers, useNotifications, useAuth...)
  store/          état global léger (Zustand) : session, thème, préférences UI
  context/        NotificationProvider (toast sur les notifications générées côté backend, via polling)
  routes/         routeur + gardes (ProtectedRoute, AdminRoute)
  layouts/        AuthLayout, DashboardLayout, AdminLayout
  types/          types partagés (Task, User, Notification...)
```

## État de l'intégration backend

- **Auth, tâches, utilisateurs, notifications** : branchés sur l'API réelle (`src/lib/axios.ts`, refresh token automatique sur 401).
- **Suppression de tâches** : logique (corbeille), jamais définitive — page `/tasks/trash` avec restauration.
- **Admin** : vue "Toutes les tâches" (`scope=all`) vs "Mes tâches", création/attribution à n'importe quel utilisateur via un combobox de recherche (nom/e-mail), tableaux de bord/statistiques à l'échelle de la plateforme.
- **Avatar de profil** : upload réel (`userService.uploadAvatar`), pas une simulation — le backend stocke le fichier et renvoie un chemin résolu en URL absolue par `mapBackendUser` (`API_ORIGIN`).
- **Préférences de notification** (Profil > Préférences) : `pushNotifications`/`emailNotifications` sont réellement respectées côté backend ; `weeklyDigest` déclenche un e-mail hebdomadaire.
- **Rôles** (`roleService.ts`) : les 3 rôles (admin/manager/member) sont un contenu de référence statique côté frontend, pas une ressource backend — c'est un choix délibéré (rien à persister).
- **Pièces jointes des tâches** : seules les métadonnées sont envoyées au backend, pas d'upload de fichier réel (contrairement à l'avatar).
- **Notifications temps réel** : pas de WebSocket/SSE — `useNotifications` fait du polling (30s) et `NotificationProvider` affiche un toast pour toute notification nouvellement apparue.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — vérification TypeScript + build de production
- `npm run preview` — prévisualiser le build de production

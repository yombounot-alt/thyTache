# Backend API

Socle backend Node.js / Express.js — professionnel, robuste, sécurisé et évolutif.
Prêt à accueillir les futurs modules métier (authentification, ressources, base de données…).

## Prérequis

- Node.js >= 18
- npm >= 9

## Installation

```bash
cd backend
npm install
```

## Configuration (.env)

Copier le fichier d'exemple puis ajuster les valeurs :

```bash
cp .env.example .env
```

Variables principales :

| Variable | Description |
|---|---|
| `NODE_ENV` | `development`, `production` ou `test` |
| `PORT` | Port d'écoute du serveur HTTP |
| `API_PREFIX` | Préfixe de versionnage des routes (`/api/v1`) |
| `CORS_ORIGIN` | Origines autorisées séparées par des virgules (`*` pour tout autoriser) |
| `RATE_LIMIT_*` | Fenêtre et nombre max de requêtes (rate limiting global) |
| `AUTH_RATE_LIMIT_*` | Rate limiting renforcé pour les routes sensibles (ex: login) |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Secret et durée de vie du token d'accès |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN` | Secret et durée de vie du refresh token |
| `COOKIE_SECRET` | Secret de signature des cookies |
| `BCRYPT_SALT_ROUNDS` | Coût du hashage bcrypt |
| `JSON_BODY_LIMIT` | Taille maximale du corps des requêtes JSON |
| `LOG_LEVEL` | Niveau de log (winston) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `MAIL_FROM` | Envoi réel des e-mails (OTP, notifications, résumé hebdo). Si `SMTP_HOST` est vide, aucun e-mail n'est envoyé : les OTP sont loggés côté serveur (dev uniquement) et les autres e-mails sont silencieusement ignorés. |

En production, `JWT_SECRET`, `JWT_REFRESH_SECRET` et `COOKIE_SECRET` sont obligatoires (validation au démarrage).

## Lancement

Développement (avec rechargement automatique via nodemon) :

```bash
npm run dev
```

Production :

```bash
npm start
```

Vérification rapide :

```bash
curl http://localhost:3000/api/v1/health
```

## Documentation API

Swagger UI est disponible sur `http://localhost:3000/api-docs`.
Les nouvelles routes se documentent via des annotations `@openapi` (JSDoc) directement dans les fichiers de `src/routes/`.

## Tests

```bash
npm test          # exécute la suite Jest (unitaire + intégration)
npm run test:watch
```

Aucun MongoDB local requis : `tests/globalSetup.js` démarre une instance MongoDB en mémoire (`mongodb-memory-server`) dédiée à la durée de la suite, isolée de `MONGODB_URI`/`MONGODB_URI_TEST`.

## Qualité de code

```bash
npm run lint          # analyse ESLint
npm run lint:fix      # corrige automatiquement ce qui peut l'être
npm run format        # formate le code avec Prettier
npm run format:check  # vérifie le formatage sans modifier les fichiers
```

## Architecture du projet

```
backend/
├── src/
│   ├── config/         # configuration (env, logger, cors, swagger, upload, scheduler)
│   ├── controllers/    # contrôleurs HTTP (légers, délèguent aux services)
│   ├── routes/         # définition des routes Express + doc Swagger
│   ├── services/       # logique métier
│   ├── models/         # modèles Mongoose
│   ├── repositories/   # accès aux données (couche d'abstraction DB)
│   ├── middlewares/    # sécurité, erreurs, authentification, sanitization
│   ├── validators/     # règles de validation (express-validator)
│   ├── jobs/           # tâches planifiées (node-cron) : retards, résumé hebdo
│   ├── utils/          # utilitaires (réponses API, JWT, bcrypt, catchAsync)
│   ├── constants/       # constantes partagées (codes HTTP, etc.)
│   ├── errors/          # classes d'erreurs personnalisées
│   ├── app.js           # configuration de l'application Express
│   └── server.js        # point d'entrée, démarrage du serveur HTTP + planificateur
├── tests/
│   ├── unit/
│   └── integration/
├── .env / .env.example
├── eslint.config.js
├── jest.config.js
├── nodemon.json
└── package.json
```

Principe de séparation des responsabilités :
`routes` → `controllers` (légers) → `services` (logique métier) → `repositories` (accès aux données) → `models`.

## Sécurité mise en place

- **Helmet** : en-têtes HTTP de sécurité (CSP, HSTS, etc.)
- **CORS** configurable via `.env`, avec whitelist d'origines
- **Rate limiting** global + limiteur renforcé disponible pour les routes sensibles (`authLimiter`)
- **Limitation de la taille des payloads** JSON/urlencoded (`JSON_BODY_LIMIT`)
- **Sanitization générique** des entrées (body/query/params) — ne remplace pas la validation métier
- **express-validator** pour la validation stricte des données entrantes (middleware `validate`)
- **hpp** contre la pollution des paramètres HTTP
- **bcryptjs** pour le hashage des mots de passe
- **JWT** avec expiration (access token + refresh token séparés), middleware `authenticate` générique
- **Gestion centralisée des erreurs** ne révélant pas les détails internes en production
- Variables sensibles exclusivement dans `.env` (jamais en dur dans le code)

> Ces middlewares sont un socle de défense en profondeur : ils ne remplacent ni la validation métier propre à chaque route, ni l'usage de requêtes paramétrées au niveau de la base de données.

## Gestion des erreurs et format des réponses

Toutes les réponses suivent un format standardisé (voir `src/utils/apiResponse.js`) :

Succès :
```json
{ "success": true, "message": "Opération effectuée avec succès", "data": {} }
```

Erreur :
```json
{ "success": false, "message": "Description de l'erreur", "errors": [] }
```

Les erreurs métier doivent utiliser les classes de `src/errors/` (`BadRequestError`, `NotFoundError`, `ValidationError`, etc.), interceptées par le middleware global `errorHandler`.

## Modules implémentés

- **Auth** : register (OTP e-mail), verify-email, login, refresh token (rotation + cookie httpOnly), logout, forgot/reset password, change password
- **Tasks** : CRUD, suppression logique (corbeille, restauration), commentaires, pièces jointes (métadonnées uniquement), stats/évolution/répartition/activité — avec `scope=all` réservé aux admins pour une vue plateforme entière
- **RBAC admin** : un admin peut voir toutes les tâches (`scope=all`), en créer et en attribuer à n'importe quel utilisateur ; ses droits de lecture élargis ne donnent pas de passe-droit en écriture (modifier/supprimer restent réservés au créateur/assigné)
- **Users** : CRUD (admin), un utilisateur peut modifier son propre profil (nom, téléphone, email, avatar) sans être admin, activation/désactivation, changement de rôle (member/manager/admin), reset password, upload d'avatar réel (`POST /users/me/avatar`, stockage disque local, 2 Mo max, jpeg/png/webp)
- **Notifications** : générées sur les événements de tâches (création, complétion, attribution, retard) et respectent les préférences utilisateur (`pushNotifications` pour la notification in-app, `emailNotifications` pour la copie e-mail)
- **Planificateur** (`src/jobs/`, node-cron, jamais actif pendant les tests) : détection quotidienne des tâches en retard, résumé hebdomadaire par e-mail (préférence `weeklyDigest`)

## Points restant à configurer

- **SMTP réel** : si `SMTP_HOST` est vide, les OTP sont uniquement loggés côté serveur (dev uniquement) et les autres e-mails (notifications, résumé hebdo) sont silencieusement ignorés. Obligatoire avant mise en production (`email.service.js` lève une erreur bloquante si absent en production).
- **Upload de fichiers réel** pour les pièces jointes des tâches (actuellement métadonnées uniquement, contrairement à l'avatar utilisateur qui stocke un vrai fichier)
- **Agrégations stats** (`getStats`, `getEvolution`, etc.) chargent la collection en mémoire plutôt que d'utiliser un pipeline d'agrégation Mongo — suffisant au volume actuel, à revoir si le nombre de tâches devient important
- **CI/CD** : lint + test au push sont automatisés (GitHub Actions), mais il n'y a pas d'étape de déploiement (pas d'environnement cible configuré)

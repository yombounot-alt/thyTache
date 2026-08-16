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
│   ├── config/         # configuration (env, logger, cors, swagger)
│   ├── controllers/    # contrôleurs HTTP (légers, délèguent aux services)
│   ├── routes/         # définition des routes Express + doc Swagger
│   ├── services/       # logique métier (à peupler avec les futurs modules)
│   ├── models/         # modèles de données (à peupler avec une base de données)
│   ├── repositories/   # accès aux données (couche d'abstraction DB)
│   ├── middlewares/    # sécurité, erreurs, authentification, sanitization
│   ├── validators/     # règles de validation (express-validator)
│   ├── utils/          # utilitaires (réponses API, JWT, bcrypt, catchAsync)
│   ├── constants/       # constantes partagées (codes HTTP, etc.)
│   ├── errors/          # classes d'erreurs personnalisées
│   ├── app.js           # configuration de l'application Express
│   └── server.js        # point d'entrée, démarrage du serveur HTTP
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

## Points restant à configurer

- Choix et intégration d'une base de données (ex: PostgreSQL) et, si pertinent, d'un ORM/query builder
- Implémentation des modules métier (routes/controllers/services/repositories/models spécifiques)
- Mise en place effective des routes d'authentification (register/login/refresh) au-dessus des utilitaires JWT/bcrypt déjà configurés
- Ajout d'un système de rôles/permissions si nécessaire
- CI/CD (exécution automatique de lint/test au push)

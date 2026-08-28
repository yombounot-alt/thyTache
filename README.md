# thyTache

Application de gestion de tâches — backend Node.js/Express/MongoDB, frontend React.

```
thyTache/
├── backend/    # API REST (voir backend/README.md)
└── frontend/   # SPA React (voir frontend/README.md)
```

Pour développer en local, chaque paquet se lance indépendamment (voir leurs README respectifs) : MongoDB local ou distant, `npm run dev` dans chaque dossier.

## Docker

`docker-compose.yml`, à la racine, lance les trois services (MongoDB, backend, frontend servi par nginx) ensemble :

```bash
cp backend/.env.example backend/.env   # puis renseigner de vraies valeurs (JWT_SECRET, SMTP...)
docker compose up --build
```

- Frontend : http://localhost:8080
- Backend (API directe, optionnel) : http://localhost:3000

Le frontend (nginx) proxyfie `/api` et `/uploads` vers le service `backend` — le navigateur n'a besoin de joindre qu'une seule origine (`:8080`), pas de souci de CORS entre conteneurs.

> Non vérifié par une exécution réelle de `docker build`/`docker compose up` (Docker n'était pas disponible dans l'environnement où ces fichiers ont été écrits) — à tester avant un usage en production.

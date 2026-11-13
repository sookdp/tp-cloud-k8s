# TP Docker et Kubernetes - Ressources

Master 2 Informatique - Architecture logicielle (AA1) - Faculté des Sciences, Aix-Marseille Université

Application fil rouge des TP n°2 (Conteneurisation) et n°3 (Orchestration de conteneurs) :
un service web Node.js « students » et sa base PostgreSQL.

| Répertoire        | Contenu                                                        | Utilisé dans |
|-------------------|----------------------------------------------------------------|--------------|
| `db/`             | `init.sql` : schéma et jeu de données initial                  | TP2          |
| `web/`            | Application (`server.js`, `public/`) et `Dockerfile` à compléter | TP2, TP3   |
| `docker-compose/` | `compose.yaml` à compléter, `.env.example`                     | TP2          |
| `k8s/`            | Manifestes Kubernetes numérotés, à compléter                   | TP3          |

Les fichiers à compléter contiennent des repères `TODO`.

## L'application web

| Route            | Rôle                                                                  |
|------------------|-----------------------------------------------------------------------|
| `GET /`          | Page web : liste des étudiants, conteneur qui a répondu, version      |
| `GET /students`  | Liste des étudiants (JSON)                                            |
| `POST /students` | Ajout d'un étudiant : `{"name": "..."}`                               |
| `GET /info`      | Nom du conteneur (ou du pod) et version                               |
| `GET /health`    | Sonde de vie : ne dépend d'aucun service externe                      |
| `GET /ready`     | Sonde de disponibilité : vérifie la connexion à la base               |
| `GET /load?ms=200` | Consomme du CPU pendant la durée demandée (test de l'autoscaling)   |

Configuration par variables d'environnement : `DB_HOST` (défaut `postgres`), `DB_PORT` (5432),
`DB_NAME` (`mydb`), `DB_USER` (`postgres`), `DB_PASS` (obligatoire), `PORT` (8000), `APP_VERSION`.

# Image de l'application web « students » - À COMPLÉTER (TP2, partie 2.3)
# Référence des instructions : https://docs.docker.com/reference/dockerfile/

# TODO 1 : partir de l'image officielle Node.js 24, variante alpine

ENV NODE_ENV=production \
    PORT=8000

# TODO 2 : définir /app comme répertoire de travail

# TODO 3 : copier package.json et package-lock.json, PUIS installer les dépendances
#          avec « npm ci --omit=dev » (pourquoi avant de copier le code ?)

# TODO 4 : copier le code de l'application (server.js et le répertoire public)

# Version affichée par l'application, fixée au moment du build (--build-arg APP_VERSION=1.0).
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}

# TODO 5 : ne pas exécuter l'application en root (l'image officielle fournit l'utilisateur « node »)

# TODO 6 : documenter le port d'écoute de l'application (voir server.js)

# Docker interroge /health toutes les 15 s et marque le conteneur healthy / unhealthy.
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:8000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

# TODO 7 : commande de démarrage du conteneur (forme « exec », entre crochets)

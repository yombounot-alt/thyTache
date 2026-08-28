FROM node:22-alpine

WORKDIR /app

# Copié séparément du reste du code pour profiter du cache Docker : les deps
# ne sont réinstallées que si package*.json change, pas à chaque édition de src/.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

# Répertoire des avatars uploadés (cf. src/config/upload.js) : créé ici pour
# ne pas dépendre d'une création implicite au premier upload dans un
# conteneur en lecture par ailleurs standard.
RUN mkdir -p uploads/avatars

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/server.js"]

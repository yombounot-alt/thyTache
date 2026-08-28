# --- Build ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_BASE_URL est figé dans le bundle au moment du build (Vite ne lit
# pas les variables d'environnement au runtime) : par défaut une URL relative,
# pour que le navigateur appelle la même origine que celle qui sert le
# frontend — c'est nginx.conf qui se charge de proxyfier /api et /uploads
# vers le service backend, sans avoir à connaître son adresse publique ici.
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# --- Serve ---
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

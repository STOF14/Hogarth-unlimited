# --- deps stage: install with dev deps for the Prisma/TS build ---
FROM node:20-bookworm-slim AS deps
WORKDIR /app
# node-unrar-js and sharp both ship native/wasm binaries that need these at install time.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate

# --- build stage ---
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

# --- runtime stage: slim image, prod deps only ---
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/index.js"]

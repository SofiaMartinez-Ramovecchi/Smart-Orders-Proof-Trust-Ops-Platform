# ---------- BUILD STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

# instalar TODO (incluye devDeps)
RUN pnpm install --frozen-lockfile

COPY . .

# build (usa nest cli)
RUN pnpm run build


# ---------- RUNTIME STAGE ----------
FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

# copiar solo lo necesario
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# instalar solo deps de prod
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]

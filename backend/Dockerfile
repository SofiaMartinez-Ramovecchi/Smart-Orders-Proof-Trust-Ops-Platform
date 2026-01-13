FROM node:22-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar manifests
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias (pnpm)
RUN pnpm install --frozen-lockfile --prod

# Copiar el resto del código
COPY . .

# Build
RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]


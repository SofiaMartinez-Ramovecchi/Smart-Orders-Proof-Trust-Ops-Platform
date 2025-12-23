FROM node:22-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar manifests
COPY package.json pnpm-lock.yaml ./

# Instalar deps
RUN pnpm install

# Copiar el resto
COPY . .

EXPOSE 1234
CMD ["pnpm", "dev"]

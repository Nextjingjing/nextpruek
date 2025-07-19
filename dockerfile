FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV PRISMA_CLI_QUERY_ENGINE_TYPE=library
RUN npm run prisma:generate
RUN npm run build

FROM node:22-slim

# Install system dependencies for Prisma
RUN apt-get update && apt-get install -y libssl3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only needed files
COPY package*.json ./
RUN npm ci --only=production

# Copy built files and Prisma output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

# Install Prisma CLI for deploy
RUN npm install -g prisma

# Expose port
EXPOSE 3000

# Run migration and then start app
CMD sh -c "prisma migrate deploy && node dist/main"
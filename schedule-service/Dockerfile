# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 3002

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]

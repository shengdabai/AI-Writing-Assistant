FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && npm run build:server

FROM node:20-alpine

WORKDIR /app

# Frontend
COPY --from=builder /app/dist ./dist

# Backend
COPY --from=builder /app/api ./api
COPY --from=builder /app/dist/api ./dist/api

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/api/server.js"]

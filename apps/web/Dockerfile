FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --filter @docask/web --frozen-lockfile || pnpm install --filter @docask/web

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .
ENV NEXT_PUBLIC_API_URL=http://localhost:3001
RUN pnpm --filter @docask/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
# COPY --from=build /app/apps/web/public ./apps/web/public 2>/dev/null || true
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

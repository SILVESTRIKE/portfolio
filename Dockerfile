# =============================================================================
# Reason for existence: Multi-stage Docker build for SILVESTRIKE Portfolio OS.
# System Impact of Absence: Cannot containerize or deploy to any OCI-compatible
# runtime (Docker, Podman, K8s, Cloud Run, Fly.io, Railway, etc).
# =============================================================================

# ---- Stage 1: deps — install production + dev dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ---- Stage 2: builder — compile Next.js standalone bundle ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args injected at build time only — never baked into the image layer
ARG GEMINI_KEY
ARG NEXT_PUBLIC_ENV=production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- Stage 3: runner — minimal runtime image ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Standalone output: only copy what Next.js says is needed
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# GEMINI_KEY must be injected at runtime via env — never baked into image
# docker run -e GEMINI_KEY=<key> ...  OR  use docker-compose secrets
CMD ["node", "server.js"]

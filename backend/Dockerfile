# =============================================================================
# Stage 1: Builder
#
# WHY a separate builder stage?
#   - We need devDependencies (TypeScript compiler, @nestjs/cli, ts-node) to
#     compile .ts → .js, but those tools must NOT ship in the final image.
#   - Keeping the compilation isolated here lets Docker cache the layer: if
#     only source files change, only stage-1 re-runs; the base OS layer and
#     pnpm install layer are reused, making CI builds fast.
# =============================================================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.8.0 --activate

WORKDIR /app

# Copy manifests first so Docker can cache the pnpm-install layer separately
# from source changes. Re-installing only happens when these files change.
COPY package.json pnpm-lock.yaml .npmrc ./

# Install ALL dependencies (including devDependencies) needed to compile TS.
RUN pnpm install --frozen-lockfile

# Copy source after deps so edits to .ts files don't bust the install cache
COPY . .

# Compile TypeScript → JavaScript (output goes to ./dist per nest-cli.json)
RUN pnpm build


# =============================================================================
# Stage 2: Production
#
# WHY start from a fresh base instead of just pruning stage 1?
#   - COPY --from=builder copies only what we explicitly select, so zero
#     devDependencies, zero TypeScript sources, zero compiler binaries end up
#     in the final layer. This produces a significantly smaller image (often
#     50-70 % smaller) which means faster Cloud Run cold-start times and a
#     reduced attack surface (fewer binaries an attacker could exploit).
# =============================================================================
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@10.8.0 --activate

# Run as a non-root user for security — principle of least privilege.
# node:alpine ships with user 'node' (uid 1000) by default.
RUN mkdir -p /app && chown node:node /app
USER node
WORKDIR /app

# Copy manifests and install ONLY production dependencies.
# --prod ensures devDependencies are never installed here.
COPY --chown=node:node package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod

# Copy the compiled JavaScript from the builder stage — no .ts files included.
COPY --chown=node:node --from=builder /app/dist ./dist

# Default port (overridable via PORT env var, matched in main.ts)
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main"]

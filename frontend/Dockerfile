# =============================================================================
# Stage 1: Build
#
# WHY a dedicated build stage?
#   - Vite, TypeScript, all @types/* packages, and testing tools are needed to
#     produce optimised static assets but are completely useless at serve time.
#   - Isolating the build lets us discard ~200 MB of tooling from the final
#     image. The builder stage is also cache-friendly: the pnpm install layer
#     only re-runs when package.json / pnpm-lock.yaml change, not on every
#     source edit.
# =============================================================================
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@10.8.0 --activate

WORKDIR /app

# Install deps before copying source so Docker can cache this layer.
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Copy source and compile.
# `pnpm build` runs `tsc && vite build`, producing optimised assets in
# ./dist. Vite performs tree-shaking, code-splitting, and minification here.
COPY . .

# Vite bakes VITE_* variables into the JS bundle at build time.
# These ARGs are injected by CI (e.g. docker build --build-arg VITE_API_URL=...).
# They must be declared here — inside the stage that runs the build — so Vite
# can read them from the environment. An empty default is fine for local builds
# that pass a .env file separately.
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN pnpm build


# =============================================================================
# Stage 2: Serve
#
# WHY nginx:alpine instead of keeping node running vite preview?
#   - nginx is purpose-built for serving static files: it handles gzip,
#     cache-control headers, and 10 k concurrent connections with a tiny
#     memory footprint (~5 MB RSS).
#   - The final image contains ONLY nginx + the compiled assets; no Node
#     runtime, no npm, no source code — drastically reducing the attack
#     surface and image size (≈25 MB vs ≈200 MB for a node stage).
#
# Note: In production the frontend is served from GCS + Cloud CDN; this stage
# is used for local dev / staging / PR preview environments.
# =============================================================================
FROM nginx:alpine AS serve

# Remove the default nginx placeholder page
RUN rm -rf /usr/share/nginx/html/*

# Copy only the compiled static assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Single-page application routing: unknown paths fall back to index.html so
# that React Router can handle them client-side.
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # Serve pre-compressed assets when the browser supports gzip\n\
    gzip_static on;\n\
\n\
    # SPA fallback — all routes return index.html\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

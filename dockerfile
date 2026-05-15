# ---------- Builder Stage ----------
FROM node:22-alpine AS builder

RUN apk add --no-cache bash python3 make g++ git fontconfig ttf-dejavu ffmpeg

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

RUN yarn global add typescript ts-alias cpy-cli

COPY . .

# Copy fonts (with error handling)
RUN mkdir -p /usr/share/fonts/custom && \
    if [ -d "src/assets/fonts" ]; then \
        cp -r src/assets/fonts/* /usr/share/fonts/custom/ 2>/dev/null || true; \
    fi

# Build TypeScript
RUN yarn build

# ---------- Production Stage ----------
FROM node:22-alpine

RUN apk add --no-cache \
    fontconfig \
    ttf-dejavu \
    ffmpeg \
    bash \
    python3 \
    make \
    g++ \
    git \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

WORKDIR /app

# Copy built app and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /usr/share/fonts/custom /usr/share/fonts/custom

# Update font cache
RUN fc-cache -f -v

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "dist/app.js"]
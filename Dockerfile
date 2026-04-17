FROM oven/bun:1-alpine AS build
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-alpine
WORKDIR /app

COPY --from=build /app/public ./public
COPY --from=build /app/src ./src
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json .

EXPOSE 3000

ARG VERSION
ENV VERSION=${VERSION}

CMD ["bun", "src/server.ts"]

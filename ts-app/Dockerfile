FROM node:20-alpine3.19 AS base

FROM base AS builder
WORKDIR /home/app

COPY package*.json .
COPY tsconfig.json .

RUN npm install

COPY src/ src/

RUN npm run build

# runner stage 2

FROM base AS runner

WORKDIR /home/app

COPY --from=builder /home/app/dist dist/
COPY --from=builder /home/app/package*.json ./

RUN npm install --omit=dev

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system -u 1001 nodejs

USER nodejs

CMD [ "npm","start" ]
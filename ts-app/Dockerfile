FROM node:20-alpine3.19 as base

FROM base as builder
WORKDIR /home/app

COPY package*.json .
COPY tsconfig.json .

RUN npm install

COPY src/ src/

RUN npm run build

CMD [ "npm","start" ]

#runner stage 2

FROM base as runner

WORKDIR /home/app

COPY --from=builder /home/app/dist dist/
COPY --from=builder /home/app/package*.json ./

RUN npm install --omit=dev

CMD [ "npm","start" ]

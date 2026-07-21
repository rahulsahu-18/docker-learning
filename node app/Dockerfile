FROM node:20.17.0-alpine3.19

WORKDIR /home/app

COPY package.json /home/app/package.json
COPY package-lock.json /home/app/package-lock.json
RUN npm install
EXPOSE 6000
COPY index.js index.js
CMD [ "npm","start" ]
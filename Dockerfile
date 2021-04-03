FROM node:15.9.0-alpine

WORKDIR /app/

COPY package.json .
RUN npm install --only=prod --legacy-peer-deps

ADD . /app/
RUN npm run-script build

CMD [ "npm", "run", "start:prod" ]
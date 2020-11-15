FROM node:15.2.0-alpine3.10

WORKDIR /app/node

COPY package.json .
RUN npm install

ADD . /app/node
RUN npm run build

CMD [ "npm", "run", "start" ]
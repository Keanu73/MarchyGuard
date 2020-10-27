FROM node:10.13.0-alpine

WORKDIR /app/node

COPY package.json .
RUN npm install

ADD . /app/node
RUN npm run build

CMD [ "npm", "start" ]
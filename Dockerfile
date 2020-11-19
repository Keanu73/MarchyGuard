FROM node:15.2.0

WORKDIR /app/

COPY package.json .
RUN npm install --legacy-peer-deps

ADD . /app/
RUN npm run build

CMD [ "npm", "run", "start:prod" ]
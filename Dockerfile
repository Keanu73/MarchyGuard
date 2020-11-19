FROM node:15.2.0

WORKDIR /app/

COPY package.json .
RUN npm install --legacy-peer-deps

ADD . /app/

CMD [ "npm", "run", "start:prod" ]
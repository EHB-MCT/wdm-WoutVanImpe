FROM node:latest

COPY package*.json .

RUN npm install

COPY knexfile.js .
COPY migrations/* .

EXPOSE $API_PORT

CMD ["npm", "start"]
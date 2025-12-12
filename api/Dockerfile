FROM node:latest

COPY package*.json .

RUN npm i --quiet

COPY . .

EXPOSE $API_PORT

CMD ["npm", "start"]
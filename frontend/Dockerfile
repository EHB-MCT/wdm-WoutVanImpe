FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm i --quiet

COPY src ./src
COPY next.config.ts .
COPY tsconfig.json .

EXPOSE $FRONTEND_PORT

CMD ["npm", "run", "dev"]
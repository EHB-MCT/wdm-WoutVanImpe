FROM node:latest

COPY package*.json .

RUN npm i --quiet

COPY src .
COPY next.config.ts .
COPY tsconfig.json .

EXPOSE 3001

CMD ["npm", "run", "dev"]
FROM node:latest

COPY package*.json .

RUN npm i --quiet

COPY src src

EXPOSE $TESSERACT_PORT

CMD ["npm", "run", "start"]
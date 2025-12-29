FROM node:20-alpine

# Set working directory
WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_ENV=production

RUN apk add --no-cache dumb-init

COPY package*.json ./

RUN npm ci --only=production --quiet

COPY src ./src/

EXPOSE $TESSERACT_PORT

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update -y && apt-get install -y openssl

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
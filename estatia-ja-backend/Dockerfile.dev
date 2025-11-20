FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update -y && apt-get install -y openssl

COPY . .

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

# Usa uma imagem Node.js enxuta como base
FROM node:18-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de dependências
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# O Prisma precisa do OpenSSL, então garantimos que ele está instalado
RUN apt-get update -y && apt-get install -y openssl

# Copia todo o resto do código do projeto para o diretório de trabalho
COPY . .

# --- NOSSAS MUDANÇAS COMEÇAM AQUI ---

# 1. Copia o script de entrypoint para dentro do container
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# 2. Dá permissão de execução para o script
RUN chmod +x /app/docker-entrypoint.sh

# 3. Define nosso script como o ponto de entrada do container
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# --- FIM DAS MUDANÇAS ---

# Expõe a porta 3000 para que possamos acessá-la de fora do container
EXPOSE 3000

# Define o comando padrão que será executado pelo entrypoint.
# Mudei de "start" para "run dev" para bater com o seu docker-compose.yml
CMD ["npm", "run", "dev"]
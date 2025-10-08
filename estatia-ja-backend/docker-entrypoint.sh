#!/bin/sh

# Aborta o script se qualquer comando falhar
set -e

echo "Running database migrations..."
# Roda as migrações do banco de dados
npx prisma migrate deploy

echo "Generating Prisma Client..."
# Gera o cliente Prisma (boa prática após migrações)
npx prisma generate

echo "Starting the application..."
# Executa o comando que foi passado para o container.
# No seu caso, será "npm run dev".
# O "exec" é importante para que o processo do app substitua o script,
# recebendo corretamente os sinais do Docker (como o de parada).
exec "$@"
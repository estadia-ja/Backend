#!/bin/sh

# Aborta o script se qualquer comando falhar
set -e

echo "📦 Verificando dependências do projeto..."

# Se o diretório node_modules não existir, instala as dependências
if [ ! -d "node_modules" ]; then
  echo "📥 Instalando dependências..."
  npm install
else
  echo "✅ Dependências já instaladas."
fi

echo "🗃️ Executando migrações do banco de dados..."
# Executa as migrações
npx prisma migrate deploy

echo "⚙️ Gerando Prisma Client..."
# Gera o cliente Prisma (boa prática após migrações)
npx prisma generate

echo "🚀 Iniciando a aplicação..."
# Substitui o shell atual pelo processo do Node (importante para sinais do Docker)
exec "$@"

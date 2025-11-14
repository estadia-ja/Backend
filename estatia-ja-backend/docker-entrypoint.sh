set -e

echo "Verificando dependências do projeto..."

if [ ! -d "node_modules" ]; then
  echo "Instalando dependências..."
  npm install
else
  echo "Dependências já instaladas."
fi

echo "Executando migrações do banco de dados..."
npx prisma migrate deploy

echo "Gerando Prisma Client..."
npx prisma generate

echo "Iniciando a aplicação..."
exec "$@"

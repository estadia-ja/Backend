import { execSync } from 'node:child_process';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { URL } from 'node:url';

const originalDatabaseUrl = process.env.DATABASE_URL;

const workerId = process.env.VITEST_WORKER_ID || '1';
const schemaName = `test_${workerId}`;

const url = new URL(originalDatabaseUrl);
url.searchParams.set('schema', schemaName);
const workerDatabaseUrl = url.toString();

process.env.DATABASE_URL = workerDatabaseUrl;

const prisma = new PrismaClient();

beforeAll(async () => {
  console.log(`[Worker ${workerId}]: Configurando schema '${schemaName}'`);

  const adminPrisma = new PrismaClient({
    datasources: { estadia_db: { url: originalDatabaseUrl } }, // <--- CORREÇÃO AQUI
  });

  try {
    await adminPrisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE;`);
    await adminPrisma.$executeRawUnsafe(`CREATE SCHEMA "${schemaName}";`);
    
    console.log(`[Worker ${workerId}]: Schema criado. Aplicando migrations...`);
    
    execSync('npx prisma db push --skip-generate');
    
    console.log(`[Worker ${workerId}]: Migrations prontas.`);
  } catch (e) {
    console.error(`[Worker ${workerId}]: Falha no setup do DB`, e);
    throw e;
  } finally {
    await adminPrisma.$disconnect();
  }
});

afterEach(async () => {
  console.log(`[Worker ${workerId}]: Limpando (afterEach)...`);

  const tablesnames = await prisma.$queryRaw`
        SELECT tablename FROM pg_tables WHERE schemaname = ${schemaName}
    `;
    
  const tables = tablesnames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"${schemaName}"."${name}"`)
    .join(', ');

  try {
    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  } catch (error) {
    console.error({ error });
  }
});

afterAll(async () => {
  await prisma.$disconnect();

  const adminPrisma = new PrismaClient({
    datasources: { estadia_db: { url: originalDatabaseUrl } },
  });
  
  try {
    console.log(`[Worker ${workerId}]: Removendo schema '${schemaName}'...`);
    await adminPrisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE;`);
  } catch (e) {
    console.error(`[Worker ${workerId}]: Falha no teardown do DB`, e);
  } finally {
    await adminPrisma.$disconnect();
  }
});
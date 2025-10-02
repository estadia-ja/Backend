import { execSync } from "node:child_process";
import { afterAll, beforeAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(() => {
    process.env.DATABASE_URL = process.env.DATABASE_URL;

    console.log('aplica migrations no banco teste');
    execSync('npx prisma migrate deploy');
    console.log('migrations feitas');
});

afterAll( async () => {
    console.log('limpa o banco teste');

    const tablesnames = await prisma.$queryRaw`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;

    const tables = tablesnames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== '_prisma_migrations')
        .map((name) => `"public"."${name}"`)
        .join(', ');

    try {
        if(tables.length > 0) {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)
        }
    } catch (error) {
        console.error({ error });
    }

    await prisma.$disconnect();
    console.log('banco limpo');
});
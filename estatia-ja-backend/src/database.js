const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testConnection = async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('Conectado oa PostgreSQL');
        return true
    } catch (error) {
        console.log('Erro ao tentar conectar:', error.message);
        return false
    }
};

module.exports = { prisma, testConnection }
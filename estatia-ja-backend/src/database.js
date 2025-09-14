const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const testConnection = async () => {
    try{
        const client = await pool.connect();
        console.log('Conectado com o postgres')
        client.release(); 
        return true;
    }catch (error) {
        console.log('Erro de conecção com o banco', error.message);
        return false;
    }
};

module.exports = {pool, testConnection}
const express = require('express');
const { testConnection } = require('./database');
const { swaggerUi, specs } = require('./swagger');
const userRoutes = require('./User/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())

//Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

//hello world
app.get('/', (req,res) => {
    res.json({
        message:'Hello world',
        status:'Ok'
    });
});

//teste banco
app.get('/test-db', async (req,res) => {
    const isConnected = await testConnection();

    res.json({
        message: 'Teste de conexão com o banco',
        database: isConnected ? 'Conectado' : 'Error'
    });
});

//Rotas da api
app.use('/user', userRoutes);

app.listen(PORT, () => {
    console.log(`Rodando na porta ${PORT}`)
});
const express = require('express');
const { testConnection } = require('./database');
const { swaggerUi, specs } = require('./swagger');
const userRoutes = require('./user/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())

//Rotas da api
app.use('/user', userRoutes);

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

app.listen(PORT, () => {
    console.log(`Rodando na porta ${PORT}`)
});
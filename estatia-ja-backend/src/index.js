const express = require('express');
const { testConnection } = require('./database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const userRoutes = require('./user/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())

//Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
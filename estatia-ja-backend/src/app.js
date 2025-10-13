import express from 'express';
import { testConnection } from './database.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import userRoutes from './user/routes.js';
import propertyRoutes from './property/routes.js'

const app = express();

app.use(express.json());

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Teste banco
app.get('/test-db', async (req, res) => {
    const isConnected = await testConnection();
    res.json({
        message: 'Teste de conexão com o banco',
        database: isConnected ? 'Conectado' : 'Error'
    });
});

// Rotas da api
app.use('/user', userRoutes);
app.use('/property', propertyRoutes)

export { app }; 
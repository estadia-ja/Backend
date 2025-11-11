import express from 'express';
import { testConnection } from './database.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import cors from 'cors';
import userRoutes from './user/routes.js';
import propertyRoutes from './property/routes.js';
import reserveRoutes from './reserve/routes.js';
import propertyValuationRoutes from './propertyValuation/routes.js';
import clientValuationRoutes from './clientValuation/routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Teste banco
app.get('/test-db', async (req, res) => {
  const isConnected = await testConnection();
  res.json({
    message: 'Teste de conexão com o banco',
    database: isConnected ? 'Conectado' : 'Error',
  });
});

// Rotas da api
app.use('/user', userRoutes);
app.use('/property', propertyRoutes);
app.use('/reserve', reserveRoutes);
app.use('/property-valuation', propertyValuationRoutes);
app.use('/client-valuation', clientValuationRoutes);
export { app };

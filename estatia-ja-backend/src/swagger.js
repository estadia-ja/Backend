import swaggerJSDoc from 'swagger-jsdoc';

const isProduction = process.env.NODE_ENV === 'production';

const productionServer = {
  url: 'https://estadia-ja-backend.onrender.com',
  description: 'Servidor de Produção (Render)',
};

const developmentServer = {
  url: 'http://localhost:3000', 
  description: 'Servidor de Desenvolvimento',
};

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Estadia ja',
    version: '1.0.0',
    description: 'Documentação da api',
  },
  servers: isProduction ? [productionServer, developmentServer] : [developmentServer, productionServer],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  tags: [
    {
      name: 'Usuários',
      description: 'Gerenciamento das rotas de usuário',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    './src/user/routes.js',
    './src/property/routes.js',
    './src/reserve/routes.js',
    './src/propertyValuation/routes.js',
    './src/clientValuation/routes.js',
    './src/payment/routes.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
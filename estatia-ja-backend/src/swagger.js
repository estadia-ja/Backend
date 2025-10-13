import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Estadia ja',
        version: '1.0.0',
        description: 'Documentação da api'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Servidor de desenvolvimento'
        },
    ],
    components:{
        securitySchemes:{
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    tags: [
        {
            name: 'Usuários',
            description: 'Gerenciamento das rotas de usuário'
        }
    ],
};

const options = {
    swaggerDefinition,
    apis: [
      './src/user/routes.js',
      './src/property/routes.js'
    ],
  };

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
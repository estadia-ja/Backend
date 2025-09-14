const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Estadia Já',
            version: '1.0.0',
            description: 'APi',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desenvolvimento',
            },
        ],
    },
    apis: ['./src/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
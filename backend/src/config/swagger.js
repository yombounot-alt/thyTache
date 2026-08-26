const swaggerJsdoc = require('swagger-jsdoc');
const { env } = require('./env');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: `${env.appName} - Documentation API`,
      version: '1.0.0',
      description: "Documentation de l'API REST (générée avec Swagger/OpenAPI).",
    },
    servers: [
      {
        url: `http://localhost:${env.port}${env.apiPrefix}`,
        description: 'Serveur local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Les annotations JSDoc @openapi placées dans les fichiers de routes seront
  // automatiquement agrégées dans la documentation.
  apis: ['./src/routes/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

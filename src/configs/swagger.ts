import swaggerJSDoc from 'swagger-jsdoc';
export const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student And Teacher Management',
      version: '1.0.0',
      description: 'Swagger API documentation for Student And Teacher Management.',
    },
    servers: [
      {
        url: `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`,
      },
    ],
  },
  apis: ['src/routes/*.ts'],
};
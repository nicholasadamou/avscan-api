/**
 * Swagger configuration for AV Scan API
 *
 * Contains all Swagger/OpenAPI configuration and schema definitions.
 */

const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Swagger configuration options
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AV Scan API',
      version: '1.0.0',
      description: 'A Node.js Express server that provides antivirus scanning capabilities using ClamAV antivirus engine.',
      contact: {
        name: 'Nicholas Adamou',
        email: 'nicholas.adamou@outlook.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        ScanResponse: {
          type: 'object',
          properties: {
            clean: {
              type: 'boolean',
              description: 'Whether the file is clean (no viruses detected)',
              example: true
            },
            rawOutput: {
              type: 'string',
              description: 'Raw output from the ClamAV scanner',
              example: 'File is clean - no threats detected'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Scan failed'
            },
            details: {
              type: 'string',
              description: 'Detailed error information',
              example: 'ClamAV scanner not found or failed to execute'
            }
          }
        }
      }
    }
  },
  apis: ['./routes.js', './server.js'] // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;

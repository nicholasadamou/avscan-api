/**
 * Unit tests for Swagger configuration
 *
 * Tests the Swagger/OpenAPI specification structure and configuration.
 */

// Mock swagger-jsdoc
const mockSwaggerJsdoc = jest.fn();
jest.mock('swagger-jsdoc', () => mockSwaggerJsdoc);

describe('Swagger Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('Swagger specification structure', () => {
    it('should generate proper OpenAPI 3.0 specification', () => {
      // Mock the return value
      mockSwaggerJsdoc.mockReturnValue({
        openapi: '3.0.0',
        info: {
          title: 'AV Scan API',
          version: '1.0.0'
        }
      });

      const swaggerSpec = require('../config/swagger');

      expect(swaggerSpec).toBeDefined();
      expect(swaggerSpec.openapi).toBe('3.0.0');
    });

    it('should include proper API information', () => {
      mockSwaggerJsdoc.mockReturnValue({
        info: {
          title: 'AV Scan API',
          version: '1.0.0',
          description: 'A Node.js Express server that provides antivirus scanning capabilities',
          contact: {
            name: 'Nicholas Adamou',
            email: 'nicholas@example.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          }
        }
      });

      const swaggerSpec = require('../config/swagger');

      expect(swaggerSpec.info.title).toBe('AV Scan API');
      expect(swaggerSpec.info.version).toBe('1.0.0');
      expect(swaggerSpec.info.description).toContain('antivirus scanning');
      expect(swaggerSpec.info.contact.name).toBe('Nicholas Adamou');
      expect(swaggerSpec.info.license.name).toBe('MIT');
    });

    it('should include server configuration', () => {
      mockSwaggerJsdoc.mockReturnValue({
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Development server'
          }
        ]
      });

      const swaggerSpec = require('../config/swagger');

      expect(swaggerSpec.servers).toHaveLength(1);
      expect(swaggerSpec.servers[0].url).toBe('http://localhost:3000');
      expect(swaggerSpec.servers[0].description).toBe('Development server');
    });

    it('should include response schemas', () => {
      mockSwaggerJsdoc.mockReturnValue({
        components: {
          schemas: {
            ScanResponse: {
              type: 'object',
              properties: {
                clean: {
                  type: 'boolean',
                  description: 'Whether the file is clean'
                },
                rawOutput: {
                  type: 'string',
                  description: 'Raw output from scanner'
                }
              }
            },
            ErrorResponse: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  description: 'Error message'
                },
                details: {
                  type: 'string',
                  description: 'Detailed error information'
                }
              }
            }
          }
        }
      });

      const swaggerSpec = require('../config/swagger');

      expect(swaggerSpec.components.schemas.ScanResponse).toBeDefined();
      expect(swaggerSpec.components.schemas.ErrorResponse).toBeDefined();
      expect(swaggerSpec.components.schemas.ScanResponse.properties.clean.type).toBe('boolean');
      expect(swaggerSpec.components.schemas.ErrorResponse.properties.error.type).toBe('string');
    });
  });

  describe('Swagger configuration options', () => {
    it('should call swagger-jsdoc with correct options', () => {
      mockSwaggerJsdoc.mockReturnValue({});

      require('../config/swagger');

      expect(mockSwaggerJsdoc).toHaveBeenCalledWith(
        expect.objectContaining({
          definition: expect.objectContaining({
            openapi: '3.0.0',
            info: expect.any(Object),
            servers: expect.any(Array),
            components: expect.any(Object)
          }),
          apis: expect.arrayContaining(['./routes.js', './server.js'])
        })
      );
    });

    it('should include correct API file paths', () => {
      mockSwaggerJsdoc.mockReturnValue({});

      require('../config/swagger');

      const options = mockSwaggerJsdoc.mock.calls[0][0];
      expect(options.apis).toContain('./routes.js');
      expect(options.apis).toContain('./server.js');
    });
  });

  describe('Schema validation', () => {
    it('should have valid ScanResponse schema', () => {
      mockSwaggerJsdoc.mockReturnValue({
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
                  description: 'Raw output from the antivirus scanner',
                  example: 'Scan completed successfully. Found: 0'
                }
              }
            }
          }
        }
      });

      const swaggerSpec = require('../config/swagger');
      const scanResponse = swaggerSpec.components.schemas.ScanResponse;

      expect(scanResponse.type).toBe('object');
      expect(scanResponse.properties.clean.type).toBe('boolean');
      expect(scanResponse.properties.rawOutput.type).toBe('string');
      expect(scanResponse.properties.clean.example).toBe(true);
    });

    it('should have valid ErrorResponse schema', () => {
      mockSwaggerJsdoc.mockReturnValue({
        components: {
          schemas: {
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
                  example: 'Scanner not found or failed to execute'
                }
              }
            }
          }
        }
      });

      const swaggerSpec = require('../config/swagger');
      const errorResponse = swaggerSpec.components.schemas.ErrorResponse;

      expect(errorResponse.type).toBe('object');
      expect(errorResponse.properties.error.type).toBe('string');
      expect(errorResponse.properties.details.type).toBe('string');
      expect(errorResponse.properties.error.example).toBe('Scan failed');
    });
  });

  describe('Export functionality', () => {
    it('should export swagger specification', () => {
      const mockSpec = { mock: 'swagger-spec' };
      mockSwaggerJsdoc.mockReturnValue(mockSpec);

      const swaggerSpec = require('../config/swagger');

      expect(swaggerSpec).toBe(mockSpec);
    });
  });
});

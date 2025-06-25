/**
 * Test setup and configuration
 *
 * Configures Jest mocks and test environment for the AV Scan API tests.
 */

// Mock child_process.exec
const mockExec = jest.fn();
jest.mock('child_process', () => ({
  exec: mockExec
}));

// Mock fs.unlinkSync and other fs methods
const mockUnlinkSync = jest.fn();
const mockReadFileSync = jest.fn();
jest.mock('fs', () => ({
  unlinkSync: mockUnlinkSync,
  readFileSync: mockReadFileSync
}));

// Mock multer
const mockSingle = jest.fn();
const mockMulter = jest.fn(() => ({
  single: mockSingle
}));

// Configure single() to return a middleware function
mockSingle.mockImplementation((fieldName) => {
  return (req, res, next) => {
    // Check if we're dealing with a file upload based on content-type
    const contentType = req.headers['content-type'];
    const hasMultipart = contentType && contentType.includes('multipart/form-data');
    
    // Only add file if there's multipart data (simulating actual multer behavior)
    if (req.method === 'POST' && req.url === '/scan' && hasMultipart) {
      req.file = {
        path: '/tmp/mock-file-path',
        originalname: 'test-file.txt',
        mimetype: 'text/plain',
        size: 1024
      };
    }
    next();
  };
});

jest.mock('multer', () => mockMulter);

// Mock swagger-jsdoc
const mockSwaggerJsdoc = jest.fn();
mockSwaggerJsdoc.mockReturnValue({
  openapi: '3.0.0',
  info: {
    title: 'AV Scan API',
    version: '1.0.0',
    description: 'A Node.js Express server that provides antivirus scanning capabilities'
  },
  servers: [{ url: 'http://localhost:3000' }],
  components: {
    schemas: {
      ScanResponse: { type: 'object' },
      ErrorResponse: { type: 'object' }
    }
  }
});
jest.mock('swagger-jsdoc', () => mockSwaggerJsdoc);

// Mock console.warn to suppress expected warning messages during tests
const originalWarn = console.warn;
beforeEach(() => {
  console.warn = jest.fn();
});

afterEach(() => {
  console.warn = originalWarn;
});

// Mock swagger-ui-express
const mockSwaggerUiServe = jest.fn();
const mockSwaggerUiSetup = jest.fn();
const mockSwaggerUi = {
  serve: [mockSwaggerUiServe],
  setup: mockSwaggerUiSetup
};
mockSwaggerUiSetup.mockReturnValue((req, res) => {
  res.send('Swagger UI Mock');
});
jest.mock('swagger-ui-express', () => mockSwaggerUi);

// Export mocks for use in tests
module.exports = {
  mockExec,
  mockUnlinkSync,
  mockReadFileSync,
  mockMulter
};

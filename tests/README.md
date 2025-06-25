# AV Scan API Tests

This directory contains comprehensive unit and integration tests for the AV Scan API.

## Test Structure

### Test Files

- **`setup.js`** - Test configuration and mock setup
- **`routes.test.js`** - Unit tests for route handlers
- **`server.test.js`** - Unit tests for server configuration
- **`swagger.test.js`** - Unit tests for Swagger configuration
- **`integration.test.js`** - Integration tests for complete application flow

### Test Coverage

The tests cover:

#### Routes (`routes.test.js`)
- ✅ GET `/` - API information endpoint
- ✅ POST `/scan` - File scanning endpoint
- ✅ File upload validation
- ✅ Scanner execution and response parsing
- ✅ Error handling for various scenarios
- ✅ File cleanup after scanning
- ✅ Different file types and sizes
- ✅ Concurrent request handling

#### Server (`server.test.js`)
- ✅ Server setup and configuration
- ✅ Middleware integration
- ✅ Swagger documentation setup
- ✅ Route mounting
- ✅ Error handling

#### Swagger (`swagger.test.js`)
- ✅ OpenAPI 3.0 specification structure
- ✅ API metadata and information
- ✅ Response schema definitions
- ✅ Server configuration
- ✅ Schema validation

#### Integration (`integration.test.js`)
- ✅ Complete file upload and scan workflow
- ✅ API documentation integration
- ✅ Error handling across the application
- ✅ File handling for different types and sizes
- ✅ Performance and reliability testing
- ✅ Concurrent request handling

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Files
```bash
# Run only route tests
npm test -- routes.test.js

# Run only integration tests
npm test -- integration.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should handle"
```

## Test Configuration

### Jest Configuration
The Jest configuration is defined in `package.json`:

```json
{
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "**/*.js",
      "!node_modules/**",
      "!coverage/**",
      "!**/*.test.js"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": [
      "text",
      "lcov",
      "html"
    ]
  }
}
```

### Mocks
The tests use several mocks to isolate the code under test:

- **`child_process.exec`** - Mocked to simulate scanner execution
- **`fs.unlinkSync`** - Mocked to verify file cleanup
- **`multer`** - Mocked for file upload handling
- **`swagger-ui-express`** - Mocked for documentation testing

## Test Scenarios

### File Scanning Tests
- Clean file detection
- Infected file detection
- Scanner errors and timeouts
- File cleanup verification
- Different file types and sizes
- Large file handling

### Error Handling Tests
- Missing file uploads
- Scanner execution failures
- File system errors
- Malformed requests
- Network timeouts

### API Documentation Tests
- Swagger UI serving
- API information endpoint
- Schema validation
- Response format verification

### Performance Tests
- Concurrent request handling
- Large file processing
- Memory usage verification
- Response time validation

## Coverage Reports

After running tests with coverage, you can view detailed reports:

- **Text Report**: Displayed in the terminal
- **HTML Report**: Generated in `coverage/lcov-report/index.html`
- **LCOV Report**: Generated in `coverage/lcov.info`

## Best Practices

### Writing New Tests
1. Follow the existing naming convention: `describe('Feature', () => {})`
2. Use descriptive test names that explain the scenario
3. Mock external dependencies appropriately
4. Test both success and failure scenarios
5. Verify cleanup operations
6. Test edge cases and error conditions

### Test Organization
- Group related tests using `describe` blocks
- Use `beforeEach` to set up test state
- Use `afterEach` to clean up after tests
- Keep tests independent and isolated

### Mocking Guidelines
- Mock external dependencies (file system, network calls)
- Don't mock the code you're testing
- Use realistic mock data and responses
- Verify that mocks are called with expected parameters

## Troubleshooting

### Common Issues

1. **Mock not working**: Ensure mocks are set up in `setup.js` and imported correctly
2. **Test isolation**: Use `jest.clearAllMocks()` in `beforeEach` hooks
3. **Async tests**: Use `async/await` for asynchronous operations
4. **File uploads**: Use `supertest`'s `.attach()` method for file uploads

### Debugging Tests
```bash
# Run tests with verbose output
npm test -- --verbose

# Run a specific test with debugging
npm test -- --testNamePattern="specific test name" --verbose
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines. The test suite:

- Runs quickly (< 30 seconds)
- Provides clear pass/fail results
- Generates coverage reports
- Uses isolated mocks for reliability
- Handles concurrent execution

/**
 * AV Scan API Server
 *
 * A Node.js Express server that provides antivirus scanning capabilities
 * using McAfee VirusScan Command Line Scanner.
 *
 * @author Nicholas Adamou
 * @version 1.0.0
 */

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const routes = require('./routes');
const swaggerSpec = require('./config/swagger');

const app = express();

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec));

// Use routes
app.use('/', routes);

/**
 * Start the Express server
 *
 * Initializes the server on port 3000 and logs a startup message.
 */
app.listen(3000, () => {
  console.log('AV Scan API running on port 3000');
  console.log('API Documentation available at: http://localhost:3000/api-docs');
});

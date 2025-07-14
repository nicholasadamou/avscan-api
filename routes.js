/**
 * Routes for AV Scan API
 *
 * Contains all route handlers and Swagger documentation for the API endpoints.
 */

const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * Get the appropriate ClamAV scanner path based on the operating system
 */
function getScannerPath() {
  const scannerPaths = {
    win32: '"C:\\Program Files\\ClamAV\\clamscan.exe"',
    default: 'clamscan'
  };

  return scannerPaths[process.platform] || scannerPaths.default;
}

/**
 * Set uploaded file to read-only mode for security
 * @param {string} filePath - Path to the file to be made read-only
 */
function setFileReadOnly(filePath) {
  try {
    // Set file permissions to read-only (444 in octal = r--r--r--)
    fs.chmodSync(filePath, 0o444);
  } catch (error) {
    console.warn('Failed to set file as read-only:', error.message);
    // Don't throw error - continue with scan even if chmod fails
  }
}

/**
 * Clean up uploaded file
 * @param {string} filePath - Path to the file to be cleaned up
 */
function cleanupFile(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (cleanupError) {
    console.warn('Failed to cleanup uploaded file:', cleanupError.message);
  }
}

/**
 * Handle a scan result based on ClamAV exit codes
 * @param {Object} error - Error object from exec
 * @param {string} stdout - Standard output from ClamAV
 * @param {string} stderr - Standard error from ClamAV
 * @returns {Object} Response object with clean status and output
 */
function handleScanResult(error, stdout, stderr) {
  // ClamAV exit codes: 0 = clean, 1 = virus found, 2+ = error
  const exitCode = error?.code || 0;

  const responses = {
    0: {
      clean: true,
      rawOutput: stdout || 'File is clean - no threats detected'
    },
    1: {
      clean: false,
      rawOutput: stdout || 'Virus detected by ClamAV'
    },
    default: {
      error: true,
      message: 'Scan failed',
      details: stderr || error?.message || 'Unknown error'
    }
  };

  return responses[exitCode] || responses.default;
}

/**
 * POST /scan - Scan an uploaded file for viruses
 *
 * Accepts a file upload and scans it using ClamAV antivirus scanner.
 * The uploaded file is automatically cleaned up after scanning.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.file - Multer file object containing uploaded file info
 * @param {string} req.file.path - Path to the uploaded file
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with scan results
 * @returns {boolean} returns.clean - Whether the file is clean (no viruses detected)
 * @returns {string} returns.rawOutput - Raw output from the antivirus scanner
 * @returns {Object} returns.error - Error details if scan fails
 *
 * @example
 * // Upload a file and scan it
 * const formData = new FormData();
 * formData.append('file', fileInput.files[0]);
 *
 * fetch('/scan', {
 *   method: 'POST',
 *   body: formData
 * })
 * .then(response => response.json())
 * .then(data => {
 *   console.log('File is clean:', data.clean);
 *   console.log('Scan output:', data.rawOutput);
 * });
 */
/**
 * @swagger
 * /scan:
 *   post:
 *     summary: Scan an uploaded file for viruses
 *     description: Accepts a file upload and scans it using ClamAV antivirus scanner. The uploaded file is automatically cleaned up after scanning.
 *     tags: [Scanning]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to be scanned for viruses
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: Scan completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScanResponse'
 *       400:
 *         description: Bad request - no file provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error - scan failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/scan', upload.single('file'), (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({
      error: 'No file provided',
      details: 'Please upload a file to scan'
    });
  }

  const filePath = req.file.path;

  // Set the file to read-only mode immediately after upload for security
  setFileReadOnly(filePath);

  const scannerPath = getScannerPath();

  // ClamAV command with options:
  // --no-summary: Don't print summary
  // --infected: Only print infected files
  // --suppress-ok-results: Don't print OK results
  const command = `${scannerPath} --no-summary --infected --suppress-ok-results "${filePath}"`;

  exec(command, (error, stdout, stderr) => {
    // Clean up the uploaded file afterward
    cleanupFile(filePath);

    const result = handleScanResult(error, stdout, stderr);

    // Handle error cases
    if (result.error) {
      return res.status(500).json({
        error: result.message,
        details: result.details
      });
    }

    // Return successful scan result
    res.json({
      clean: result.clean,
      rawOutput: result.rawOutput
    });
  });
});

/**
 * GET / - API information
 *
 * Returns basic information about the API.
 */
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get API information
 *     description: Returns basic information about the AV Scan API
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: AV Scan API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 description:
 *                   type: string
 *                   example: A Node.js Express server that provides antivirus scanning capabilities
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     scan:
 *                       type: string
 *                       example: POST /scan - Scan uploaded file for viruses
 *                     docs:
 *                       type: string
 *                       example: GET /api-docs - API documentation
 *                 scanner:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: ClamAV
 *                     version:
 *                       type: string
 *                       example: 0.104.2
 */
router.get('/', (req, res) => {
  res.json({
    name: 'AV Scan API',
    version: '1.0.0',
    description: 'A Node.js Express server that provides antivirus scanning capabilities using ClamAV',
    endpoints: {
      scan: 'POST /scan - Scan uploaded file for viruses',
      docs: 'GET /api-docs - API documentation'
    },
    scanner: {
      name: 'ClamAV',
      type: 'Open Source Antivirus Engine'
    }
  });
});

module.exports = router;

/**
 * Routes for AV Scan API
 *
 * Contains all route handlers and Swagger documentation for the API endpoints.
 */

const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * Get the appropriate ClamAV scanner path based on the operating system
 */
function getScannerPath() {
  const platform = process.platform;

  if (platform === 'win32') {
    // Windows - common ClamAV installation paths
    const windowsPaths = [
      '"C:\\Program Files\\ClamAV\\clamscan.exe"',
      '"C:\\Program Files (x86)\\ClamAV\\clamscan.exe"',
      'clamscan.exe'
    ];
    return windowsPaths[0]; // Default to first path
  } else {
    // macOS and Linux - ClamAV is typically in PATH
    return 'clamscan';
  }
}

/**
 * POST /scan - Scan uploaded file for viruses
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
 *     summary: Scan uploaded file for viruses
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
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      error: 'No file provided',
      details: 'Please upload a file to scan'
    });
  }

  const filePath = req.file.path;
  const scannerPath = getScannerPath();

  // ClamAV command with options:
  // --no-summary: Don't print summary
  // --infected: Only print infected files
  // --suppress-ok-results: Don't print OK results
  const command = `${scannerPath} --no-summary --infected --suppress-ok-results "${filePath}"`;

  exec(command, (error, stdout, stderr) => {
    // Clean up the uploaded file afterward
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup uploaded file:', cleanupError.message);
    }

    if (error) {
      // ClamAV returns exit code 1 when viruses are found, 2 for errors
      if (error.code === 1) {
        // Virus found - this is not an error for ClamAV
        const isClean = false;
        res.json({
          clean: isClean,
          rawOutput: stdout || 'Virus detected by ClamAV'
        });
      } else {
        // Actual error (exit code 2 or other)
        return res.status(500).json({
          error: 'Scan failed',
          details: stderr || error.message
        });
      }
    } else {
      // No error and no output means file is clean
      const isClean = true;
      res.json({
        clean: isClean,
        rawOutput: stdout || 'File is clean - no threats detected'
      });
    }
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

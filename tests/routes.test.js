/**
 * Unit tests for routes.js
 *
 * Tests all route handlers and their various scenarios.
 */

const request = require('supertest');
const express = require('express');
const { mockExec, mockUnlinkSync } = require('./setup');

// Import routes
const routes = require('../routes');

// Create test app
const app = express();
app.use('/', routes);

describe('Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({
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

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('POST /scan', () => {
    it('should return 400 when no file is provided', async () => {
      const response = await request(app)
        .post('/scan')
        .expect(400);

      expect(response.body).toEqual({
        error: 'No file provided',
        details: 'Please upload a file to scan'
      });
    });

    it('should return 500 when scanner execution fails', async () => {
      // Mock exec to simulate failure (exit code 2 for ClamAV errors)
      mockExec.mockImplementation((command, callback) => {
        const error = new Error('Scanner not found');
        error.code = 2;
        callback(error, null, 'Scanner error');
      });

      const response = await request(app)
        .post('/scan')
        .attach('file', Buffer.from('test file content'), 'test.txt')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Scan failed',
        details: 'Scanner error'
      });

      // Verify file cleanup was called
      expect(mockUnlinkSync).toHaveBeenCalled();
    });

    it('should return clean result when no viruses are found', async () => {
      // Mock exec to simulate clean scan (no error, no output)
      mockExec.mockImplementation((command, callback) => {
        callback(null, '', null);
      });

      const response = await request(app)
        .post('/scan')
        .attach('file', Buffer.from('clean file content'), 'clean.txt')
        .expect(200);

      expect(response.body).toEqual({
        clean: true,
        rawOutput: 'File is clean - no threats detected'
      });

      // Verify file cleanup was called
      expect(mockUnlinkSync).toHaveBeenCalled();
    });

    it('should return infected result when viruses are found', async () => {
      // Mock exec to simulate infected scan (exit code 1 for ClamAV)
      mockExec.mockImplementation((command, callback) => {
        const error = new Error('Virus found');
        error.code = 1;
        callback(error, 'test.txt: Eicar-Test-Signature FOUND', null);
      });

      const response = await request(app)
        .post('/scan')
        .attach('file', Buffer.from('infected file content'), 'infected.txt')
        .expect(200);

      expect(response.body).toEqual({
        clean: false,
        rawOutput: 'test.txt: Eicar-Test-Signature FOUND'
      });

      // Verify file cleanup was called
      expect(mockUnlinkSync).toHaveBeenCalled();
    });

    it('should call scanner with correct ClamAV command format', async () => {
      // Mock exec to simulate successful scan
      mockExec.mockImplementation((command, callback) => {
        callback(null, '', null);
      });

      await request(app)
        .post('/scan')
        .attach('file', Buffer.from('test content'), 'test.txt')
        .expect(200);

      // Verify exec was called with ClamAV command format
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringMatching(/clamscan.*--no-summary.*--infected.*--suppress-ok-results/),
        expect.any(Function)
      );

      // Verify command contains expected ClamAV parameters
      const command = mockExec.mock.calls[0][0];
      expect(command).toContain('--no-summary');
      expect(command).toContain('--infected');
      expect(command).toContain('--suppress-ok-results');
    });

    it('should handle different file types', async () => {
      // Mock exec to simulate successful scan
      mockExec.mockImplementation((command, callback) => {
        callback(null, '', null);
      });

      const fileTypes = ['test.txt', 'document.pdf', 'image.jpg', 'script.js'];

      for (const fileType of fileTypes) {
        await request(app)
          .post('/scan')
          .attach('file', Buffer.from('test content'), fileType)
          .expect(200);

        expect(mockExec).toHaveBeenCalled();
        expect(mockUnlinkSync).toHaveBeenCalled();

        // Clear mocks for next iteration
        jest.clearAllMocks();
      }
    });

    it('should handle large files', async () => {
      // Mock exec to simulate successful scan
      mockExec.mockImplementation((command, callback) => {
        callback(null, '', null);
      });

      // Create a large buffer (1MB)
      const largeBuffer = Buffer.alloc(1024 * 1024, 'A');

      const response = await request(app)
        .post('/scan')
        .attach('file', largeBuffer, 'large-file.txt')
        .expect(200);

      expect(response.body.clean).toBe(true);
      expect(mockUnlinkSync).toHaveBeenCalled();
    });

    it('should handle scanner timeout gracefully', async () => {
      // Mock exec to simulate timeout
      mockExec.mockImplementation((command, callback) => {
        setTimeout(() => {
          const error = new Error('ETIMEDOUT');
          error.code = 2;
          callback(error, null, 'Scan timeout');
        }, 100);
      });

      const response = await request(app)
        .post('/scan')
        .attach('file', Buffer.from('test content'), 'test.txt')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Scan failed',
        details: 'Scan timeout'
      });
    });

    it('should handle ClamAV virus detection with specific signatures', async () => {
      // Mock exec to simulate virus detection with specific signature
      mockExec.mockImplementation((command, callback) => {
        const error = new Error('Virus found');
        error.code = 1;
        callback(error, 'test.exe: Win.Trojan.Generic-12345 FOUND', null);
      });

      const response = await request(app)
        .post('/scan')
        .attach('file', Buffer.from('malicious content'), 'test.exe')
        .expect(200);

      expect(response.body).toEqual({
        clean: false,
        rawOutput: 'test.exe: Win.Trojan.Generic-12345 FOUND'
      });
    });
  });

  describe('Error handling', () => {
    it('should handle file system errors during cleanup', async () => {
      // Mock exec to simulate successful scan
      mockExec.mockImplementation((command, callback) => {
        callback(null, '', null);
      });

      // Mock unlinkSync to throw error
      mockUnlinkSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const response = await request(app)
        .post('/scan')
        .attach('file', Buffer.from('test content'), 'test.txt')
        .expect(200);

      // Should still return scan results even if cleanup fails
      expect(response.body.clean).toBe(true);
    });

    it('should handle ClamAV database errors', async () => {
      // Mock exec to simulate ClamAV database error
      mockExec.mockImplementation((command, callback) => {
        const error = new Error('Database error');
        error.code = 2;
        callback(error, null, 'ERROR: Can\'t access database directory');
      });

      const response = await request(app)
        .post('/scan')
        .attach('file', Buffer.from('test content'), 'test.txt')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Scan failed',
        details: 'ERROR: Can\'t access database directory'
      });
    });

    it('should handle ClamAV permission errors', async () => {
      // Mock exec to simulate permission error
      mockExec.mockImplementation((command, callback) => {
        const error = new Error('Permission denied');
        error.code = 2;
        callback(error, null, 'ERROR: Can\'t access file');
      });

      const response = await request(app)
        .post('/scan')
        .attach('file', Buffer.from('test content'), 'test.txt')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Scan failed',
        details: 'ERROR: Can\'t access file'
      });
    });
  });
});

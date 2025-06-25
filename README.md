# AV Scan API 🔒

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://github.com/nicholasadamou/avscan-api)
[![Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen.svg)](https://github.com/nicholasadamou/avscan-api)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-orange.svg)](https://swagger.io/)
[![ClamAV](https://img.shields.io/badge/ClamAV-0.104.2+-lightgreen.svg)](https://www.clamav.net/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

A robust Node.js Express API that provides antivirus scanning capabilities using ClamAV antivirus engine. This API allows you to upload files and scan them for viruses through a RESTful interface with comprehensive documentation.

## 🚀 Features

- **File Upload & Scanning** - Upload files and scan them for viruses using ClamAV
- **RESTful API** - Clean, intuitive REST endpoints
- **Interactive Documentation** - Swagger/OpenAPI 3.0 documentation
- **Comprehensive Testing** - Full test suite with 95%+ coverage
- **Error Handling** - Robust error handling and validation
- **File Cleanup** - Automatic cleanup of uploaded files after scanning
- **Cross-Platform** - Works on Windows, macOS, and Linux
- **Production Ready** - Includes logging, validation, and security measures
- **Open Source** - Uses ClamAV, a free and open-source antivirus engine
- **Docker Support** - Complete Docker and Docker Compose setup

## 🐳 Quick Start with Docker

### Prerequisites
- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)

### Production Deployment
```bash
# Clone the repository
git clone https://github.com/nicholasadamou/avscan-api.git
cd avscan-api

# Build and start the application
docker-compose up -d

# Access the API
curl http://localhost:3000/
```

### Development Setup
```bash
# Start development environment with hot reloading
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

📖 **For detailed Docker instructions, see [DOCKER.md](DOCKER.md)**

## 📋 Prerequisites

- **Node.js** (v14.0.0 or higher)
- **ClamAV** antivirus engine installed on your system
- **npm** or **yarn** package manager

### ClamAV Installation

The API requires ClamAV to be installed. Here's how to install it on different platforms:

#### macOS
```bash
# Using Homebrew
brew install clamav

# Update virus definitions
freshclam
```

#### Ubuntu/Debian
```bash
# Install ClamAV
sudo apt-get update
sudo apt-get install clamav clamav-daemon

# Update virus definitions
sudo freshclam
```

#### Windows
1. Download ClamAV from [https://www.clamav.net/downloads](https://www.clamav.net/downloads)
2. Install to `C:\Program Files\ClamAV\`
3. Update virus definitions using the GUI or command line

#### CentOS/RHEL
```bash
# Install ClamAV
sudo yum install clamav clamav-update

# Update virus definitions
sudo freshclam
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nicholasadamou/avscan-api.git
   cd avscan-api
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

4. **Start the server**
   ```bash
   pnpm start
   ```

The API will be available at `http://localhost:3000`

## 📖 API Documentation

### Interactive Documentation

Visit `http://localhost:3000/api-docs` for interactive Swagger documentation where you can:
- View all available endpoints
- Test the API directly from your browser
- See request/response schemas
- Understand the API structure

### API Endpoints

#### GET `/`
Returns basic information about the API.

**Response:**
```json
{
  "name": "AV Scan API",
  "version": "1.0.0",
  "description": "A Node.js Express server that provides antivirus scanning capabilities using ClamAV",
  "endpoints": {
    "scan": "POST /scan - Scan uploaded file for viruses",
    "docs": "GET /api-docs - API documentation"
  },
  "scanner": {
    "name": "ClamAV",
    "type": "Open Source Antivirus Engine"
  }
}
```

#### POST `/scan`
Upload and scan a file for viruses using ClamAV.

**Request:**
- Content-Type: `multipart/form-data`
- Body: File upload with field name `file`

**Response (Clean File):**
```json
{
  "clean": true,
  "rawOutput": "File is clean - no threats detected"
}
```

**Response (Infected File):**
```json
{
  "clean": false,
  "rawOutput": "test.exe: Win.Trojan.Generic-12345 FOUND"
}
```

**Error Response:**
```json
{
  "error": "Scan failed",
  "details": "ClamAV scanner not found or failed to execute"
}
```

## 💻 Usage Examples

### JavaScript/Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function scanFile(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const response = await fetch('http://localhost:3000/scan', {
    method: 'POST',
    body: form
  });

  const result = await response.json();

  if (result.clean) {
    console.log('✅ File is clean!');
  } else {
    console.log('❌ File is infected!');
    console.log('Threat detected:', result.rawOutput);
  }

  return result;
}

// Usage
scanFile('./suspicious-file.exe');
```

### cURL

```bash
# Scan a file
curl -X POST \
  -F "file=@/path/to/your/file.txt" \
  http://localhost:3000/scan

# Get API information
curl http://localhost:3000/
```

### Python

```python
import requests

def scan_file(file_path):
    with open(file_path, 'rb') as file:
        files = {'file': file}
        response = requests.post('http://localhost:3000/scan', files=files)

    result = response.json()

    if result['clean']:
        print("✅ File is clean!")
    else:
        print("❌ File is infected!")
        print(f"Threat: {result['rawOutput']}")

    return result

# Usage
scan_file('./suspicious-file.exe')
```

## 🧪 Testing

The project includes a comprehensive test suite with 95%+ coverage.

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode
pnpm run test:watch
```

### Test Coverage

The test suite covers:
- ✅ Route handlers and validation
- ✅ File upload and scanning with ClamAV
- ✅ Error handling and edge cases
- ✅ Server configuration
- ✅ Swagger documentation
- ✅ Integration workflows
- ✅ Performance and reliability
- ✅ ClamAV-specific scenarios

## 🏗️ Project Structure

```
avscan-api/
├── server.js              # Main server file
├── routes.js              # Route handlers with ClamAV integration
├── config/
│   └── swagger.js         # Swagger configuration
├── tests/                 # Test suite
│   ├── setup.js           # Test configuration
│   ├── routes.test.js     # Route tests
│   ├── server.test.js     # Server tests
│   ├── swagger.test.js    # Swagger tests
│   ├── integration.test.js # Integration tests
│   └── README.md          # Test documentation
├── uploads/               # Temporary file uploads
├── nginx/                 # Nginx configuration
│   └── nginx.conf         # Reverse proxy config
├── package.json           # Dependencies and scripts
├── Dockerfile             # Production Docker image
├── Dockerfile.dev         # Development Docker image
├── docker-compose.yml     # Production orchestration
├── docker-compose.dev.yml # Development orchestration
├── DOCKER.md              # Docker documentation
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

You can configure the API using environment variables:

```bash
# Port (default: 3000)
PORT=3000

# ClamAV scanner path (auto-detected by default)
CLAMAV_PATH=/usr/local/bin/clamscan

# Upload directory (default: ./uploads)
UPLOAD_DIR=./uploads
```

### Custom ClamAV Path

The API automatically detects ClamAV installation paths, but you can customize it:

```javascript
// In routes.js, modify the getScannerPath() function
function getScannerPath() {
  // Custom path for your ClamAV installation
  return '/custom/path/to/clamscan';
}
```

### ClamAV Configuration

The API uses the following ClamAV options:
- `--no-summary`: Don't print summary
- `--infected`: Only print infected files
- `--suppress-ok-results`: Don't print OK results

You can modify these options in `routes.js` if needed.

## 🚀 Deployment

### Production Deployment

1. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```

2. **Install dependencies**
   ```bash
   pnpm install --production
   ```

3. **Start the server**
   ```bash
   pnpm start
   ```

### Docker Deployment

```bash
# Production deployment
docker-compose up -d

# Development deployment
docker-compose -f docker-compose.dev.yml up -d

# With Nginx reverse proxy
docker-compose --profile production up -d
```

### PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start server.js --name "avscan-api"

# Monitor the application
pm2 monit
```

## 🔒 Security Considerations

- **File Upload Limits**: Configure appropriate file size limits
- **File Type Validation**: Consider adding file type validation
- **Rate Limiting**: Implement rate limiting for production use
- **Authentication**: Add authentication for production deployments
- **HTTPS**: Use HTTPS in production environments
- **Input Validation**: Validate all inputs and sanitize file names
- **ClamAV Updates**: Keep ClamAV virus definitions updated regularly

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new functionality**
5. **Run the test suite**
   ```bash
   pnpm test
   ```
6. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
7. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Development Setup

```bash
# Install development dependencies
pnpm install

# Start development server with auto-reload
pnpm run dev

# Run tests in watch mode
pnpm run test:watch
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

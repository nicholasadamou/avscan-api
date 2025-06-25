# Docker Setup for AV Scan API

This document provides comprehensive instructions for running the AV Scan API using Docker and Docker Compose.

## 🐳 Quick Start

### Prerequisites

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)

### Production Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/nicholasadamou/avscan-api.git
   cd avscan-api
   ```

2. **Build and start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the API**
   - API: http://localhost:3000
   - Documentation: http://localhost:3000/api-docs

### Development Setup

1. **Start development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **View logs**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f avscan-api-dev
   ```

## 📁 Docker Files Overview

### Core Files

- **`Dockerfile`** - Production Docker image
- **`Dockerfile.dev`** - Development Docker image with hot reloading
- **`docker-compose.yml`** - Production orchestration
- **`docker-compose.dev.yml`** - Development orchestration
- **`.dockerignore`** - Files excluded from Docker build

### Configuration Files

- **`nginx/nginx.conf`** - Nginx reverse proxy configuration
- **`nginx/ssl/`** - SSL certificates (for production)

## 🚀 Production Deployment

### Basic Production Setup

```bash
# Build and start services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f avscan-api
```

### Production with Nginx

```bash
# Start with Nginx reverse proxy
docker-compose --profile production up -d

# Access through Nginx
curl http://localhost:80
```

### Environment Variables

Create a `.env` file for production:

```bash
# API Configuration
NODE_ENV=production
PORT=3000
CLAMAV_PATH=/usr/bin/clamscan

# Security
JWT_SECRET=your-secret-key
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Database (if using)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=avscan
DB_USER=postgres
DB_PASSWORD=password
```

### SSL/HTTPS Setup

1. **Generate SSL certificates**
   ```bash
   mkdir -p nginx/ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/ssl/key.pem \
     -out nginx/ssl/cert.pem
   ```

2. **Uncomment HTTPS section in `nginx/nginx.conf`**

3. **Start with SSL**
   ```bash
   docker-compose --profile production up -d
   ```

## 🔧 Development Setup

### Development Environment

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Development Features

- **Hot Reloading** - Code changes automatically restart the server
- **Debug Port** - Node.js debugging on port 9229
- **Volume Mounting** - Source code mounted for live editing
- **Development Dependencies** - All dev tools included

### Debugging

1. **Attach debugger**
   ```bash
   # In VS Code, add to launch.json:
   {
     "name": "Docker: Attach to Node",
     "type": "node",
     "request": "attach",
     "port": 9229,
     "address": "localhost",
     "localRoot": "${workspaceFolder}",
     "remoteRoot": "/app"
   }
   ```

2. **Run tests in container**
   ```bash
   docker-compose -f docker-compose.dev.yml exec avscan-api-dev npm test
   ```

## 🏗️ Docker Architecture

### Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   Nginx         │    │   AV Scan API   │
│                 │───▶│   (Reverse      │───▶│   (Node.js +    │
│                 │    │    Proxy)       │    │    ClamAV)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Volumes       │
                       │   - ClamAV DB   │
                       │   - Uploads     │
                       │   - Logs        │
                       └─────────────────┘
```

### Development Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   AV Scan API   │
│                 │───▶│   (Dev Mode)    │
│                 │    │   - Hot Reload  │
└─────────────────┘    │   - Debug Port  │
                       └─────────────────┘
```

## 📊 Monitoring and Logs

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs avscan-api

# Follow logs
docker-compose logs -f avscan-api

# Last 100 lines
docker-compose logs --tail=100 avscan-api
```

### Health Checks

```bash
# Check container health
docker-compose ps

# Manual health check
curl http://localhost:3000/
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## 🔒 Security Considerations

### Container Security

- **Non-root user** - Application runs as `appuser`
- **Read-only filesystem** - Where possible
- **Security headers** - Configured in Nginx
- **Rate limiting** - Applied to API endpoints

### Network Security

- **Internal networks** - Services communicate internally
- **Port exposure** - Only necessary ports exposed
- **SSL/TLS** - HTTPS support for production

### File Security

- **Upload limits** - Configured in Nginx
- **File cleanup** - Automatic cleanup after scanning
- **Virus scanning** - All uploaded files scanned

## 🛠️ Maintenance

### Updating ClamAV Definitions

```bash
# Update virus definitions
docker-compose exec avscan-api freshclam

# Or restart container to trigger update
docker-compose restart avscan-api
```

### Backup and Restore

```bash
# Backup ClamAV database
docker run --rm -v avscan-api_clamav_data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/clamav-backup.tar.gz -C /data .

# Restore ClamAV database
docker run --rm -v avscan-api_clamav_data:/data -v $(pwd):/backup \
  ubuntu tar xzf /backup/clamav-backup.tar.gz -C /data
```

### Cleanup

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a
```

## 🚨 Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check logs
docker-compose logs avscan-api

# Check if port is in use
netstat -tulpn | grep :3000

# Rebuild image
docker-compose build --no-cache avscan-api
```

#### ClamAV Issues

```bash
# Check ClamAV status
docker-compose exec avscan-api clamscan --version

# Update virus definitions
docker-compose exec avscan-api freshclam

# Check ClamAV logs
docker-compose exec avscan-api tail -f /var/log/clamav/freshclam.log
```

#### Performance Issues

```bash
# Check resource usage
docker stats

# Increase memory limit in docker-compose.yml
services:
  avscan-api:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Debug Commands

```bash
# Enter container shell
docker-compose exec avscan-api bash

# Check file permissions
docker-compose exec avscan-api ls -la /app

# Test ClamAV manually
docker-compose exec avscan-api clamscan /app/test-file.txt

# Check Node.js process
docker-compose exec avscan-api ps aux
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale API service
docker-compose up -d --scale avscan-api=3

# Load balancer configuration needed in nginx.conf
upstream avscan_api {
    server avscan-api:3000;
    server avscan-api:3000;
    server avscan-api:3000;
}
```

### Resource Limits

```yaml
# In docker-compose.yml
services:
  avscan-api:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Build Docker image
      run: docker build -t avscan-api .

    - name: Run tests
      run: docker run --rm avscan-api npm test

    - name: Push to registry
      run: |
        docker tag avscan-api your-registry/avscan-api:latest
        docker push your-registry/avscan-api:latest
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [ClamAV Documentation](https://docs.clamav.net/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

For more information, see the main [README.md](README.md) file.

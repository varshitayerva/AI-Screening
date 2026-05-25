# Complete Setup & Installation Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Operating System:** Windows, macOS, or Linux
- **RAM:** 8GB minimum (4GB backend, 4GB frontend dev)
- **Disk Space:** 5GB (includes node_modules, Maven cache)

### Required Software

#### 1. Java 21+
```bash
# Verify installation
java -version
# Should show: openjdk version "21.x.x"

# Download from: https://www.oracle.com/java/technologies/downloads/
```

#### 2. Node.js 18+
```bash
# Verify installation
node --version
npm --version
# Should show: v18.x.x and 9.x.x

# Download from: https://nodejs.org/
```

#### 3. Git
```bash
# Verify installation
git --version
# Should show: git version 2.x.x

# Download from: https://git-scm.com/
```

#### 4. Maven 3.9+ (for backend)
```bash
# Verify installation
mvn --version
# Should show: Apache Maven 3.9.x

# Usually installed with Java, or download from: https://maven.apache.org/
```

#### 5. HuggingFace API Key
1. Create account at https://huggingface.co
2. Go to Settings → Access Tokens
3. Create new token (read-only is sufficient)
4. Copy token (starts with `hf_`)

**Test your key:**
```bash
curl -H "Authorization: Bearer hf_YOUR_KEY_HERE" \
  https://api-inference.huggingface.co/status
# Should return 200 OK
```

---

## Initial Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/ai-resume-screener.git
cd ai-resume-screener

# Verify directory structure
ls -la
# Should show: backend/, frontend/, docs/, .env.example, README.md
```

### Step 2: Create Environment File
```bash
# Copy example
cp .env.example .env

# Edit with your values
# On Windows: notepad .env
# On macOS/Linux: nano .env
```

### Step 3: Configure Environment Variables
Edit `.env`:
```env
# REQUIRED: Your HuggingFace API Key
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# API URLs (use defaults for local development)
HF_API_BASE_URL=https://api-inference.huggingface.co/models

# Ports
BACKEND_PORT=8080
FRONTEND_PORT=4200

# Session timeout
SESSION_TIMEOUT_HOURS=24

# Logging
LOG_LEVEL=INFO
```

### Step 4: Verify Installation
```bash
# Check Java
java -version

# Check Node
node --version
npm --version

# Check Maven
mvn --version

# Check Git
git --version
```

---

## Backend Setup

### Step 1: Install Maven Dependencies
```bash
cd backend

# Download all dependencies (first run takes 2-3 minutes)
mvn clean install -DskipTests

# This creates: target/, .m2/ directories
```

### Step 2: Build Backend
```bash
# Compile code
mvn clean package -DskipTests

# You should see: "BUILD SUCCESS"
# Creates: target/resume-ai-1.0.0.jar
```

### Step 3: Verify Backend Build
```bash
# Check if build succeeded
ls -la target/*.jar

# Should show: resume-ai-1.0.0.jar (or similar)
```

### Backend Directory Structure
```
backend/
├── pom.xml                    # Maven configuration
├── src/
│   ├── main/
│   │   ├── java/com/resume_ai/
│   │   │   ├── Application.java           # Main entry point
│   │   │   ├── config/                    # Spring configs
│   │   │   ├── controller/                # REST controllers
│   │   │   ├── service/                   # Business logic
│   │   │   ├── model/                     # Domain models
│   │   │   ├── util/                      # Utilities
│   │   │   └── exception/                 # Exception handlers
│   │   └── resources/
│   │       ├── application.yml            # App config
│   │       ├── prompts/                   # LLM prompts
│   │       └── logback.xml                # Logging config
│   └── test/
│       └── java/com/resume_ai/            # Unit tests
├── target/                    # Build output
└── README.md                  # Backend README
```

---

## Frontend Setup

### Step 1: Install npm Dependencies
```bash
cd frontend

# Install packages (first run takes 1-2 minutes)
npm install

# You should see: "added X packages"
# Creates: node_modules/ directory
```

### Step 2: Verify Frontend Installation
```bash
# Check Angular CLI is available
npx ng version

# Should show: Angular CLI version and project details
```

### Frontend Directory Structure
```
frontend/
├── package.json               # npm dependencies
├── angular.json               # Angular config
├── tsconfig.json              # TypeScript config
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/      # API, AI services
│   │   │   ├── guards/        # Route guards
│   │   │   └── interceptors/  # HTTP interceptors
│   │   ├── features/          # Feature modules
│   │   │   ├── upload/
│   │   │   ├── analysis/
│   │   │   ├── interview/
│   │   │   ├── feedback/
│   │   │   └── report/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── models/
│   │   │   └── pipes/
│   │   └── app.component.ts   # Root component
│   ├── assets/                # Images, icons
│   ├── styles/                # Global styles
│   └── main.ts                # Bootstrap
├── e2e/                       # E2E tests
└── README.md                  # Frontend README
```

---

## Configuration

### Backend Configuration (`backend/src/main/resources/application.yml`)

Default configuration is provided. Only override if needed:

```yaml
spring:
  application:
    name: resume-ai
    version: 1.0.0
  
  servlet:
    multipart:
      max-file-size: ${MAX_FILE_SIZE_MB:5}MB
      max-request-size: ${MAX_FILE_SIZE_MB:5}MB
  
  jpa:
    hibernate:
      ddl-auto: none  # No database

server:
  port: ${BACKEND_PORT:8080}
  servlet:
    context-path: /
  compression:
    enabled: true
    min-response-size: 1024

logging:
  level:
    root: ${LOG_LEVEL:INFO}
    com.resume_ai: DEBUG
  file:
    name: ${LOG_FILE:logs/app.log}

app:
  session:
    timeout-hours: ${SESSION_TIMEOUT_HOURS:24}
    cleanup-interval-hours: 1
  
  ai:
    provider: HUGGING_FACE
    api-key: ${HF_API_KEY}
    api-base-url: ${HF_API_BASE_URL}
    call-timeout-seconds: 30
    retry-max-attempts: 3
    retry-delay-ms: 1000
    temperature: 0.3
    max-tokens-extraction: 1500
    max-tokens-interview: 2000
    max-tokens-summary: 1500
  
  security:
    cors:
      allowed-origins: "http://localhost:4200,http://localhost:3000"
      max-age: 3600
    rate-limit:
      requests-per-minute: 100
      requests-per-hour: 1000
```

### Frontend Configuration (`frontend/src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  
  session: {
    timeoutMinutes: 1440, // 24 hours
  },
  
  upload: {
    maxFileSizeMB: 5,
    allowedFileTypes: ['pdf', 'txt', 'doc', 'docx'],
  },
  
  validation: {
    minResumeChars: 100,
    minJobDescChars: 50,
    maxJobDescChars: 2000,
  },
  
  ai: {
    matchScoreThreshold: 70, // For interview vs feedback logic
    requestTimeoutMs: 30000,
  },
  
  features: {
    enablePdfExport: true,
    enableEmailShare: false, // Set to true if email service configured
    enableBatchProcessing: false,
  },
};
```

---

## Running the Application

### Option 1: Development Mode (Recommended)

**Terminal 1: Start Backend**
```bash
cd backend

# Load environment variables
# On Windows: set variables from .env manually
# On macOS/Linux:
export $(cat ../.env | xargs)

# Start Spring Boot
mvn spring-boot:run

# You should see:
# ========== APPLICATION STARTED ==========
# Tomcat started on port(s): 8080 (http)
# Application 'resume-ai' is running!

# Backend is ready at: http://localhost:8080
# Test health: curl http://localhost:8080/api/v1/health
```

**Terminal 2: Start Frontend**
```bash
cd frontend

# Start Angular dev server
ng serve

# You should see:
# ✔ Compiled successfully
# Application bundle generation complete
# Local: http://localhost:4200/

# Frontend is ready at: http://localhost:4200
```

**Access Application:**
Open browser: http://localhost:4200

### Option 2: Production Mode

**Build Backend**
```bash
cd backend
mvn clean package

# Run JAR
java -jar target/resume-ai-1.0.0.jar
```

**Build & Deploy Frontend**
```bash
cd frontend
ng build --configuration production

# Deploy dist/resume-screener/ folder to web server
```

---

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=ResumeParserServiceTest

# Run with coverage
mvn clean test jacoco:report
open target/site/jacoco/index.html

# Coverage target: ≥80%
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
ng test

# Run tests once (CI mode)
ng test --watch=false

# Run E2E tests
ng e2e

# Coverage report
ng test --code-coverage
# Coverage target: ≥70%
```

### Integration Testing

```bash
# Test complete workflow
1. Upload resume (POST /api/v1/resume/upload)
2. Analyze resume (POST /api/v1/analysis/screen)
3. Generate interview questions (POST /api/v1/interview/generate)
4. Generate report (POST /api/v1/report/generate)
5. Download report (GET /api/v1/report/{id}/download)
```

### Load Testing (Optional)

```bash
# Using Apache JMeter or similar
# Test: 100 concurrent requests to /api/v1/health
# Expected: <100ms response time, 0 errors
```

---

## Deployment

### Docker Deployment

**Create Dockerfile (Backend)**
```dockerfile
FROM maven:3.9-eclipse-temurin-21 as builder
WORKDIR /app
COPY backend .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
CMD ["java", "-jar", "app.jar"]
```

**Create Dockerfile (Frontend)**
```dockerfile
FROM node:18 as builder
WORKDIR /app
COPY frontend .
RUN npm install
RUN ng build --configuration production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Run with Docker Compose**
```bash
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Cloud Deployment

#### AWS EC2
```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# 2. Install Java 21, Node.js 18
# 3. Clone repository
# 4. Setup environment variables
# 5. Run application (or containerize)
```

#### Heroku
```bash
# Create Procfile
web: java -jar backend/target/*.jar

# Deploy
git push heroku main
```

#### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: resume-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: resume-ai
  template:
    metadata:
      labels:
        app: resume-ai
    spec:
      containers:
      - name: backend
        image: resume-ai:latest
        ports:
        - containerPort: 8080
        env:
        - name: HF_API_KEY
          valueFrom:
            secretKeyRef:
              name: hf-credentials
              key: api-key
```

---

## Troubleshooting

### Backend Issues

#### Port 8080 already in use
```bash
# Find process
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
mvn spring-boot:run -Dserver.port=9090
```

#### Maven build fails
```bash
# Clear cache
mvn clean
rm -rf ~/.m2/repository/com/resume_ai

# Try again
mvn clean install
```

#### HuggingFace API errors
```bash
# Verify API key
echo $HF_API_KEY

# Test connection
curl -H "Authorization: Bearer $HF_API_KEY" \
  https://api-inference.huggingface.co/status

# Check logs
tail -f logs/app.log | grep "HuggingFace\|ERROR"
```

#### Out of Memory error
```bash
# Increase heap size
export JAVA_OPTS="-Xmx2g -Xms1g"
mvn spring-boot:run
```

### Frontend Issues

#### Port 4200 in use
```bash
ng serve --port 4300
```

#### npm install fails
```bash
# Clear cache
npm cache clean --force

# Delete lock file
rm package-lock.json

# Reinstall
npm install
```

#### Module not found
```bash
# Delete node_modules
rm -rf node_modules

# Reinstall
npm install

# Clear Angular cache
ng cache clean
```

#### API not responding
```typescript
// Check environment.ts
console.log('API URL:', environment.apiUrl);

// Verify backend is running
curl http://localhost:8080/api/v1/health
```

### Database/Session Issues

#### Sessions not persisting
- Check `SESSION_TIMEOUT_HOURS` in `.env`
- Verify in-memory map is being used (not database)
- Check `SessionManager` service logs

#### File upload issues
```bash
# Check temp directory permissions
ls -la temp-uploads/

# Clear temp files
rm -rf temp-uploads/*

# Verify `MAX_FILE_SIZE_MB` in .env (must be ≥5)
```

### Performance Issues

#### Slow API responses
```bash
# Check HuggingFace API status
curl https://status.huggingface.co

# Monitor logs
tail -f logs/app.log | grep "processing_time"

# Check system resources
top  # Monitor CPU/Memory
```

#### High memory usage
```bash
# Check session count
curl http://localhost:8080/api/v1/health | grep session_count

# Reduce SESSION_TIMEOUT_HOURS in .env
# Or implement manual session cleanup
```

---

## Verification Checklist

- [ ] Java 21+ installed
- [ ] Node.js 18+ installed
- [ ] Maven 3.9+ installed
- [ ] HuggingFace API key obtained
- [ ] `.env` file created and configured
- [ ] Backend dependencies installed (`mvn clean install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend starts successfully (`mvn spring-boot:run`)
- [ ] Frontend starts successfully (`ng serve`)
- [ ] Can access http://localhost:4200
- [ ] Can access http://localhost:8080/api/v1/health
- [ ] Tests pass (backend & frontend)
- [ ] Can upload resume successfully
- [ ] Can analyze resume and see results
- [ ] API calls to HuggingFace are working

---

## Next Steps

1. **Read Documentation**
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design
   - [API_SPECIFICATION.md](API_SPECIFICATION.md) - Endpoint details

2. **Test the Workflow**
   - Upload sample resume
   - Trigger analysis
   - Generate interview questions or feedback
   - Generate report

3. **Customize**
   - Modify prompt templates in `backend/src/main/resources/prompts/`
   - Adjust validation rules
   - Customize UI components

4. **Deploy**
   - Follow deployment instructions for your target environment
   - Configure security (SSL/TLS, API keys)
   - Setup monitoring and logging

---

**Need Help?**
- Check troubleshooting section above
- Review API specification for endpoint details
- Check application logs: `logs/app.log`
- Verify HuggingFace API connectivity

---

**Last Updated:** 2026-05-25  
**Version:** 1.0

# Build and Run Guide

Complete guide to build, run, and push this project to GitHub.

---

## Prerequisites

- **Java 21+** - Download from [oracle.com](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.9+** - Download from [maven.apache.org](https://maven.apache.org/download.cgi)
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **Git** - Download from [git-scm.com](https://git-scm.com/)
- **HuggingFace API Key** - Get from [huggingface.co](https://huggingface.co/settings/tokens)

Verify installations:
```bash
java -version
mvn -version
node -version
npm -version
git --version
```

---

## Setup Environment

1. **Create `.env` file**
```bash
cp .env.example .env
```

2. **Edit `.env` with your HuggingFace API key**
```bash
# .env
HUGGINGFACE_API_KEY=your_hf_token_here
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

3. **Verify API key works**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2 \
  -d '{"inputs": "What is AI?"}'
```

---

## Build Backend

```bash
cd backend

# Install dependencies
mvn clean install

# Run tests
mvn test

# Build JAR (optional)
mvn package

# Start the server
mvn spring-boot:run

# Expected output:
# Started ResumeScreenerApplication in X seconds
# Listening on http://localhost:8080
```

**Troubleshooting:**
- `mvn: command not found` → Add Maven to PATH
- `Java not found` → Verify Java 21+ installation
- `Connection refused` → Ensure port 8080 is free

---

## Build Frontend

In another terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
ng serve

# Expected output:
# ✔ Compiled successfully.
# Application bundle generation complete.
# Serving at http://localhost:4200

# Navigate to http://localhost:4200
```

**Troubleshooting:**
- `ng: command not found` → Run `npm install -g @angular/cli`
- `npm ERR!` → Delete `node_modules` and run `npm install` again
- Port 4200 in use → `ng serve --port 4300`

---

## Verify the Application

1. **Check Backend Health**
```bash
curl http://localhost:8080/api/v1/health

# Expected response:
{
  "status": "UP",
  "timestamp": "2026-05-25T...",
  "activeSessions": 0,
  "message": "Resume Screener API is running"
}
```

2. **Access Frontend**
- Open browser → http://localhost:4200
- Should see the upload form

3. **Test Full Workflow**
- Upload a resume PDF/TXT
- Enter a job description
- Click "Analyze Resume"
- Wait for results (~35 seconds)
- See analysis, interview questions, or feedback

---

## Project Structure Overview

```
ai-resume-screener/
├── backend/                           # Spring Boot API
│   ├── pom.xml                        # Maven dependencies
│   ├── src/main/java/com/resumescreener/
│   │   ├── ResumeScreenerApplication.java
│   │   ├── controller/                # REST endpoints
│   │   ├── service/                   # Business logic (AI orchestration)
│   │   ├── model/                     # Data models
│   │   ├── dto/                       # Request/response DTOs
│   │   ├── config/                    # Spring configuration
│   │   └── exception/                 # Exception handling
│   └── src/main/resources/
│       ├── application.yml
│       └── logback-spring.xml
│
├── frontend/                          # Angular SPA
│   ├── package.json                   # npm dependencies
│   ├── angular.json                   # Angular config
│   ├── src/
│   │   ├── main.ts
│   │   ├── index.html
│   │   ├── styles.scss
│   │   └── app/
│   │       ├── app.component.ts
│   │       ├── app.routes.ts
│   │       ├── services/              # API service
│   │       └── components/            # UI components
│   │           ├── upload/
│   │           ├── analysis-result/
│   │           ├── interview-questions/
│   │           ├── feedback/
│   │           └── report/
│   └── tsconfig.json
│
├── docs/                              # Documentation
│   ├── ARCHITECTURE.md
│   ├── API_SPECIFICATION.md
│   └── SETUP_GUIDE.md
│
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore patterns
├── README.md                          # Project overview
└── IMPLEMENTATION_GUIDE.md            # Development guide
```

---

## Git Workflow: Pushing to GitHub

### Step 1: Initialize Git Repository

```bash
cd ~/Desktop/FDE/project-3

# Check if git is initialized
git status

# If not initialized:
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 2: Stage and Commit Changes

```bash
# Check status
git status

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Complete AI Resume Screener application

- Backend: Spring Boot REST API with 3 orchestrated LLM calls
- Frontend: Angular SPA with upload, analysis, and report pages
- Features: Resume extraction, conditional interview/feedback, recruiter summary
- Documentation: Setup guide, architecture docs, API specs"

# Verify commit
git log --oneline
```

### Step 3: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `ai-resume-screener`
3. **Description:** "AI-powered resume screening system with 3 orchestrated LLM calls"
4. **Visibility:** Public (for portfolio)
5. **Do NOT initialize** with README/gitignore (we have them)
6. Click **Create repository**

### Step 4: Add Remote and Push

```bash
# Add remote (replace YOURUSERNAME)
git remote add origin https://github.com/YOURUSERNAME/ai-resume-screener.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main

# Verify it worked
git log --oneline --graph
```

### Step 5: Create Releases (Milestones)

```bash
# Tag v1.0.0 - Initial Release
git tag -a v1.0.0 -m "Release 1.0.0: Complete MVP

Features:
- Resume upload and parsing
- Resume extraction with AI (LLM Call 1)
- Conditional interview questions (LLM Call 2A)
- Rejection guidance (LLM Call 2B)
- Recruiter summary (LLM Call 3)
- Full workflow integration
- Rest API with 6 endpoints
- Angular frontend with 5 pages

Tested: Complete end-to-end workflow"

# Push tag to GitHub
git push origin v1.0.0

# Create GitHub release
# Go to https://github.com/YOURUSERNAME/ai-resume-screener/releases
# Click "Draft a new release" → Select v1.0.0 → Publish
```

---

## Docker Deployment (Optional)

### Build Docker Images

```bash
# Backend Dockerfile
cat > backend/Dockerfile << 'EOF'
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY target/resume-screener-api-*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
EOF

# Frontend Dockerfile
cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/resume-screener-frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Build images
cd backend && mvn package -DskipTests && docker build -t ai-resume-screener-backend .
cd ../frontend && docker build -t ai-resume-screener-frontend .

# Run with docker-compose
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  backend:
    image: ai-resume-screener-backend
    ports:
      - "8080:8080"
    environment:
      HUGGINGFACE_API_KEY: ${HUGGINGFACE_API_KEY}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: ai-resume-screener-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

EOF

# Run
docker-compose up
```

---

## Troubleshooting Common Issues

### Backend Issues

| Problem | Solution |
|---------|----------|
| `Port 8080 already in use` | `lsof -i :8080` then `kill -9 <PID>` |
| `HuggingFace API timeout` | Verify internet, check API key is valid |
| `Maven not found` | Add Maven to PATH: `export PATH=$PATH:~/apache-maven/bin` |
| `Java version error` | Ensure Java 21+: `java -version` |

### Frontend Issues

| Problem | Solution |
|---------|----------|
| `Port 4200 already in use` | `ng serve --port 4300` |
| `npm ERR!` | Delete `node_modules` and run `npm install` again |
| `ng command not found` | `npm install -g @angular/cli@18` |
| `Cannot find module` | Run `npm install` |

### API Connectivity

| Problem | Solution |
|---------|----------|
| `CORS error` | Backend is running on 8080, check .env CORS settings |
| `Cannot reach backend` | Verify backend is running: `curl http://localhost:8080/api/v1/health` |
| `Empty responses` | Check HuggingFace API key is correct |

---

## Next Steps

1. **Monitor GitHub**
   - Check commits: `https://github.com/YOURUSERNAME/ai-resume-screener/commits`
   - Check releases: `https://github.com/YOURUSERNAME/ai-resume-screener/releases`

2. **Share Portfolio**
   - Add link to README
   - Share on LinkedIn
   - Add to portfolio website

3. **Improve Application**
   - Add more models
   - Implement PDF export
   - Add batch processing
   - Deploy to cloud (Heroku, AWS, etc.)

4. **Write Tests**
   - Backend unit tests (80%+ coverage)
   - Frontend component tests
   - E2E tests with Cypress

---

## Useful Commands

```bash
# Backend
mvn clean install        # Clean and rebuild
mvn spring-boot:run      # Run application
mvn test                 # Run tests
mvn package              # Create JAR

# Frontend
npm install              # Install dependencies
ng serve                 # Start dev server
npm run build            # Build for production
npm test                 # Run tests

# Git
git status               # Check status
git add .                # Stage all changes
git commit -m "message"  # Create commit
git push                 # Push to GitHub
git log --oneline        # View commits
git tag -a v1.0.0 -m "message"  # Create tag

# Docker
docker build -t name .   # Build image
docker run -p 8080:8080 name  # Run container
docker-compose up        # Run docker-compose
```

---

## References

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Angular Documentation](https://angular.io)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)

---

**You're ready to ship! 🚀**

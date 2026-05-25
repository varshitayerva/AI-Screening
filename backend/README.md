# AI Resume Screener - Backend

Spring Boot REST API for AI-powered resume screening and interview generation.

## Quick Start

```bash
# Install Java 21+
java -version

# Setup
cd backend
cp ../.env.example .env
export $(cat .env | xargs)

# Build
mvn clean install

# Run
mvn spring-boot:run
# API available at http://localhost:8080
```

## Project Structure

```
src/main/java/com/resume_ai/
├── config/              # Spring configuration
├── controller/          # REST API endpoints
├── service/             # Business logic & AI orchestration
├── model/
│   ├── dto/            # Request/Response DTOs
│   ├── entity/         # Domain models
│   └── enum/           # Enumerations
├── util/               # Utilities & validators
├── exception/          # Exception handling
└── Application.java    # Entry point
```

## Key Components

### Core Services

1. **AIOrchestrationService** - Orchestrates 3 LLM calls
2. **ResumeParserService** - Parses resume files
3. **HuggingFaceClient** - HF API integration
4. **ReportGeneratorService** - Report creation

### Controllers

1. **ResumeController** - Upload & preview
2. **AnalysisController** - Resume screening
3. **InterviewController** - Interview Q generation
4. **FeedbackController** - Rejection guidance
5. **ReportController** - Report generation
6. **HealthController** - Health checks

## Configuration

Edit `src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: resume-ai
  servlet:
    multipart:
      max-file-size: 5MB

server:
  port: ${BACKEND_PORT:8080}

app:
  session:
    timeout-hours: ${SESSION_TIMEOUT_HOURS:24}
  ai:
    provider: HUGGING_FACE
    api-key: ${HF_API_KEY}
```

## Testing

```bash
# Run all tests
mvn test

# Run with coverage
mvn clean test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

## Building for Production

```bash
# Create JAR
mvn clean package -DskipTests

# Run JAR
java -jar target/resume-ai-1.0.0.jar
```

## Environment Variables

See `../.env.example` - Core variables:
- `HF_API_KEY` - Hugging Face API token
- `BACKEND_PORT` - Server port (default: 8080)
- `SESSION_TIMEOUT_HOURS` - Session expiry (default: 24)
- `MAX_FILE_SIZE_MB` - Upload limit (default: 5)

## Dependencies

- Spring Boot 3.3.x
- Java 21
- Lombok
- JUnit 5
- Mockito
- Maven 3.9+

## API Endpoints

See `../docs/API_SPECIFICATION.md` for full endpoint documentation.

**Quick Reference:**
- `POST /api/v1/resume/upload` - Upload resume
- `POST /api/v1/analysis/screen` - Analyze resume (LLM Call 1)
- `POST /api/v1/interview/generate` - Interview questions (LLM Call 2A)
- `POST /api/v1/feedback/generate` - Feedback (LLM Call 2B)
- `POST /api/v1/report/generate` - Report (LLM Call 3)
- `GET /api/v1/health` - Health check

## Troubleshooting

### Port already in use
```bash
# Find and kill process on port 8080
lsof -i :8080
kill -9 <PID>
```

### API key not recognized
```bash
# Verify HF_API_KEY is set
echo $HF_API_KEY

# Test connection
curl -H "Authorization: Bearer $HF_API_KEY" \
  https://api-inference.huggingface.co/status
```

### Build failures
```bash
# Clear Maven cache
mvn clean
rm -rf ~/.m2/repository

# Rebuild
mvn clean install
```

## Deployment

See `../docs/SETUP_GUIDE.md` for production deployment instructions.

**Options:**
- Docker container
- Kubernetes deployment
- Cloud platforms (AWS, GCP, Azure)
- Traditional server

## Contributing

1. Follow Google Java Style Guide
2. Write tests for new features
3. Ensure 80%+ code coverage
4. Document complex logic

## License

MIT License - See LICENSE file

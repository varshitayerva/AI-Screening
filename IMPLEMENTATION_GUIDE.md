# Complete Implementation Guide - AI Resume Screener

## Quick Start (5 minutes)

```bash
# 1. Clone/navigate to project
cd ~/Desktop/FDE/project-3

# 2. Setup environment
cp .env.example .env
# Edit .env with your HuggingFace API key

# 3. Build & Run Backend
cd backend && mvn clean install && mvn spring-boot:run

# 4. In another terminal, run Frontend
cd frontend && npm install && ng serve

# 5. Open browser
# Frontend: http://localhost:4200
# Backend: http://localhost:8080
# Health: curl http://localhost:8080/api/v1/health
```

---

## Step-by-Step Implementation

### Phase 1: Backend Setup

#### 1.1 Create Spring Boot Project Structure

```
backend/
├── pom.xml                                    # Maven configuration
├── src/
│   ├── main/
│   │   ├── java/com/resumescreener/
│   │   │   ├── ResumeScreenerApplication.java # Main app class
│   │   │   ├── controller/                    # REST endpoints
│   │   │   ├── service/                       # Business logic
│   │   │   ├── model/                         # DTOs & entities
│   │   │   ├── util/                          # Utilities
│   │   │   ├── config/                        # Configuration
│   │   │   └── exception/                     # Custom exceptions
│   │   └── resources/
│   │       ├── application.yml                # Config file
│   │       ├── prompts/                       # AI prompts
│   │       └── logback-spring.xml             # Logging config
│   └── test/
│       └── java/com/resumescreener/          # Unit tests
└── README.md
```

#### 1.2 Create pom.xml with Dependencies

File: `backend/pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
  <modelVersion>4.0.0</modelVersion>
  
  <groupId>com.resumescreener</groupId>
  <artifactId>resume-screener-api</artifactId>
  <version>1.0.0</version>
  <name>AI Resume Screener API</name>
  
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.0</version>
  </parent>
  
  <properties>
    <java.version>21</java.version>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
  </properties>
  
  <dependencies>
    <!-- Spring Web -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>
    
    <!-- JSON Processing -->
    <dependency>
      <groupId>com.google.code.gson</groupId>
      <artifactId>gson</artifactId>
    </dependency>
    
    <!-- HTTP Client -->
    <dependency>
      <groupId>org.apache.httpcomponents.client5</groupId>
      <artifactId>httpclient5</artifactId>
    </dependency>
    
    <!-- Testing -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
    
    <!-- Mockito -->
    <dependency>
      <groupId>org.mockito</groupId>
      <artifactId>mockito-core</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>
  
  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```

---

### Phase 2: Core Backend Implementation

#### 2.1 Create Models and DTOs

Key files to create:

**ResumeExtractionResult.java** - Result from LLM Call 1
**InterviewQuestion.java** - Questions for high-score candidates
**RejectionGuidance.java** - Guidance for low-score candidates
**RecruiterSummary.java** - Final summary from LLM Call 3
**Session.java** - Session management

#### 2.2 Implement HuggingFace AI Client

This is the core of the system - orchestrates 3 LLM calls:

```java
@Service
@Slf4j
public class HuggingFaceClient {
    
    @Value("${huggingface.api.url}")
    private String apiUrl;
    
    @Value("${huggingface.api.key}")
    private String apiKey;
    
    private final RestTemplate restTemplate;
    
    public String callLLM(String prompt, String model) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> body = new HashMap<>();
        body.put("inputs", prompt);
        body.put("parameters", Map.of("max_new_tokens", 1000, "temperature", 0.3));
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        
        // Retry logic with exponential backoff
        return retryWithBackoff(() -> 
            restTemplate.postForObject(
                apiUrl + "/models/" + model,
                entity,
                String.class
            ),
            3
        );
    }
    
    private String retryWithBackoff(Supplier<String> task, int maxRetries) {
        for (int i = 0; i < maxRetries; i++) {
            try {
                return task.get();
            } catch (Exception e) {
                if (i == maxRetries - 1) throw e;
                Thread.sleep((long) Math.pow(2, i) * 1000);
            }
        }
        return null;
    }
}
```

#### 2.3 Implement AIOrchestrationService

This orchestrates all 3 LLM calls with conditional logic:

```java
@Service
@Slf4j
public class AIOrchestrationService {
    
    @Autowired
    private HuggingFaceClient hfClient;
    
    // LLM Call 1: Extract resume data
    public ResumeExtractionResult analyzeResume(String resumeText, String jobDesc) {
        String prompt = buildExtractionPrompt(resumeText, jobDesc);
        String response = hfClient.callLLM(prompt, "mistralai/Mistral-7B-Instruct-v0.2");
        return parseExtractionResponse(response);
    }
    
    // Conditional logic - score >= 70% → Interview, else → Feedback
    public void processCandidate(Session session) {
        ResumeExtractionResult extraction = session.getExtractionResult();
        
        if (extraction.getMatchScore() >= 70) {
            // LLM Call 2A: Generate interview questions
            InterviewQuestions questions = generateInterviewQuestions(
                extraction, 
                session.getJobDescription()
            );
            session.setInterviewQuestions(questions);
        } else {
            // LLM Call 2B: Generate rejection guidance
            RejectionGuidance guidance = generateRejectionGuidance(
                extraction,
                session.getJobDescription()
            );
            session.setRejectionGuidance(guidance);
        }
        
        // LLM Call 3: Always generate summary
        RecruiterSummary summary = generateRecruiterSummary(
            extraction,
            session.getJobDescription(),
            session.getInterviewQuestions(),
            session.getRejectionGuidance()
        );
        session.setRecruiterSummary(summary);
    }
    
    private InterviewQuestions generateInterviewQuestions(
        ResumeExtractionResult resume, 
        String jobDesc
    ) {
        String prompt = buildInterviewPrompt(resume, jobDesc);
        String response = hfClient.callLLM(prompt, "mistralai/Mistral-7B-Instruct-v0.2");
        return parseInterviewResponse(response);
    }
    
    private RejectionGuidance generateRejectionGuidance(
        ResumeExtractionResult resume,
        String jobDesc
    ) {
        String prompt = buildFeedbackPrompt(resume, jobDesc);
        String response = hfClient.callLLM(prompt, "mistralai/Mistral-7B-Instruct-v0.2");
        return parseFeedbackResponse(response);
    }
    
    private RecruiterSummary generateRecruiterSummary(
        ResumeExtractionResult resume,
        String jobDesc,
        InterviewQuestions questions,
        RejectionGuidance feedback
    ) {
        String prompt = buildSummaryPrompt(resume, jobDesc, questions, feedback);
        String response = hfClient.callLLM(prompt, "tiiuae/falcon-7b-instruct");
        return parseSummaryResponse(response);
    }
    
    // Prompt templates
    private String buildExtractionPrompt(String resume, String jobDesc) {
        return """
            You are an expert HR recruiter. Analyze this resume against the job description.
            Extract and structure the candidate's information as JSON.
            
            Resume:
            """ + resume + """
            
            Job Description:
            """ + jobDesc + """
            
            Return a JSON object with:
            - skills: list of technical skills
            - experience_years: years of experience
            - education: highest education level
            - match_score: 0-100 score for job fit
            - strengths: list of candidate strengths
            - missing_requirements: list of required but missing skills
            """;
    }
    
    private String buildInterviewPrompt(ResumeExtractionResult resume, String jobDesc) {
        return """
            You are a senior technical hiring manager. Generate 8-10 interview questions
            tailored to this candidate and job role.
            
            Candidate Skills: """ + String.join(", ", resume.getSkills()) + """
            Job Requirements: """ + jobDesc + """
            
            Generate questions as JSON array with: id, category, question, difficulty, time_estimate_minutes
            """;
    }
    
    private String buildFeedbackPrompt(ResumeExtractionResult resume, String jobDesc) {
        return """
            You are a compassionate career coach. This candidate didn't meet requirements.
            Provide constructive feedback and improvement suggestions.
            
            Match Score: """ + resume.getMatchScore() + """
            Missing Requirements: """ + String.join(", ", resume.getMissingRequirements()) + """
            
            Generate JSON with: rejection_reasons, improvements (with learning resources), alternative_roles
            """;
    }
    
    private String buildSummaryPrompt(
        ResumeExtractionResult resume,
        String jobDesc,
        InterviewQuestions questions,
        RejectionGuidance feedback
    ) {
        return """
            You are writing a professional recruiter summary. Generate an executive summary.
            
            Include: executive_summary (150-200 words), strengths (3-4 top), concerns, 
            recommendation (STRONG_YES, YES, MAYBE, NO), next_steps
            """;
    }
    
    // Response parsing
    private ResumeExtractionResult parseExtractionResponse(String response) {
        // Extract JSON from response and parse
        return JsonParserUtil.parseJson(response, ResumeExtractionResult.class);
    }
    
    private InterviewQuestions parseInterviewResponse(String response) {
        return JsonParserUtil.parseJson(response, InterviewQuestions.class);
    }
    
    private RejectionGuidance parseFeedbackResponse(String response) {
        return JsonParserUtil.parseJson(response, RejectionGuidance.class);
    }
    
    private RecruiterSummary parseSummaryResponse(String response) {
        return JsonParserUtil.parseJson(response, RecruiterSummary.class);
    }
}
```

#### 2.4 Create REST Controllers

```java
@RestController
@RequestMapping("/api/v1")
@Slf4j
public class AnalysisController {
    
    @Autowired
    private AIOrchestrationService aiService;
    
    @Autowired
    private SessionManager sessionManager;
    
    @PostMapping("/analysis/screen")
    public ResponseEntity<?> analyzeResume(@RequestBody AnalysisRequest request) {
        try {
            Session session = sessionManager.getSession(request.getSessionId());
            
            // LLM Call 1
            ResumeExtractionResult extraction = aiService.analyzeResume(
                request.getResumeText(),
                request.getJobDescription()
            );
            session.setExtractionResult(extraction);
            
            // Conditional LLM Calls 2A/2B + 3
            aiService.processCandidate(session);
            
            sessionManager.updateSession(session);
            
            return ResponseEntity.ok(new AnalysisResponse(session));
        } catch (Exception e) {
            log.error("Analysis failed", e);
            return ResponseEntity.status(500)
                .body(new ErrorResponse("Analysis failed: " + e.getMessage()));
        }
    }
}
```

---

### Phase 3: Frontend Implementation

#### 3.1 Create Angular Components

Generate components using Angular CLI:

```bash
cd frontend
ng generate component components/upload
ng generate component components/analysis-result
ng generate component components/interview-questions
ng generate component components/feedback
ng generate component components/report
ng generate service services/api
```

#### 3.2 Create API Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8080/api/v1';
  
  constructor(private http: HttpClient) { }
  
  uploadResume(file: File, jobDescription: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobDescription', jobDescription);
    
    return this.http.post(`${this.apiUrl}/resume/upload`, formData);
  }
  
  analyzeResume(sessionId: string, resumeText: string, jobDesc: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/analysis/screen`, {
      sessionId,
      resumeText,
      jobDescription: jobDesc
    });
  }
  
  getResults(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analysis/${sessionId}/results`);
  }
  
  generateReport(sessionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/generate`, { sessionId });
  }
}
```

#### 3.3 Create Main Components

**UploadComponent** - File upload + job description
**AnalysisResultComponent** - Show extracted data + match score
**InterviewQuestionsComponent** - Show questions (if score >= 70%)
**FeedbackComponent** - Show guidance (if score < 70%)
**ReportComponent** - Final summary + export

---

## Complete Workflow

```
1. User uploads resume + job description
   ↓
2. Backend creates session, extracts text
   ↓
3. Frontend receives session_id, shows preview
   ↓
4. User clicks "Analyze"
   ↓
5. Backend triggers AI Orchestration:
   - LLM Call 1: Extract resume data (Mistral)
   - Decision: if match_score >= 70%
   - LLM Call 2A: Interview questions (Mistral) OR
   - LLM Call 2B: Rejection guidance (Mistral)
   - LLM Call 3: Recruiter summary (Falcon)
   ↓
6. Frontend shows conditional pages
   - IF score >= 70% → Interview Questions Page
   - ELSE → Feedback Page
   - ALWAYS → Report Page
   ↓
7. User can export/share report
```

---

## Git Workflow

```bash
# 1. Initialize repository
git init
git add .
git commit -m "Initial commit with documentation and project structure"

# 2. Create GitHub repository
# Go to github.com → Create new repository
# Name: ai-resume-screener
# Description: AI-powered resume screening system with 3 orchestrated LLM calls

# 3. Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/ai-resume-screener.git
git branch -M main
git push -u origin main

# 4. Create .gitignore (already provided)
# Includes: node_modules/, target/, .env, etc.

# 5. Create releases as you complete phases
git tag -a v0.1.0 -m "Phase 1: Setup Complete"
git push origin v0.1.0
```

---

## Environment Variables

Create `.env` file:

```
# HuggingFace API
HUGGINGFACE_API_KEY=your_api_key_here
HUGGINGFACE_API_URL=https://api-inference.huggingface.co

# Backend
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:4200

# Frontend
BACKEND_URL=http://localhost:8080/api/v1

# Session Management
SESSION_TIMEOUT_MINUTES=1440
MAX_FILE_SIZE_MB=10
```

---

## Testing Strategy

### Backend Unit Tests
- Test HuggingFaceClient (with mocked responses)
- Test AIOrchestrationService logic
- Test response parsing

### Frontend Tests
- Component initialization
- API service calls
- Form validation
- Routing logic

### Integration Tests
- Complete workflow: upload → analyze → view results
- Error handling scenarios
- Rate limiting

---

## Deployment Options

### Option 1: Docker Compose (Recommended)
```dockerfile
# Backend Dockerfile
FROM openjdk:21
COPY target/resume-screener-api.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]

# Frontend Dockerfile
FROM node:18 AS build
COPY . .
RUN npm install && ng build --prod

FROM nginx
COPY --from=build /dist /usr/share/nginx/html
```

### Option 2: Cloud Deployment
- Heroku: `git push heroku main`
- AWS: EC2 instance with Java + Nginx
- Google Cloud: Cloud Run + Cloud Storage

---

## Success Checklist

- [ ] 3 LLM calls orchestrated and working
- [ ] Conditional logic (score >= 70%) working
- [ ] All REST endpoints functional
- [ ] Frontend components rendering correctly
- [ ] Error handling implemented
- [ ] Rate limiting working
- [ ] Unit tests written (80%+ coverage backend)
- [ ] E2E workflow tested
- [ ] GitHub repository created and pushed
- [ ] Documentation complete

---

## Next Steps

1. **Follow Phase 1-6** in IMPLEMENTATION_ROADMAP.md
2. **Build incrementally** - test after each phase
3. **Push to GitHub** - commits after each milestone
4. **Iterate** - refine based on testing feedback

---

Good luck! 🚀

# System Architecture & Design

## Table of Contents
1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [AI Orchestration Pipeline](#ai-orchestration-pipeline)
5. [Technology Decisions](#technology-decisions)
6. [Deployment Architecture](#deployment-architecture)

---

## Overview

The **AI Resume Screener** is a three-tier distributed system that orchestrates multiple LLM API calls to automate resume screening and interview preparation.

### System Principles
- **Stateless Backend:** Easy horizontal scaling
- **API-First Design:** Frontend/Backend decoupling
- **AI-Orchestrated Workflow:** Multi-call LLM coordination
- **Privacy-First:** No persistent data storage
- **Resilient Architecture:** Retry logic, circuit breakers

---

## Component Architecture

### 3-Tier System

```
┌─────────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                         │
│                                                              │
│  Angular SPA (TypeScript)                                   │
│  ├── Upload Module (file + job description form)            │
│  ├── Analysis Module (display extracted resume data)        │
│  ├── Interview Module (conditional - high match path)       │
│  ├── Feedback Module (conditional - low match path)         │
│  └── Report Module (recruiter summary + export)             │
└─────────────────────────────┬───────────────────────────────┘
                              │
                    REST API (JSON over HTTPS)
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    BUSINESS LAYER                           │
│                                                              │
│  Spring Boot 3.3 REST API                                   │
│  ├── Controller Layer (REST endpoints)                      │
│  ├── Service Layer (business logic)                         │
│  │   ├── ResumeParserService                               │
│  │   ├── AnalysisService                                   │
│  │   ├── AIOrchestrationService ⭐ (Core LLM logic)        │
│  │   └── ReportGeneratorService                            │
│  ├── Utility Layer (validators, formatters)                │
│  └── Exception Handler (global error handling)             │
└─────────────────────────────┬───────────────────────────────┘
                              │
                    HTTPS API Calls (JSON)
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    DATA/AI LAYER                            │
│                                                              │
│  Hugging Face Inference API                                │
│  ├── LLM Call 1: Resume Extraction                         │
│  ├── LLM Call 2A/2B: Interview/Feedback                    │
│  └── LLM Call 3: Summary Generation                        │
│                                                              │
│  In-Memory Session Storage                                 │
│  └── ConcurrentHashMap<String, Session>                    │
└─────────────────────────────────────────────────────────────┘
```

### Backend Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    REST CONTROLLERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ResumeController       AnalysisController                 │
│  • POST /upload         • POST /analyze                    │
│  • GET /preview         • GET /results                     │
│                                                              │
│  InterviewController    FeedbackController                 │
│  • POST /generate-qs    • POST /generate-guidance          │
│  • GET /questions       • GET /suggestions                 │
│                                                              │
│  ReportController       HealthController                   │
│  • POST /generate       • GET /health                      │
│  • GET /export          • GET /status                      │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────▼──────────┐
        │  SPRING SECURITY  │
        │  • CORS Filter    │
        │  • Rate Limiting  │
        │  • Error Handler  │
        └────────┬──────────┘
                 │
┌────────────────▼──────────────────────────────────────────────┐
│                      SERVICE LAYER                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ResumeParserService           AnalysisService               │
│  • parseFile(MultipartFile)    • analyzeResume()            │
│  • extractText()               • calculateMatchScore()       │
│  • validateResume()            • compareSkills()             │
│                                                                │
│  AIOrchestrationService ⭐ (CORE COMPONENT)                  │
│  • Call 1: extractResumeData()                              │
│  • Decision: if (matchScore >= 70%)                         │
│  • Call 2A: generateInterviewQuestions()                    │
│  • Call 2B: generateRejectionGuidance()                     │
│  • Call 3: generateRecruiterSummary()                       │
│                                                                │
│  HuggingFaceClient                                           │
│  • textGeneration(prompt, model)                            │
│  • callWithRetry(prompt, maxRetries)                        │
│  • parseResponse(rawResponse)                               │
│  • enforceRateLimit()                                       │
│                                                                │
│  ReportGeneratorService                                      │
│  • generateHTML()                                            │
│  • exportToPDF() [Optional]                                  │
│  • generateJSON()                                            │
└────────────────┬──────────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────────┐
│                    UTILITY & SUPPORT                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ValidationUtil            JsonParserUtil                    │
│  • validateFile()          • parseHFResponse()              │
│  • validateJobDesc()       • validateJsonSchema()           │
│  • validateResume()        • formatResponse()               │
│                                                                │
│  SessionManager            LoggerUtil                       │
│  • createSession()         • logAICall()                    │
│  • getSession()            • logError()                     │
│  • deleteExpiredSessions() • logMetrics()                   │
└────────────────────────────────────────────────────────────────┘
```

### Frontend Component Hierarchy

```
AppComponent (Root)
│
├── Header Component
│   ├── Logo
│   ├── Navigation
│   └── User Menu
│
├── Router Outlet
│   │
│   ├── UploadComponent
│   │   ├── FileUploadWidget
│   │   ├── JobDescriptionForm
│   │   ├── ValidationMessages
│   │   └── SubmitButton
│   │
│   ├── AnalysisResultComponent
│   │   ├── ExtractedDataDisplay
│   │   │   ├── SkillsTagComponent
│   │   │   ├── ExperienceTimelineComponent
│   │   │   └── EducationCardComponent
│   │   │
│   │   └── MatchScoreComponent
│   │       ├── ScoreProgressBar
│   │       ├── ScoreBreakdown
│   │       └── MatchIndicator
│   │
│   ├── InterviewQuestionsComponent (Conditional: score >= 70%)
│   │   ├── QuestionListComponent
│   │   │   ├── QuestionCardComponent
│   │   │   │   ├── Question Text
│   │   │   │   ├── Difficulty Badge
│   │   │   │   ├── Category Tag
│   │   │   │   └── Time Estimate
│   │   │   └── FilterComponent
│   │   │
│   │   ├── ExportComponent
│   │   │   ├── PrintButton
│   │   │   ├── PDFExportButton
│   │   │   └── ShareButton
│   │   │
│   │   └── ProgressTracker
│   │
│   ├── FeedbackComponent (Conditional: score < 70%)
│   │   ├── RejectionReasonComponent
│   │   ├── ImprovementSuggestionsComponent
│   │   │   ├── SkillCardComponent
│   │   │   ├── LearningPathComponent
│   │   │   └── ResourceListComponent
│   │   │
│   │   └── AlternativeRolesComponent
│   │
│   └── ReportComponent
│       ├── SummaryDisplayComponent
│       ├── StrengthsWeaknesseComponent
│       ├── RecommendationBannerComponent
│       │
│       └── ExportComponent
│           ├── DownloadPDFButton
│           ├── EmailShareButton
│           └── ArchiveButton
│
├── LoadingSpinnerComponent
├── ErrorBoundaryComponent
└── ToastNotificationComponent
```

---

## Data Flow

### Complete End-to-End Flow

```
USER INTERACTION:
┌──────────────────────────────────────────────────┐
│  1. User uploads resume file + job description   │
│  2. Clicks "Analyze Candidate"                   │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│  FRONTEND: UploadComponent                        │
│  ✓ Validate file size & type                     │
│  ✓ Validate job description length               │
│  ✓ Show loading spinner                          │
│  • HTTP POST /api/v1/resume/upload               │
│    Content-Type: multipart/form-data             │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│  BACKEND: ResumeController.upload()              │
│  ✓ Save multipart file temporarily              │
│  ✓ Create session UUID                          │
│  ✓ Extract text from resume                      │
│  ✓ Return session_id to frontend                │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│  FRONTEND: AnalysisResultComponent               │
│  ✓ Receive session_id                           │
│  ✓ Show resume preview                          │
│  ✓ Trigger HTTP POST /api/v1/analysis/screen    │
│    Body: {                                       │
│      session_id: "uuid",                        │
│      resume_text: "...",                        │
│      job_description: "..."                     │
│    }                                            │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│  BACKEND: AnalysisController.analyze()           │
│  ├─ Validate input                              │
│  └─ Call AIOrchestrationService                 │
└────────────────────┬─────────────────────────────┘
                     │
        ┌────────────▼──────────────┐
        │  ⭐ LLM CALL 1             │
        │  Resume Extraction        │
        └────────────┬───────────────┘
                     │
    ┌────────────────┴────────────────┐
    │                                  │
    ▼                                  ▼
┌─────────────────────────┐  ┌──────────────────────┐
│ HuggingFaceClient       │  │ Prompt Template 1    │
│                         │  │                      │
│ textGeneration(         │  │ "You are an expert  │
│   prompt,              │  │  HR recruiter..."    │
│   model: Llama-2       │  │                      │
│ )                       │  │ Extract:             │
│                         │  │ - Skills             │
│ ✓ With retry logic     │  │ - Experience         │
│ ✓ Rate limit check     │  │ - Match Score        │
│ ✓ Timeout handling     │  │ - Missing Reqs       │
│ ✓ Response validation  │  │                      │
└───────────┬─────────────┘  └──────────────────────┘
            │
            ▼ (Response: JSON)
┌──────────────────────────────────────────────────┐
│  ResumeExtractionResult:                         │
│  {                                               │
│    skills: [...],                               │
│    experience_years: 5,                         │
│    education: "...",                            │
│    match_score: 78,                             │
│    strengths: [...],                            │
│    missing_requirements: [...]                  │
│  }                                               │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  DECISION LOGIC ⚡      │
        │  if (score >= 70%)     │
        └────────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
      YES (≥70%)            NO (<70%)
        │                         │
        ▼                         ▼
┌──────────────────────┐  ┌────────────────────┐
│  ⭐ LLM CALL 2A      │  │  ⭐ LLM CALL 2B    │
│  Interview Q's       │  │  Rejection Guidance│
│  Mistral Model       │  │  Mistral Model     │
│                      │  │                    │
│  Generate:           │  │  Generate:         │
│  • Technical Q's     │  │  • Missing Skills  │
│  • Behavioral Q's    │  │  • Learning Path   │
│  • Problem-Solving   │  │  • Alt. Roles      │
└──────────┬───────────┘  └────────────┬───────┘
           │                           │
           └───────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  ⭐ LLM CALL 3           │
        │  Recruiter Summary       │
        │  Falcon Model            │
        └──────────────┬───────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  RecruiterSummary:                              │
│  {                                              │
│    executive_summary: "...",                   │
│    strengths: [...],                           │
│    concerns: [...],                            │
│    recommendation: "SHORTLIST",                │
│    next_steps: [...]                           │
│  }                                              │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│  FRONTEND: Display Results                       │
│  ✓ Show AnalysisResultComponent                │
│  ✓ Show conditional InterviewComponent          │
│      OR FeedbackComponent                       │
│  ✓ Show ReportComponent                        │
│  ✓ Allow export/share                          │
└──────────────────────────────────────────────────┘
```

### Session Data Model

```
Session {
  id: UUID
  created_at: Timestamp
  expires_at: Timestamp
  
  resumeData {
    original_text: String
    file_name: String
    upload_time: Timestamp
  }
  
  jobDescription: String
  
  extractedData {
    skills: List<String>
    experience_years: Integer
    education: String
    achievements: List<String>
    strengths: List<String>
    missing_requirements: List<String>
    tech_stack: List<String>
    match_score: Integer (0-100)
  }
  
  aiResponses {
    llm_call_1_response: JSON (from Mistral-7B)
    llm_call_2_response: JSON (from Mistral)
    llm_call_3_response: JSON (from Falcon)
  }
  
  interviewQuestions: List<InterviewQuestion> (if score >= 70%)
  rejectionGuidance: RejectionGuidance (if score < 70%)
  recruiterSummary: RecruiterSummary
  
  metadata {
    total_processing_time_ms: Long
    ai_call_durations: Map<String, Long>
    user_agent: String
    ip_address: String
  }
}
```

---

## AI Orchestration Pipeline

### LLM Call 1: Resume Extraction (Mistral-7B-Instruct-v0.2)

```
┌─────────────────────────────────────────────┐
│  INPUT                                      │
├─────────────────────────────────────────────┤
│  {                                          │
│    resume_text: "John Smith...",           │
│    job_description: "Senior Backend..."    │
│  }                                          │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  PROMPT ENGINEERING                         │
├─────────────────────────────────────────────┤
│  System: "You are an expert HR recruiter"  │
│                                             │
│  User: "Analyze this resume against the   │
│  job description. Extract and structure   │
│  the candidate's information as JSON."    │
│                                             │
│  Config:                                   │
│  - Temperature: 0.3 (consistent)          │
│  - Max tokens: 1500                        │
│  - Stop sequences: ["```", "JSON"]        │
└────────────────────┬────────────────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │  HUGGING FACE API CALL   │
         │  POST /models/llama-2    │
         │  Authorization: Bearer   │
         └────────────┬─────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│  OUTPUT (RAW)                               │
├─────────────────────────────────────────────┤
│  "Here's the structured analysis:          │
│  {                                          │
│    \"skills\": [\"Java\", \"Spring\"],      │
│    \"experience_years\": 5,                │
│    \"match_score\": 78,                    │
│    ...                                      │
│  }"                                         │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  RESPONSE PARSING & VALIDATION              │
├─────────────────────────────────────────────┤
│  1. Extract JSON from markdown             │
│  2. Validate against schema                │
│  3. Verify required fields                 │
│  4. Check data types                       │
│  5. Calculate match_score precision        │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  STRUCTURED OUTPUT                          │
├─────────────────────────────────────────────┤
│  ResumeExtractionResult {                  │
│    skills: [...],                          │
│    experience_years: 5,                   │
│    match_score: 78,                       │
│    confidence: 0.95                        │
│  }                                          │
└─────────────────────────────────────────────┘
```

### LLM Call 2A: Interview Questions (Mistral-7B-Instruct)

```
Triggered when: match_score >= 70%

INPUT:
{
  candidate_profile: { ... extracted data ... },
  job_role: "Senior Backend Engineer"
}

PROMPT:
"You are a senior technical hiring manager preparing interview questions.
Based on this candidate profile and job role, generate 8-10 tailored
interview questions.

Candidate has: Java, Spring Boot, 5 years experience
Job requires: Java, Spring Boot, Microservices, Kubernetes

Generate questions that:
- Are role-specific and challenging
- Mix technical, behavioral, and problem-solving
- Reveal candidate strengths and knowledge gaps
- Are realistic and fair

Return as JSON array with id, category, question, difficulty, time_estimate"

OUTPUT:
{
  "questions": [
    {
      "id": 1,
      "category": "technical",
      "question": "Design a scalable microservices architecture...",
      "difficulty": "hard",
      "time_estimate_minutes": 10
    },
    ...
  ]
}
```

### LLM Call 2B: Rejection Guidance (Mistral-7B-Instruct)

```
Triggered when: match_score < 70%

INPUT:
{
  candidate_profile: { ... extracted data ... },
  match_score: 45,
  job_requirements: "..."
}

PROMPT:
"You are a compassionate career coach providing constructive feedback.
This candidate did not meet the requirements for this role.
Provide actionable improvement suggestions and encouragement.

Generate:
- 2-3 main reasons for rejection
- Specific skills to improve with resources
- Timeline for skill acquisition
- Alternative roles they're suited for

Be realistic, encouraging, and constructive."

OUTPUT:
{
  "rejection_reasons": [...],
  "improvements": [
    {
      "skill": "Microservices",
      "current_level": "none",
      "recommended_resources": [...],
      "estimated_months": 6
    }
  ],
  "alternative_roles": [...]
}
```

### LLM Call 3: Recruiter Summary (Falcon-7b-instruct)

```
INPUT:
{
  candidate_profile: { ... },
  analysis_data: { ... },
  interview_data: { ... } (optional)
}

PROMPT:
"You are writing a professional recruiter summary for a hiring manager.
Generate an executive summary based on all analysis.

Include:
- 150-200 word professional summary
- Top 3-4 key strengths
- Any concerns or risk factors
- Clear recommendation (STRONG_YES, YES, MAYBE, NO)
- Next recommended steps
- Interview readiness assessment

Be objective, professional, and actionable."

OUTPUT:
{
  "executive_summary": "...",
  "strengths": [...],
  "recommendation": "YES",
  "next_steps": [...]
}
```

---

## Technology Decisions

### Why These Technologies?

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Backend** | Spring Boot 3.3 | Industry standard, mature ecosystem, excellent documentation |
| **Frontend** | Angular 18 | Enterprise-grade, strong type safety, component architecture |
| **Language** | Java 21 | Latest LTS, strong typing, mature JVM ecosystem |
| **TypeScript** | 5.x | Type safety in frontend, catches errors at compile time |
| **AI Provider** | Hugging Face Inference | No model downloads, serverless, flexible model selection |
| **Storage** | In-Memory | Meets requirements, simple deployment, automatic privacy |
| **Testing** | JUnit 5 + Jasmine | Standard frameworks, excellent tooling, good coverage reports |
| **Build** | Maven + npm | Industry standard, dependency management, reproducible builds |
| **CI/CD** | GitHub Actions | Built-in, free tier sufficient, easy configuration |

### Architecture Patterns Used

1. **Service-Oriented Architecture**
   - Separation of concerns
   - Each service has single responsibility
   - Easy to test and maintain

2. **Repository/DAO Pattern**
   - For session management
   - Encapsulates data access logic
   - Future-proof for database migration

3. **Strategy Pattern**
   - AI orchestration: choose Call 2A vs 2B based on score
   - Extensible for future AI providers

4. **Decorator Pattern**
   - HTTP interceptors for logging, error handling
   - Aspect-oriented programming for cross-cutting concerns

5. **Facade Pattern**
   - AIOrchestrationService: hides complexity of 3 LLM calls
   - Single entry point for AI operations

---

## Deployment Architecture

### Local Development

```
Developer Machine
├── Backend (Spring Boot)
│   └── http://localhost:8080
├── Frontend (Angular Dev Server)
│   └── http://localhost:4200
└── Optional: Mock HF API responses
```

### Production Deployment

```
┌────────────────────────────────────────┐
│  Client Browser                         │
│  https://resume-screener.example.com   │
└────────────────────┬───────────────────┘
                     │
        ┌────────────▼──────────┐
        │  CDN / Load Balancer  │
        │  (CloudFlare/AWS ALB) │
        └────────────┬──────────┘
                     │
    ┌────────────────┴─────────────────┐
    │                                   │
    ▼                                   ▼
┌─────────────────┐        ┌──────────────────┐
│  Static Assets  │        │  API Gateway     │
│  (HTML/CSS/JS)  │        │  (Spring Cloud)  │
└─────────────────┘        └────────┬─────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
                ┌─────────┐    ┌─────────┐    ┌─────────┐
                │ Instance│    │ Instance│    │ Instance│
                │    1    │    │    2    │    │    3    │
                │ Spring  │    │ Spring  │    │ Spring  │
                │ Boot    │    │ Boot    │    │ Boot    │
                └────┬────┘    └────┬────┘    └────┬────┘
                     │              │              │
                     └──────┬───────┴──────┬───────┘
                            │              │
                ┌───────────▼──────────────▼──┐
                │  Distributed Cache          │
                │  Redis (Session Storage)    │
                └──────────────────────────────┘

External Services:
                ┌──────────────────────────────────┐
                │  Hugging Face Inference API      │
                │  • Llama-2 Model                 │
                │  • Mistral Model                 │
                │  • Falcon Model                  │
                └──────────────────────────────────┘
```

### Auto-Scaling Configuration

```yaml
Kubernetes Deployment (if containerized):
spec:
  replicas: 3  # Minimum
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  autoscaling:
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
```

---

## Performance Considerations

### Response Time Targets
- File upload: < 2s
- Resume parsing: < 3s
- LLM Call 1 (extraction): < 10s
- LLM Call 2 (interview/feedback): < 10s
- LLM Call 3 (summary): < 10s
- **Total workflow: < 35s**

### Optimization Strategies
1. **Parallel Processing:** Call 2A and 3 can run in parallel after Call 1
2. **Caching:** Cache common job descriptions and results
3. **Async Processing:** Long-running operations use async/await
4. **Connection Pooling:** Reuse HTTP connections to HF API
5. **Compression:** Enable gzip for API responses

### Memory Management
- Max session size: ~50KB
- Cleanup expired sessions hourly
- Max 100 concurrent sessions: ~5MB total memory
- No memory leaks (proper resource disposal)

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Network Security (HTTPS/TLS)          │
├─────────────────────────────────────────────────┤
│  • Enforce HTTPS in production                  │
│  • TLS 1.3 minimum                              │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  Layer 2: API Security                          │
├─────────────────────────────────────────────────┤
│  • CORS whitelist (frontend origin only)        │
│  • Rate limiting (100 req/min per IP)           │
│  • Request validation (size, format)            │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  Layer 3: Application Security                  │
├─────────────────────────────────────────────────┤
│  • Input sanitization                           │
│  • Output encoding (XSS prevention)             │
│  • CSRF tokens (if cookies used)                │
│  • Global exception handler (no stack exposure) │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  Layer 4: Data Security                         │
├─────────────────────────────────────────────────┤
│  • In-memory only (no persistent storage)       │
│  • Automatic session expiry (24h)               │
│  • No sensitive data in logs                    │
│  • Secure file handling                         │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  Layer 5: Audit & Compliance                    │
├─────────────────────────────────────────────────┤
│  • Audit logging of all AI calls                │
│  • User action tracking                         │
│  • Error tracking & alerting                    │
│  • GDPR/privacy compliance                      │
└─────────────────────────────────────────────────┘
```

---

## Monitoring & Observability

### Key Metrics

```
Application Metrics:
├── API Response Times (p50, p95, p99)
├── Error Rates (by endpoint)
├── LLM Call Durations
├── Cache Hit Rates
├── Session Count
└── Memory Usage

Business Metrics:
├── Resumes Processed
├── Average Match Score
├── Interview Questions Generated
├── Reports Exported
└── Feature Usage

Infrastructure Metrics:
├── CPU Usage
├── Memory Usage
├── Disk I/O
├── Network Bandwidth
└── API Rate Limit Status
```

---

**Last Updated:** 2026-05-25  
**Version:** 1.0

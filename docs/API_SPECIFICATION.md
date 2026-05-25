# API Specification

**Base URL:** `http://localhost:8080/api/v1`  
**Content-Type:** `application/json` (except file upload)

---

## Endpoints Overview

### Resume Management
- `POST /resume/upload` - Upload resume + job description
- `GET /resume/{sessionId}/preview` - Get resume preview

### Analysis
- `POST /analysis/screen` - Analyze resume (LLM Call 1)
- `GET /analysis/{sessionId}/results` - Get analysis results

### Interview Questions (High Match)
- `POST /interview/generate` - Generate interview questions (LLM Call 2A)
- `GET /interview/{sessionId}/questions` - Get generated questions

### Rejection Feedback (Low Match)
- `POST /feedback/generate` - Generate rejection guidance (LLM Call 2B)
- `GET /feedback/{sessionId}/suggestions` - Get improvement suggestions

### Reports
- `POST /report/generate` - Generate recruiter summary (LLM Call 3)
- `GET /report/{sessionId}/download` - Download report (PDF/JSON)
- `POST /report/{sessionId}/email` - Email report

### Health & Status
- `GET /health` - Health check
- `GET /status` - Detailed status

---

## 1. Upload Resume

**Endpoint:** `POST /resume/upload`

**Description:** Upload resume file and job description. Creates a session for tracking.

**Request:**
```http
POST /api/v1/resume/upload HTTP/1.1
Host: localhost:8080
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="resume_file"; filename="john_resume.pdf"
Content-Type: application/pdf

[Binary PDF Content]
------WebKitFormBoundary
Content-Disposition: form-data; name="job_description"

Senior Backend Engineer - Requirements: 5+ years Java, Spring Boot, 
Microservices architecture, Docker, Kubernetes, PostgreSQL, REST APIs.
Responsibilities: Design scalable systems, mentor junior developers,
code reviews, system design decisions.
------WebKitFormBoundary--
```

**Response:** `200 OK`
```json
{
  "session_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "upload_timestamp": "2026-05-25T14:30:00Z",
  "resume_text_preview": "John Smith\nSoftware Engineer\n5 years experience in Java...",
  "file_name": "john_resume.pdf",
  "file_size_bytes": 245600,
  "status": "uploaded_successfully"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error_code": "INVALID_UPLOAD",
  "message": "Resume file exceeds 5MB limit",
  "details": {
    "max_size_mb": 5,
    "provided_size_mb": 6.2
  },
  "timestamp": "2026-05-25T14:30:00Z",
  "request_id": "req-12345-abcde"
}
```

**Validation Rules:**
- File size: Max 5MB
- File types: PDF, TXT, DOC, DOCX
- Job description: 50-2000 characters
- Resume content: 100+ characters
- Session ID: Generated UUID

**Error Codes:**
- `INVALID_FILE_TYPE` (400) - File is not PDF/TXT/DOC/DOCX
- `FILE_TOO_LARGE` (413) - Exceeds 5MB limit
- `JOB_DESCRIPTION_MISSING` (400) - Required field missing
- `JOB_DESCRIPTION_TOO_SHORT` (400) - Less than 50 chars
- `JOB_DESCRIPTION_TOO_LONG` (400) - More than 2000 chars
- `INVALID_RESUME_FORMAT` (400) - Cannot parse resume
- `INTERNAL_SERVER_ERROR` (500) - Server-side error

---

## 2. Get Resume Preview

**Endpoint:** `GET /resume/{sessionId}/preview`

**Description:** Retrieve uploaded resume text and metadata without AI processing.

**Request:**
```http
GET /api/v1/resume/f47ac10b-58cc-4372-a567-0e02b2c3d479/preview HTTP/1.1
Host: localhost:8080
```

**Response:** `200 OK`
```json
{
  "session_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "resume_text": "John Smith\nSoftware Engineer with 5+ years...",
  "file_name": "john_resume.pdf",
  "upload_time": "2026-05-25T14:30:00Z",
  "file_size_bytes": 245600,
  "character_count": 3450,
  "job_description": "Senior Backend Engineer - Requirements..."
}
```

**Error Codes:**
- `SESSION_NOT_FOUND` (404) - Invalid session ID
- `SESSION_EXPIRED` (401) - Session older than 24 hours
- `INTERNAL_SERVER_ERROR` (500)

---

## 3. Analyze Resume (LLM Call 1)

**Endpoint:** `POST /analysis/screen`

**Description:** Analyzes resume against job description using Llama-2. Extracts structured data and calculates match score.

**Request:**
```http
POST /api/v1/analysis/screen HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "session_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "resume_text": "John Smith\nSoftware Engineer...",
  "job_description": "Senior Backend Engineer - Requirements..."
}
```

**Response:** `200 OK`
```json
{
  "session_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "extracted_data": {
    "skills": [
      "Java",
      "Spring Boot",
      "Docker",
      "PostgreSQL",
      "REST APIs",
      "Microservices",
      "Git"
    ],
    "experience_years": 5,
    "education": "B.Tech Computer Science, IIT Delhi (2018)",
    "achievements": [
      "Led migration of monolithic app to microservices",
      "Reduced API response time by 40%",
      "Mentored 3 junior developers"
    ],
    "strengths": [
      "Strong backend fundamentals",
      "Excellent system design knowledge",
      "Good communication and mentoring skills",
      "Cloud infrastructure experience"
    ],
    "missing_requirements": [
      "Kubernetes - not mentioned in resume",
      "Advanced system design patterns",
      "AWS certifications"
    ],
    "tech_stack": [
      "Java",
      "Spring Boot",
      "PostgreSQL",
      "Docker",
      "Jenkins",
      "Git"
    ],
    "overall_match_score": 78,
    "match_reasoning": "Candidate has 5 years backend experience with required Java and Spring Boot skills. 
                       Has Docker experience. Missing Kubernetes which is listed as requirement. 
                       Strong match for the role (78/100)."
  },
  "analysis_timestamp": "2026-05-25T14:32:15Z",
  "processing_time_ms": 8234,
  "ai_model_used": "meta-llama/Llama-2-7b-chat",
  "confidence_score": 0.92
}
```

**Response Details:**
- `skills`: List of identified technologies/languages
- `experience_years`: Total years of professional experience
- `education`: Degree and institution (if mentioned)
- `achievements`: Key accomplishments from resume
- `strengths`: Top 3-4 strengths relevant to job
- `missing_requirements`: Critical gaps vs. job description
- `tech_stack`: Technologies candidate has used
- `overall_match_score`: 0-100 score (triggers decision logic)
- `processing_time_ms`: How long LLM call took
- `confidence_score`: 0-1 confidence in extraction

**Error Codes:**
- `SESSION_NOT_FOUND` (404)
- `SESSION_EXPIRED` (401)
- `INVALID_RESUME_TEXT` (400)
- `AI_API_TIMEOUT` (504)
- `AI_API_RATE_LIMITED` (429)
- `INVALID_AI_RESPONSE` (500)
- `INTERNAL_SERVER_ERROR` (500)

**Important:** This endpoint triggers LLM Call 1 (Resume Extraction).

---

## 4. Get Analysis Results

**Endpoint:** `GET /analysis/{sessionId}/results`

**Description:** Retrieve cached analysis results without re-processing.

**Request:**
```http
GET /api/v1/analysis/f47ac10b-58cc-4372-a567-0e02b2c3d479/results HTTP/1.1
Host: localhost:8080
```

**Response:** `200 OK` (Same as `/analysis/screen` response)

**Error Codes:**
- `SESSION_NOT_FOUND` (404)
- `SESSION_EXPIRED` (401)
- `ANALYSIS_NOT_YET_RUN` (400)

---

## 5. Generate Interview Questions (LLM Call 2A)

**Endpoint:** `POST /interview/generate`

**Description:** Generates 8-10 interview questions for candidates with match_score ≥ 70%.

**Prerequisite:** `/analysis/screen` must be called first. Only available if `match_score >= 70%`.

**Request:**
```http
POST /api/v1/interview/generate HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "session_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "candidate_profile": {
    "skills": ["Java", "Spring Boot", "Docker"],
    "experience_years": 5,
    "strengths": ["backend fundamentals", "system design"],
    "missing_requirements": ["Kubernetes"]
  },
  "job_role": "Senior Backend Engineer",
  "difficulty_preference": "mixed"  // optional: easy, medium, hard, mixed
}
```

**Response:** `200 OK`
```json
{
  "session_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "interview_questions": [
    {
      "id": 1,
      "category": "technical",
      "question": "Walk us through a system design where you had to scale a microservice 
                   to handle 1 million concurrent users. What were the bottlenecks and 
                   how did you address them?",
      "difficulty": "hard",
      "focus_area": "System Design & Scalability",
      "time_estimate_minutes": 12,
      "follow_up_hints": [
        "Ask about database sharding",
        "Ask about caching strategies",
        "Ask about load balancing"
      ]
    },
    {
      "id": 2,
      "category": "technical",
      "question": "Describe your experience with containerization and orchestration. 
                   Have you worked with Docker? If not Kubernetes, would you be open to learning it?",
      "difficulty": "medium",
      "focus_area": "Docker & Cloud",
      "time_estimate_minutes": 8,
      "follow_up_hints": []
    },
    {
      "id": 3,
      "category": "behavioral",
      "question": "Tell us about a time when you had a conflict with a team member 
                   during a code review. How did you resolve it?",
      "difficulty": "medium",
      "focus_area": "Communication & Teamwork",
      "time_estimate_minutes": 7,
      "follow_up_hints": [
        "Listen for: empathy, conflict resolution, collaboration"
      ]
    },
    {
      "id": 4,
      "category": "technical",
      "question": "We have a REST API endpoint that's experiencing high latency (5s response time). 
                   Walk us through your debugging and optimization approach.",
      "difficulty": "medium",
      "focus_area": "Performance Optimization",
      "time_estimate_minutes": 10,
      "follow_up_hints": []
    },
    {
      "id": 5,
      "category": "problem-solving",
      "question": "Design an event-driven notification system that must handle 10K events/second 
                   with guaranteed delivery. What technologies would you use?",
      "difficulty": "hard",
      "focus_area": "Architecture & Technology Choices",
      "time_estimate_minutes": 15,
      "follow_up_hints": [
        "Look for: message queues, event streaming, idempotency",
        "Kafka vs RabbitMQ trade-offs"
      ]
    },
    {
      "id": 6,
      "category": "behavioral",
      "question": "Describe your approach to mentoring junior developers. 
                   Give an example of when you mentored someone.",
      "difficulty": "easy",
      "focus_area": "Leadership & Mentoring",
      "time_estimate_minutes": 8,
      "follow_up_hints": []
    },
    {
      "id": 7,
      "category": "technical",
      "question": "What's your experience with database optimization? 
                   How would you optimize a slow query affecting millions of records?",
      "difficulty": "medium",
      "focus_area": "Databases & Optimization",
      "time_estimate_minutes": 9,
      "follow_up_hints": [
        "Indexes, query execution plans, denormalization"
      ]
    },
    {
      "id": 8,
      "category": "problem-solving",
      "question": "Design a fault-tolerant payment processing system that must handle 
                   10K transactions/minute with less than 0.01% error rate.",
      "difficulty": "hard",
      "focus_area": "Reliability & Critical Systems",
      "time_estimate_minutes": 15,
      "follow_up_hints": []
    },
    {
      "id": 9,
      "category": "technical",
      "question": "Tell us about a time you had to refactor legacy code. 
                   What was your approach and what did you learn?",
      "difficulty": "medium",
      "focus_area": "Code Quality & Refactoring",
      "time_estimate_minutes": 8,
      "follow_up_hints": []
    },
    {
      "id": 10,
      "category": "behavioral",
      "question": "How do you stay updated with new technologies and industry trends?",
      "difficulty": "easy",
      "focus_area": "Learning & Growth Mindset",
      "time_estimate_minutes": 6,
      "follow_up_hints": []
    }
  ],
  "interview_summary": {
    "total_questions": 10,
    "by_category": {
      "technical": 4,
      "behavioral": 3,
      "problem-solving": 3
    },
    "by_difficulty": {
      "easy": 2,
      "medium": 5,
      "hard": 3
    },
    "estimated_total_duration_minutes": 98,
    "recommended_interview_format": "Technical round (90-120 minutes)"
  },
  "candidate_strengths_to_explore": [
    "System design experience",
    "Mentoring and leadership",
    "Problem-solving ability"
  ],
  "areas_of_concern_to_test": [
    "Kubernetes knowledge gap",
    "AWS certification status"
  ],
  "generation_timestamp": "2026-05-25T14:35:00Z",
  "processing_time_ms": 9456,
  "ai_model_used": "mistralai/Mistral-7B-Instruct-v0.2"
}
```

**Error Codes:**
- `SESSION_NOT_FOUND` (404)
- `SESSION_EXPIRED` (401)
- `ANALYSIS_NOT_RUN` (400) - Must call `/analysis/screen` first
- `MATCH_SCORE_TOO_LOW` (400) - Score < 70%, use feedback endpoint instead
- `AI_API_TIMEOUT` (504)
- `AI_API_RATE_LIMITED` (429)
- `INVALID_AI_RESPONSE` (500)

**Important:** Triggers LLM Call 2A (Interview Questions via Mistral).

---

## 6. Generate Rejection Feedback (LLM Call 2B)

**Endpoint:** `POST /feedback/generate`

**Description:** Generates constructive rejection feedback and improvement suggestions for candidates with match_score < 70%.

**Prerequisite:** `/analysis/screen` must be called first. Only available if `match_score < 70%`.

**Request:**
```http
POST /api/v1/feedback/generate HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "session_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "candidate_profile": {
    "skills": ["Java", "Python"],
    "experience_years": 2,
    "education": "B.Tech Computer Science",
    "missing_requirements": ["Microservices", "Kubernetes", "System Design"]
  },
  "job_description": "Senior Backend Engineer - 5+ years required..."
}
```

**Response:** `200 OK`
```json
{
  "session_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "match_score": 45,
  "rejection_reasons": [
    "Insufficient experience: 2 years provided, 5+ required",
    "Missing critical technologies: Microservices, Kubernetes, Docker",
    "Limited system design background for senior role"
  ],
  "improvement_suggestions": [
    {
      "skill": "Microservices Architecture",
      "current_level": "none",
      "recommended_courses": [
        "Udemy: Microservices Software Architecture",
        "Coursera: Software Architecture for Cloud",
        "Educative: Grokking System Design"
      ],
      "recommended_books": [
        "Building Microservices by Sam Newman",
        "Designing Data-Intensive Applications by Martin Kleppmann"
      ],
      "estimated_months": 6,
      "learning_path": "1. Learn principles (2 weeks) → 2. Online course (4 weeks) → 
                        3. Build projects (8 weeks) → 4. Production experience (ongoing)"
    },
    {
      "skill": "Kubernetes & Container Orchestration",
      "current_level": "none",
      "recommended_courses": [
        "Udemy: Kubernetes for Developers",
        "Linux Foundation: Kubernetes Fundamentals (LF169)",
        "Pluralsight: Kubernetes Path"
      ],
      "estimated_months": 3,
      "learning_path": "1. Learn Docker first (2 weeks) → 2. Kubernetes basics (3 weeks) → 
                        3. Hands-on labs (4 weeks) → 4. Deploy real apps (ongoing)"
    },
    {
      "skill": "System Design & Architecture",
      "current_level": "beginner",
      "recommended_courses": [
        "Educative: Grokking System Design Interview",
        "AlgoExpert: System Design Mastery",
        "LeetCode System Design"
      ],
      "estimated_months": 4,
      "learning_path": "1. Learn fundamentals (3 weeks) → 2. Study case studies (3 weeks) → 
                        3. Practice design problems (6 weeks) → 4. Interview prep (ongoing)"
    },
    {
      "skill": "Advanced Spring Boot & Modern Java",
      "current_level": "intermediate",
      "recommended_courses": [
        "Spring.io: Spring Boot Documentation & Guides",
        "Baeldung: Spring Tutorials",
        "Pluralsight: Spring Path"
      ],
      "estimated_months": 2,
      "learning_path": "1. Latest Spring features (2 weeks) → 2. Spring Cloud (3 weeks) → 
                        3. Performance tuning (3 weeks)"
    }
  ],
  "alternative_roles": [
    {
      "role": "Mid-Level Backend Engineer",
      "suitability_score": 72,
      "reason": "You have solid Java skills and 2 years experience. This role typically requires 3-4 years, 
               which matches your timeline in 1-2 years."
    },
    {
      "role": "Junior/Mid-Level Software Engineer",
      "suitability_score": 85,
      "reason": "Your current skills and experience level are well-suited for this role. You could start here 
               and grow into the senior position."
    },
    {
      "role": "DevOps Engineer (Junior)",
      "suitability_score": 68,
      "reason": "If you're interested in infrastructure, you already have some foundational knowledge. 
               Focus on Kubernetes and cloud platforms."
    }
  ],
  "positive_aspects": [
    "Solid Java fundamentals",
    "Understanding of OOP and design patterns",
    "Willingness to learn new technologies",
    "Young in career (growth potential)"
  ],
  "encouragement_message": "While you don't meet the current requirements for this Senior Backend Engineer role, 
                           you have a solid foundation and clear potential! With focused effort on Microservices, 
                           Kubernetes, and System Design over the next 12-18 months, you'll be well-positioned for 
                           this or similar senior roles. The learning path is clear—stay consistent, build projects, 
                           and gain production experience.",
  "estimated_timeline_to_readiness": {
    "minimum_months": 12,
    "recommended_months": 18,
    "maximum_months": 24,
    "description": "With dedicated learning and hands-on practice, 12-18 months is realistic. 
                   More time allows for deeper mastery and production experience."
  },
  "next_steps": [
    "Start with Docker fundamentals (if not familiar)",
    "Take a microservices course while building a project",
    "Practice system design on LeetCode/Educative",
    "Consider a mid-level backend role in the meantime",
    "Reapply when you have production Kubernetes experience"
  ],
  "generation_timestamp": "2026-05-25T14:38:00Z",
  "processing_time_ms": 8923,
  "ai_model_used": "mistralai/Mistral-7B-Instruct-v0.2"
}
```

**Error Codes:**
- `SESSION_NOT_FOUND` (404)
- `SESSION_EXPIRED` (401)
- `ANALYSIS_NOT_RUN` (400)
- `MATCH_SCORE_TOO_HIGH` (400) - Score ≥ 70%, use interview endpoint instead
- `AI_API_TIMEOUT` (504)
- `AI_API_RATE_LIMITED` (429)

**Important:** Triggers LLM Call 2B (Feedback via Mistral).

---

## 7. Generate Recruiter Summary (LLM Call 3)

**Endpoint:** `POST /report/generate`

**Description:** Generates professional recruiter summary report using Falcon model. Works for all candidates.

**Prerequisite:** Both `/analysis/screen` and either `/interview/generate` OR `/feedback/generate` should be called first.

**Request:**
```http
POST /api/v1/report/generate HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "session_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "include_interview_data": true,
  "export_format": "json"  // json, html, pdf
}
```

**Response:** `200 OK`
```json
{
  "session_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "recruiter_summary": {
    "candidate_name": "John Smith",
    "job_applied_for": "Senior Backend Engineer",
    "executive_summary": "John is a strong backend engineer with 5+ years of production experience building 
                        scalable microservices. He demonstrates solid understanding of system design, 
                        cloud infrastructure (Docker), and mentoring capabilities. While he hasn't worked 
                        with Kubernetes yet, his rapid learning ability and strong fundamentals suggest 
                        he can quickly upskill. Recommended for technical round interview. Overall fit: 78/100.",
    "match_analysis": {
      "overall_score": 78,
      "skill_match": {
        "matched_skills": ["Java", "Spring Boot", "Docker", "PostgreSQL", "REST APIs", "Microservices"],
        "matched_percentage": 85,
        "unmatched_skills": ["Kubernetes", "AWS Certification"],
        "unmatched_percentage": 15
      },
      "experience_alignment": "Exactly 5+ years required - Perfect match",
      "education_fit": "B.Tech Computer Science - Meets requirement"
    },
    "key_strengths": [
      "Strong system design and architecture knowledge (demonstrated in projects)",
      "5+ years backend experience with required tech stack",
      "Proven leadership: mentored 3 junior developers",
      "Cloud infrastructure experience with Docker",
      "Fast learner (picked up microservices architecture independently)"
    ],
    "risk_factors": [
      "No Kubernetes experience (though has Docker foundation)",
      "No AWS certifications (not critical, learnable)",
      "May take 2-3 months to reach full productivity on K8s"
    ],
    "recommendation": {
      "hire_decision": "SHORTLIST_FOR_INTERVIEW",
      "confidence_level": "HIGH",
      "decision_reasoning": "Candidate has the core skills and experience required. Missing Kubernetes is 
                           manageable given Docker knowledge and learning ability. Ready for technical interview."
    },
    "interview_readiness": {
      "status": "READY",
      "estimated_interview_duration_minutes": 90,
      "suggested_interview_format": "Technical + Behavioral + System Design Round (90-120 minutes)",
      "interviewer_notes": "Focus on: system design capabilities, microservices experience, 
                          mentoring approach, problem-solving. Gauge learning ability for Kubernetes."
    },
    "next_steps": [
      "Schedule technical interview (90 minutes)",
      "Send interview question package 1 day before",
      "Prepare system design whiteboard scenario",
      "Allocate 3 months onboarding budget for Kubernetes training"
    ],
    "recommended_team_fit": {
      "technical_level": "Senior",
      "cultural_fit_assessment": "Good - experienced in mentoring, collaborative",
      "team_size_preference": "Suitable for both 5 and 15+ person teams"
    },
    "estimated_salary_expectation": "$120,000 - $150,000 (based on 5 years experience in metro tech hubs)",
    "competitor_risk": "HIGH - Experienced engineers are in high demand. Move quickly on next steps.",
    "onboarding_complexity": {
      "level": "MODERATE",
      "estimated_ramp_up_weeks": 8,
      "key_training_areas": ["Company-specific patterns", "Kubernetes", "Internal tools"]
    }
  },
  "summary_metadata": {
    "analysis_completed": true,
    "interview_data_included": true,
    "generation_timestamp": "2026-05-25T14:40:00Z",
    "processing_time_ms": 7834,
    "ai_model_used": "tiiuae/falcon-7b-instruct",
    "total_workflow_time_ms": 25523
  },
  "export_details": {
    "format": "json",
    "available_formats": ["json", "html", "pdf"],
    "download_url": "/api/v1/report/f47ac10b-58cc-4372-a567-0e02b2c3d479/download?format=pdf",
    "expiry_hours": 24
  }
}
```

**Error Codes:**
- `SESSION_NOT_FOUND` (404)
- `SESSION_EXPIRED` (401)
- `ANALYSIS_NOT_RUN` (400)
- `INTERVIEW_OR_FEEDBACK_NOT_RUN` (400) - Need to call interview or feedback endpoint
- `INVALID_EXPORT_FORMAT` (400)
- `PDF_GENERATION_FAILED` (500)

**Important:** Triggers LLM Call 3 (Summary via Falcon).

---

## 8. Download Report

**Endpoint:** `GET /report/{sessionId}/download?format={format}`

**Description:** Download generated report in specified format.

**Request:**
```http
GET /api/v1/report/f47ac10b-58cc-4372-a567-0e02b2c3d479/download?format=pdf HTTP/1.1
Host: localhost:8080
```

**Response:** `200 OK` (Binary File)
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="john_smith_report.pdf"

[Binary PDF Content]
```

**Formats:**
- `json` - JSON format (easy for API consumption)
- `html` - Formatted HTML (can be printed to PDF from browser)
- `pdf` - Direct PDF download

**Error Codes:**
- `SESSION_NOT_FOUND` (404)
- `REPORT_NOT_GENERATED` (400) - Must call `/report/generate` first
- `INVALID_FORMAT` (400)
- `FILE_NOT_FOUND` (404)

---

## 9. Email Report

**Endpoint:** `POST /report/{sessionId}/email` (Optional Feature)

**Description:** Email the report to specified recipients.

**Request:**
```http
POST /api/v1/report/f47ac10b-58cc-4372-a567-0e02b2c3d479/email HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "recipient_emails": ["hiring_manager@company.com", "hr@company.com"],
  "subject": "Resume Screening Report - John Smith",
  "include_interview_questions": true,
  "include_feedback": false,
  "custom_message": "Please review the attached candidate evaluation."
}
```

**Response:** `200 OK`
```json
{
  "status": "email_sent",
  "message": "Report sent to 2 recipients",
  "recipients": ["hiring_manager@company.com", "hr@company.com"],
  "sent_timestamp": "2026-05-25T14:42:00Z",
  "delivery_status": "success"
}
```

**Note:** This endpoint is optional and depends on email service configuration.

---

## 10. Health Check

**Endpoint:** `GET /health`

**Description:** Check application and AI provider health status.

**Request:**
```http
GET /api/v1/health HTTP/1.1
Host: localhost:8080
```

**Response:** `200 OK`
```json
{
  "status": "UP",
  "timestamp": "2026-05-25T14:43:00Z",
  "components": {
    "app": {
      "status": "UP",
      "details": "Application running normally"
    },
    "ai_provider": {
      "status": "UP",
      "provider": "HUGGING_FACE",
      "details": "Connected and responding",
      "api_version": "v1",
      "models": {
        "llama2": "operational",
        "mistral": "operational",
        "falcon": "operational"
      },
      "last_check": "2026-05-25T14:43:00Z",
      "response_time_ms": 45
    },
    "memory": {
      "status": "UP",
      "session_count": 23,
      "memory_usage_mb": 125,
      "memory_limit_mb": 512
    }
  }
}
```

**Error Response:** `503 Service Unavailable`
```json
{
  "status": "DOWN",
  "timestamp": "2026-05-25T14:43:00Z",
  "components": {
    "ai_provider": {
      "status": "DOWN",
      "error": "Connection timeout to Hugging Face API"
    }
  }
}
```

---

## Global Error Response Format

All error responses follow this format:

```json
{
  "error_code": "SPECIFIC_ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "specific_field_name",
    "reason": "detailed reason why this error occurred",
    "suggestion": "what the user can do to fix it"
  },
  "timestamp": "2026-05-25T14:30:00Z",
  "request_id": "req-12345-abcde-67890",
  "trace_id": "trace-xyz-789"  // For debugging
}
```

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Session expired, invalid session ID |
| 404 | Not Found | Session/resource not found |
| 413 | Payload Too Large | File size exceeds limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | AI API down, service degraded |
| 504 | Gateway Timeout | LLM call timeout |

---

## Rate Limiting

**Limits:**
- 100 requests/minute per IP
- 1000 requests/hour per IP

**Headers in Response:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1653492600
```

---

## Session Lifecycle

```
1. POST /upload → Creates session (UUID)
2. GET /preview → Uses session
3. POST /analysis/screen → Populates session with analysis data
4. POST /interview/generate OR /feedback/generate → Adds interview/feedback data
5. POST /report/generate → Adds report
6. GET /report/download → Exports report
7. Auto-delete after 24 hours (SESSION_TIMEOUT_HOURS)
```

---

**API Version:** v1  
**Last Updated:** 2026-05-25  
**Documentation Generated:** 2026-05-25

package com.resumescreener.controller;

import com.resumescreener.dto.AnalysisRequest;
import com.resumescreener.dto.AnalysisResponse;
import com.resumescreener.dto.ErrorResponse;
import com.resumescreener.model.Session;
import com.resumescreener.service.AIOrchestrationService;
import com.resumescreener.service.SessionManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analysis")
@CrossOrigin(origins = "${cors.allowed.origins:http://localhost:4200}")
@Slf4j
public class AnalysisController {

    @Autowired
    private AIOrchestrationService aiService;

    @Autowired
    private SessionManager sessionManager;

    @PostMapping("/screen")
    public ResponseEntity<?> analyzeResume(@RequestBody AnalysisRequest request) {
        log.info("Analysis request received for session: {}", request.getSessionId());
        long startTime = System.currentTimeMillis();

        try {
            Session session = sessionManager.getSession(request.getSessionId());

            // LLM Call 1: Resume Extraction
            var extractionResult = aiService.analyzeResume(
                request.getResumeText(),
                request.getJobDescription()
            );
            session.setExtractionResult(extractionResult);

            // Conditional LLM Calls 2A/2B + 3
            aiService.processCandidate(session);

            session.setTotalProcessingTimeMs(System.currentTimeMillis() - startTime);
            sessionManager.updateSession(session);

            log.info("Analysis completed in {}ms", session.getTotalProcessingTimeMs());
            return ResponseEntity.ok(new AnalysisResponse(session));

        } catch (Exception e) {
            log.error("Analysis failed", e);
            return ResponseEntity.status(500).body(new ErrorResponse(
                "Analysis failed: " + e.getMessage(),
                500
            ));
        }
    }

    @GetMapping("/{sessionId}/results")
    public ResponseEntity<?> getResults(@PathVariable String sessionId) {
        try {
            Session session = sessionManager.getSession(sessionId);
            return ResponseEntity.ok(new AnalysisResponse(session));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(new ErrorResponse(e.getMessage(), 404));
        }
    }
}

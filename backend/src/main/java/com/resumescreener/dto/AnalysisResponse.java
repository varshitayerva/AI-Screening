package com.resumescreener.dto;

import com.resumescreener.model.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class AnalysisResponse {

    private String sessionId;
    private ResumeExtractionResult extractedData;
    private List<InterviewQuestion> interviewQuestions;
    private RejectionGuidance rejectionGuidance;
    private RecruiterSummary recruiterSummary;
    private long processingTimeMs;

    public AnalysisResponse(Session session) {
        this.sessionId = session.getId();
        this.extractedData = session.getExtractionResult();
        this.interviewQuestions = session.getInterviewQuestions();
        this.rejectionGuidance = session.getRejectionGuidance();
        this.recruiterSummary = session.getRecruiterSummary();
        this.processingTimeMs = session.getTotalProcessingTimeMs();
    }
}
